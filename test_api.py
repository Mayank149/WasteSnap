import requests
import json
import os
from PIL import Image
import io

def test_health():
    response = requests.get('http://localhost:5000/health')
    print("\nTesting Health Endpoint:")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

def test_prediction(image_path):
    print("\nTesting Prediction Endpoint:")
    
    # Check if image exists
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return
    
    # Open and prepare image
    with open(image_path, 'rb') as img:
        files = {'file': img}
        response = requests.post('http://localhost:5000/predict', files=files)
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print("\nPrediction Results:")
        print(f"Predicted Class: {result['prediction']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print("\nAll Probabilities:")
        for label, prob in result['all_probabilities'].items():
            print(f"{label}: {prob:.2%}")
    else:
        print(f"Error: {response.json()}")

if __name__ == "__main__":
    # Test health endpoint
    test_health()
    
    # Test prediction with a sample image
    # Replace 'test_image.jpg' with your actual test image path
    test_prediction('test_image.jpg') 