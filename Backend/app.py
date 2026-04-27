# =======================
# Imports
# =======================
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Dense
import numpy as np
from PIL import Image
import os

# =======================
# Flask App Setup
# =======================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})   # Fix CORS

app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# =======================
# Patch Dense (Fix Keras Error)
# =======================
_original_dense_from_config = Dense.from_config

def dense_from_config_patched(config):
    config.pop('quantization_config', None)
    return _original_dense_from_config(config)

Dense.from_config = dense_from_config_patched

# =======================
# Load Model
# =======================
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "healthcare_model.keras")
# your model file

model = load_model(MODEL_PATH, compile=False)
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

print("Model loaded successfully ✅")

# =======================
# Classes
# =======================
classes = [
    "bone_fractured",
    "bone_not_fractured",
    "brain_glioma",
    "brain_meningioma",
    "brain_no_tumor",
    "brain_pituitary",
    "chest_NORMAL",
    "chest_PNEUMONIA",
    "kidney_Cyst",
    "kidney_Normal",
    "kidney_Stone",
    "kidney_Tumor",
    "liver_Cirrhosis",
    "liver_No_Fibrosis",
    "liver_Periportal_Fibrosis",
    "liver_Portal_Fibrosis",
    "liver_Septal_Fibrosis"
]

# =======================
# Routes
# =======================

@app.route('/')
def home():
    return "Backend Running 🚀"

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    img_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(img_path)

    try:
        img = Image.open(img_path).convert("RGB")
        img = img.resize((224, 224))

        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        index = np.argmax(prediction)
        confidence = float(np.max(prediction)) * 100

        return jsonify({
            "prediction": classes[index],
            "confidence": round(confidence, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

# =======================
# Run Server
# =======================
if __name__ == "__main__":
    app.run(debug=False)   # ❗ important (no auto-restart)

import os

port = int(os.environ.get("PORT", 10000))
app.run(host="0.0.0.0", port=port)