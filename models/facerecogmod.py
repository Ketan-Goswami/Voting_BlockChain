import cv2
import face_recognition
import os
import numpy as np
import pickle

# Updated path for training images
KNOWN_FACES_DIR = "static/images/reference_photos/voter_photos"
ENCODINGS_FILE = "face_encodings.pkl"
TOLERANCE = 0.6  # Lower = more strict matching
MODEL = "hog"  

def encode_faces():
    known_faces = []
    known_names = []

    for name in os.listdir(KNOWN_FACES_DIR):
        person_dir = os.path.join(KNOWN_FACES_DIR, name)
        if not os.path.isdir(person_dir):
            continue
        
        for filename in os.listdir(person_dir):
            filepath = os.path.join(person_dir, filename)
            image = face_recognition.load_image_file(filepath)
            encodings = face_recognition.face_encodings(image)

            if len(encodings) > 0:
                known_faces.append(encodings[0])
                known_names.append(name)
    
    # Save encodings to a file
    with open(ENCODINGS_FILE, "wb") as f:
        pickle.dump((known_faces, known_names), f)
    
    print(f"Encoded {len(known_faces)} faces successfully.")

def load_encodings():
    if os.path.exists(ENCODINGS_FILE):
        with open(ENCODINGS_FILE, "rb") as f:
            return pickle.load(f)
    return [], []

def recognize_faces():
    known_faces, known_names = load_encodings()

    video_capture = cv2.VideoCapture(0)

    while True:
        ret, frame = video_capture.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame, model=MODEL)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for face_encoding, face_location in zip(face_encodings, face_locations):
            matches = face_recognition.compare_faces(known_faces, face_encoding, TOLERANCE)
            name = "Unknown"

            if True in matches:
                match_index = np.argmin(face_recognition.face_distance(known_faces, face_encoding))
                name = known_names[match_index]

            top, right, bottom, left = face_location
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        cv2.imshow("Face Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    if not os.path.exists(ENCODINGS_FILE):
        encode_faces()
    
    recognize_faces()
