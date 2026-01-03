from datetime import date

from flask import Flask, jsonify, request
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from extensions import db
from models import User
from middleware import token_required

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///breaks.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "change-me-in-prod"  # TODO: move to env var

db.init_app(app)

analyzer = SentimentIntensityAnalyzer()

with app.app_context():
    db.create_all()


class BreakLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    break_type = db.Column(db.String(50), nullable=False)
    mood_description = db.Column(db.String(200), nullable=False)
    sentiment_score = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<BreakLog {self.id}: {self.break_type} - Sentiment: {self.sentiment_score}>'

class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    focus_duration = db.Column(db.Integer, nullable=False)  # seconds
    break_duration = db.Column(db.Integer, nullable=False)  # seconds
    mood_emoji = db.Column(db.String(10))
    notes = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "date": self.date.isoformat() if self.date else None,
            "focus_duration": self.focus_duration,
            "break_duration": self.break_duration,
            "mood_emoji": self.mood_emoji,
            "notes": self.notes,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }

    def __repr__(self):
        return f'<Session {self.id}: Focus {self.focus_duration}s, Break {self.break_duration}s>'

@app.route('/')
def home():
    return jsonify({"message": "Welcome to PauseQuest!"})

# ---------------------------------------------------------------------------
# Authentication routes
# ---------------------------------------------------------------------------

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400

    user = User(email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or not user.check_password(data.get('password', '')):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = user.generate_auth_token()
    return jsonify({'token': token, 'user': {'id': user.id, 'email': user.email}})

# ---------------------------------------------------------------------------
# Break logging route (public)
# ---------------------------------------------------------------------------

@app.route('/log-break', methods=['POST'])
def log_break():
    if request.method == 'POST':
        data = request.json

       
        if not data or 'breakType' not in data or 'mood' not in data:
            return jsonify({"error": "Invalid request body"}), 400

        break_type = data.get('breakType')
        mood = data.get('mood')

        vs = analyzer.polarity_scores(mood)
        sentiment_score = vs['compound']

        new_log = BreakLog(
            break_type=break_type,
            mood_description=mood,
            sentiment_score=sentiment_score
        )
        db.session.add(new_log)
        db.session.commit()

        # Analyze recent history
        recent_logs = BreakLog.query.order_by(BreakLog.timestamp.desc()).limit(5).all()
        average_sentiment = sum(log.sentiment_score for log in recent_logs) / len(recent_logs) if recent_logs else 0

        # Generate recommendation
        if average_sentiment < -0.1:
            recommendation = "Your recent mood trend suggests a short meditation or stretch break would be beneficial!"
        else:
            recommendation = "Great work! Keep your energy high with a quick water break."

        print(f"Received break log: Type='{break_type}', Mood='{mood}', Sentiment Score='{sentiment_score}'")

        return jsonify({
            "message": "Break logged successfully!",
            "sentiment_score": sentiment_score,
            "recommendation": recommendation
        }), 200

    return jsonify({"message": "Method not allowed"}), 405

@app.route('/api/session-public', methods=['POST'])
def create_session_public():
    if request.method == 'POST':
        data = request.json
        
        if not data or 'focus_duration' not in data or 'break_duration' not in data:
            return jsonify({"error": "Invalid request body"}), 400

        from datetime import date
        
        new_session = Session(
            user_id=1,  # Default user for demo
            date=date.today(),
            focus_duration=data.get('focus_duration', 0),
            break_duration=data.get('break_duration', 0),
            mood_emoji=data.get('mood_emoji'),
            notes=data.get('notes'),
        )
        db.session.add(new_session)
        db.session.commit()

        print(f"Created session: Focus {new_session.focus_duration}s, Break {new_session.break_duration}s")
        
        return jsonify({
            "message": "Session created successfully!",
            "session": new_session.to_dict()
        }), 201

    return jsonify({"message": "Method not allowed"}), 405

@app.route('/api/session', methods=['POST'])
@token_required
def create_session(current_user):
    if request.method == 'POST':
        data = request.json
        
        if not data or 'focus_duration' not in data or 'break_duration' not in data:
            return jsonify({"error": "Invalid request body"}), 400

        from datetime import date
        
        new_session = Session(
            user_id=current_user.id,
            date=date.today(),
            focus_duration=data.get('focus_duration', 0),
            break_duration=data.get('break_duration', 0),
            mood_emoji=data.get('mood_emoji'),
            notes=data.get('notes'),
        )
        db.session.add(new_session)
        db.session.commit()

        print(f"Created session: Focus {new_session.focus_duration}s, Break {new_session.break_duration}s")
        
        return jsonify({
            "message": "Session created successfully!",
            "session": new_session.to_dict()
        }), 201

    return jsonify({"message": "Method not allowed"}), 405

@app.route('/api/session-history-public', methods=['GET'])
def get_session_history_public():
    if request.method == 'GET':
        limit = request.args.get('limit', 10, type=int)
        
        # For demo purposes, return all sessions (in production, you'd filter by user)
        sessions = Session.query.order_by(Session.date.desc()).limit(limit).all()
        
        sessions_list = [session.to_dict() for session in sessions]
        
        # Calculate totals for donut chart
        total_focus = sum(s.focus_duration for s in sessions)
        total_break = sum(s.break_duration for s in sessions)
        
        return jsonify({
            "sessions": sessions_list,
            "totals": {
                "focus_duration": total_focus,
                "break_duration": total_break
            }
        }), 200

    return jsonify({"message": "Method not allowed"}), 405

@app.route('/api/session-history', methods=['GET'])
@token_required
def get_session_history(current_user):
    if request.method == 'GET':
        limit = request.args.get('limit', 10, type=int)
        
        sessions = Session.query.filter_by(user_id=current_user.id).order_by(Session.date.desc()).limit(limit).all()
        
        sessions_list = [session.to_dict() for session in sessions]
        
        # Calculate totals for donut chart
        total_focus = sum(s.focus_duration for s in sessions)
        total_break = sum(s.break_duration for s in sessions)
        
        return jsonify({
            "sessions": sessions_list,
            "totals": {
                "focus_duration": total_focus,
                "break_duration": total_break
            }
        }), 200

    return jsonify({"message": "Method not allowed"}), 405

if __name__ == '__main__':
    app.run(debug=True)
