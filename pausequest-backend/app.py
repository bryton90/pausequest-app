from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, request
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app) 

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///breaks.db' 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

analyzer = SentimentIntensityAnalyzer()

db = SQLAlchemy(app)

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

@app.route('/')
def home():
    return jsonify({"message": "Welcome to PauseQuest!"})

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

if __name__ == '__main__':
    app.run(debug=True)
