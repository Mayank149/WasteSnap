from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Load the model
model = tf.keras.models.load_model('wastesnap_model.h5')

# Waste categories
WASTE_CATEGORIES = [
    "Plastic waste",
    "Paper and cardboard waste",
    "Glass waste",
    "Metal waste",
    "Organic waste",
    "Electronic waste",
    "Medicinal waste",
    "Hazardous waste",
    "General waste"
]

# Recyclability status for each category
RECYCLABILITY_STATUS = {
    "Plastic waste": "recyclable",
    "Paper and cardboard waste": "recyclable",
    "Glass waste": "recyclable",
    "Metal waste": "recyclable",
    "Organic waste": "non_recyclable",
    "Electronic waste": "non_recyclable",
    "Medicinal waste": "non_recyclable",
    "Hazardous waste": "non_recyclable",
    "General waste": "non_recyclable"
}

# Disposal tips for each waste type
DISPOSAL_TIPS = {
    "Plastic waste": [
        "Clean and dry plastic items before recycling",
        "Check the recycling number on the item (1-7)",
        "Remove any non-plastic components",
        "Flatten containers to save space",
        "Check local recycling guidelines for specific types"
    ],
    "Paper and cardboard waste": [
        "Remove any plastic or metal components",
        "Flatten cardboard boxes",
        "Keep paper dry and clean",
        "Remove any food residue",
        "Separate colored and white paper if required"
    ],
    "Glass waste": [
        "Rinse containers thoroughly",
        "Remove metal caps and lids",
        "Check for local glass recycling programs",
        "Handle broken glass with care",
        "Separate by color if required"
    ],
    "Metal waste": [
        "Clean and dry metal items",
        "Remove any non-metal components",
        "Flatten cans to save space",
        "Check for local metal recycling programs",
        "Separate different types of metals if possible"
    ],
    "Organic waste": [
        "Compost if possible",
        "Use a dedicated organic waste bin",
        "Keep it separate from other waste",
        "Avoid mixing with non-organic materials",
        "Consider home composting for food waste"
    ],
    "Electronic waste": [
        "Find local e-waste collection points",
        "Remove batteries if possible",
        "Back up and wipe data from devices",
        "Check for manufacturer take-back programs",
        "Never dispose in regular waste bins"
    ],
    "Medicinal waste": [
        "Return to pharmacy if possible",
        "Follow local medication disposal guidelines",
        "Never flush down the toilet",
        "Keep in original container",
        "Check for drug take-back programs"
    ],
    "Hazardous waste": [
        "Find local hazardous waste collection points",
        "Keep in original containers",
        "Never mix different types",
        "Follow safety guidelines",
        "Contact local waste management for proper disposal"
    ],
    "General waste": [
        "Ensure proper bagging",
        "Check local waste collection schedules",
        "Minimize waste where possible",
        "Consider waste reduction strategies",
        "Follow local waste management guidelines"
    ]
}

def preprocess_image(image_bytes):
    # Convert bytes to image
    image = Image.open(io.BytesIO(image_bytes))
    # Resize to match model input size
    image = image.resize((224, 224))
    # Convert to array and normalize
    image_array = np.array(image) / 255.0
    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    try:
        # Get image file
        image_file = request.files['image']
        image_bytes = image_file.read()
        
        # Preprocess image
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_category = WASTE_CATEGORIES[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))
        
        # Get recyclability status and tips
        recyclability = RECYCLABILITY_STATUS[predicted_category]
        tips = DISPOSAL_TIPS[predicted_category]
        
        return jsonify({
            'category': predicted_category,
            'recyclability': recyclability,
            'confidence': confidence,
            'tips': tips
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Run the app on all network interfaces (0.0.0.0) and specified port
    app.run(host='0.0.0.0', port=port, debug=True) 