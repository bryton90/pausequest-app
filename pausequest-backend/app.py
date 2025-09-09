from flask import Flask, jsonify, request
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize VADER sentiment analyzer
analyzer = SentimentIntensityAnalyzer()

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the PauseQuest Backend!"})

# New API endpoint to log break data and perform sentiment analysis
@app.route('/log-break', methods=['POST'])
def log_break():
    if request.method == 'POST':
        data = request.json

        # Check if the required data fields exist
        if not data or 'breakType' not in data or 'mood' not in data:
            return jsonify({"error": "Invalid request body"}), 400

        break_type = data.get('breakType')
        mood = data.get('mood')

        # Perform sentiment analysis on the mood
        vs = analyzer.polarity_scores(mood)
        sentiment_score = vs['compound']

        # Print the data to the console for now
        print(f"Received break log: Type='{break_type}', Mood='{mood}', Sentiment Score='{sentiment_score}'")

        # Return the sentiment score to the frontend
        return jsonify({
            "message": "Break logged successfully!",
            "sentiment_score": sentiment_score
        }), 200

    # Return a "Method Not Allowed" error if not a POST request
    return jsonify({"message": "Method not allowed"}), 405

if __name__ == '__main__':
    app.run(debug=True)
