from flask import Flask, request, jsonify

app = Flask(__name__)

# Simulated registered users (Replace with a real database)
registered_users = {"12345": "Aditya Bapat" , "12346": "Abhinav singh", "12347": "Rishi" }

@app.route('/verify_face', methods=['POST'])
def verify_face():
    data = request.json
    image = data.get("image")

    if not image:
        return jsonify({"verified": False, "message": "No image received"}), 400

    
    voter_id = "12345"  # Example voter ID for testing
    if voter_id in registered_users:
        return jsonify({"verified": True, "voter_id": voter_id, "name": registered_users[voter_id]})
    else:
        return jsonify({"verified": False})

@app.route('/vote', methods=['POST'])
def vote():
    data = request.json
    voter_id = data.get("voter_id")

    if voter_id in registered_users:
        return jsonify({"status": "success", "message": f"Vote cast by {registered_users[voter_id]}"}), 200
    else:
        return jsonify({"status": "error", "message": "Unauthorized voter"}), 403

if __name__ == '__main__':
    app.run(debug=True)
