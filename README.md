# WasteSnap - Smart Waste Classification

WasteSnap is an intelligent waste classification application that uses machine learning to identify different types of waste and provide appropriate disposal recommendations. The application helps users make informed decisions about waste management and promotes sustainable practices.

## Features

- 📸 Real-time waste classification through image upload or camera capture
- 🔄 Support for multiple waste categories:
  - Plastic waste
  - Paper and cardboard waste
  - Glass waste
  - Metal waste
  - Organic waste
  - Electronic waste
  - Medicinal waste
  - Hazardous waste
  - General waste
- 📊 Confidence score for predictions
- 💡 Detailed disposal tips for each waste type
- 📱 Mobile-responsive design
- 🌱 Environmental awareness quotes

## Tech Stack

- **Backend:**
  - Python
  - Flask
  - TensorFlow
  - Gunicorn

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
  - Responsive Design

## Project Structure

```
WasteSnap/
├── app.py                    # Flask application
├── requirements.txt          # Python dependencies
├── gunicorn.conf.py         # Gunicorn configuration
├── render.yaml              # Render deployment config
├── wastesnap_model.h5       # ML model
├── static/
│   ├── css/
│   │   └── styles.css       # Styles
│   └── js/
│       └── script.js        # Frontend logic
└── templates/
    └── index.html           # Main template
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/WasteSnap.git
   cd WasteSnap
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Deployment

The application is configured for deployment on Render. The `render.yaml` file contains the necessary configuration for automatic deployment.

## Environment Variables

- `FLASK_ENV`: Set to 'production' for deployment
- `PORT`: Port number (default: 5000)
- `MODEL_PATH`: Path to the ML model file

## Contributing

This is a solo project created by Mayank Bansal. While contributions are welcome, please note that this is primarily a personal project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Creator

**Mayank Bansal**
- Developer and Machine Learning Engineer in making
- Created and maintained as a solo project

## Acknowledgments

- TensorFlow team for the machine learning framework
- Flask team for the web framework
- All open-source contributors whose work made this project possible

---

Made with ❤️ by Mayank Bansal 