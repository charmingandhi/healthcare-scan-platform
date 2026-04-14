from tensorflow.keras.models import load_model
from tensorflow.keras.layers import Dense
from tensorflow.keras.utils import deserialize_keras_object
import numpy as np
from PIL import Image
# Patch Dense deserialization to ignore 'quantization_config'
_original_dense_from_config = Dense.from_config

def dense_from_config_patched(config):
    # Remove 'quantization_config' if it exists
    config.pop('quantization_config', None)
    return _original_dense_from_config(config)

Dense.from_config = dense_from_config_patched

# Now load your model
model = load_model('healthcare_model.keras', compile=False)

# Recompile manually if needed
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

print("Model loaded successfully ✅")

# Classes
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

# Test image
img_path = "1-rotated1-rotated3-rotated1-rotated1.jpg"

img = Image.open(img_path).convert("RGB")
img = img.resize((224, 224))

img_array = np.array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

# Prediction
prediction = model.predict(img_array)

index = np.argmax(prediction)
confidence = float(np.max(prediction)) * 100

print("\nPrediction:", classes[index])
print("Confidence:", round(confidence, 2), "%")