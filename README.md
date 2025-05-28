# WasteSnap - AI-Powered Waste Classification

WasteSnap is a web application that uses artificial intelligence to classify waste items as recyclable or non-recyclable. The application provides users with smart disposal tips and promotes environmental awareness through an engaging interface.

## Features

- 📷 Camera integration for instant waste classification
- 📁 Image upload support
- 🤖 AI-powered waste classification
- ♻️ Recyclable/Non-recyclable indicators
- 💡 Smart disposal tips
- 🌿 Eco-friendly design
- 📱 Mobile-responsive interface

## Tech Stack

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Flask (Python)
- AI: TensorFlow
- Deployment: Render

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wastesnap.git
cd wastesnap
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application locally:
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
   - Python Version: 3.8

## Project Structure

```
wastesnap/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── wastesnap_model.h5 # Trained model
├── static/
│   ├── styles.css     # Styles
│   └── script.js      # Frontend logic
└── templates/
    └── index.html     # Main page
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 