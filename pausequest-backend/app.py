from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the PauseQuest Backend!"})

if __name__ == '__main__':
    app.run(debug=True)

    from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the PauseQuest Backend!"})

# New API endpoint to log break data
@app.route('/log-break', methods=['POST'])
def log_break():
    if request.method == 'POST':
        data = request.json
        break_type = data.get('breakType')
        mood = data.get('mood')
        
        # Here, we would save this data to our database
        print(f"Received break log: Type='{break_type}', Mood='{mood}'")
        
        return jsonify({"message": "Break logged successfully!"}), 200

if __name__ == '__main__':
    app.run(debug=True)