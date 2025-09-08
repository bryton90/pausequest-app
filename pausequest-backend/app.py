from flask import Flask, jsonify, request
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer # Import VADER

app = Flask(__name__)
analyzer = SentimentIntensityAnalyzer() # Initialize the analyzer

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the PauseQuest Backend!"})

# API endpoint to log break data and perform sentiment analysis
@app.route('/log-break', methods=['POST'])
def log_break():
    if request.method == 'POST':
        data = request.json
        break_type = data.get('breakType')
        mood = data.get('mood')

        if not mood: # Basic server-side validation
            return jsonify({"error": "Mood cannot be empty"}), 400

        # Perform sentiment analysis
        sentiment_scores = analyzer.polarity_scores(mood)

        # The 'compound' score is a normalized, weighted composite score
        # It ranges from -1 (most negative) to +1 (most positive)
        sentiment = sentiment_scores['compound']

        # Here, we would save this data (including sentiment) to our database
        print(f"Received break log: Type='{break_type}', Mood='{mood}', Sentiment='{sentiment}'")

        # You could also send the sentiment score back to the frontend if needed
        return jsonify({
            "message": "Break logged successfully!",
            "sentiment": sentiment, # Optionally send sentiment back
            "scores": sentiment_scores # Optionally send all scores back
            }), 200

    # Handle other request methods if necessary, though POST is expected here
    return jsonify({"message": "Method not allowed"}), 405

if __name__ == '__main__':
    # Ensure Flask runs on 0.0.0.0 to be accessible from frontend if they are on different machines
    # For local development on the same machine, 127.0.0.1 is fine, but 0.0.0.0 is more flexible
    app.run(debug=True, host='0.0.0.0')
