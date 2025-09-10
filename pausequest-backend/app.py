from flask_sqlalchemy import SQLAlchemy
from flask import Flask, jsonify, request
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///breaks.db' # Creates a breaks.db file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

analyzer = SentimentIntensityAnalyzer()

db = SQLAlchemy(app)

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
    return jsonify({"message": "Welcome to the PauseQuest Backend!"})

@app.route('/log-break', methods=['POST'])
def log_break():
    if request.method == 'POST':
        data = request.json

        # Check if the required data fields exist
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

        print(f"Received break log: Type='{break_type}', Mood='{mood}', Sentiment Score='{sentiment_score}'")

        return jsonify({
            "message": "Break logged successfully!",
            "sentiment_score": sentiment_score
        }), 200

    return jsonify({"message": "Method not allowed"}), 405

if __name__ == '__main__':
    app.run(debug=True)
