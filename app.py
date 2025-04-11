from flask import Flask, request, jsonify, session
import face_recognition
import os
import base64
import cv2
import numpy as np

app = Flask(__name__, static_url_path='/static')
app.secret_key = "supersecretkey"  # Required for session

# Registered users - Aadhaar mapped
registered_users = {
    "12345": "Aditya Bapat",
    "12346": "Abhinav Singh",
    "1234123412341234": "Rishi"
}

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    aadhaar_number = data.get("adhar_Number", "").replace(" ", "")

    if aadhaar_number in registered_users:
        session["aadhaar"] = aadhaar_number
        return "", 200
    return "Invalid Aadhaar", 403


@app.route('/verify_face', methods=['POST'])
def verify_face():
    data = request.get_json()
    image_base64 = data.get("image")
    aadhaar_number = session.get("aadhaar")

    if not image_base64 or not aadhaar_number:
        return jsonify({"verified": False, "message": "Missing image or Aadhaar"}), 400

    # Decode the image
    image_data = base64.b64decode(image_base64.split(',')[1])
    np_img = np.frombuffer(image_data, np.uint8)
    captured_img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    reference_path = f"static/images/reference_photos/voter_photos/{aadhaar_number}.jpg"
    if not os.path.exists(reference_path):
        return jsonify({"verified": False, "message": "Reference photo not found"}), 404

    # Load reference and captured images
    reference_img = face_recognition.load_image_file(reference_path)
    captured_rgb = cv2.cvtColor(captured_img, cv2.COLOR_BGR2RGB)

    # Encode both images
    ref_encoding = face_recognition.face_encodings(reference_img)
    cap_encoding = face_recognition.face_encodings(captured_rgb)

    if not ref_encoding or not cap_encoding:
        return jsonify({"verified": False, "message": "Face not detected"}), 400

    match = face_recognition.compare_faces([ref_encoding[0]], cap_encoding[0])[0]

    return jsonify({
        "verified": match,
        "voter_id": aadhaar_number,
        "name": registered_users.get(aadhaar_number, "Unknown")
    })


@app.route('/vote', methods=['POST'])
def vote():
    data = request.get_json()
    voter_id = data.get("voter_id")

    if voter_id in registered_users:
        return jsonify({"status": "success", "message": f"Vote cast by {registered_users[voter_id]}"}), 200
    else:
        return jsonify({"status": "error", "message": "Unauthorized voter"}), 403


if __name__ == '__main__':
    app.run(debug=True)
