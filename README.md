# Garuda 4.0 - Food Impact Predictor

Garuda 4.0 is an AI-powered application that predicts how different foods affect menstrual symptoms like cramps, bloating, headaches, mood swings, fatigue, and acne. The application uses machine learning models trained on a comprehensive dataset of food attributes and their observed effects.

## Features

- **AI-Powered Predictions**: Enter any food item and get predictions on how it might affect six different menstrual symptoms
- **Advanced ML Model**: Trained on a dataset of food recommendations with multiple machine learning models
- **Food Nutritional Analysis**: Utilizes Groq's LLM API to analyze food attributes automatically
- **Interactive Chatbot**: Ask questions about nutrition, menstrual health, and food impacts
- **Prediction History**: Track previous predictions for future reference
- **Modern UI**: Beautiful and responsive design with animations

## Technical Stack

- **Backend**: Flask, SQLite
- **Frontend**: HTML5, CSS3, JavaScript
- **Machine Learning**: scikit-learn, pandas, numpy
- **AI Integration**: Groq LLM API
- **Data Visualization**: matplotlib, seaborn

## Installation and Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup Instructions

1. Clone the repository:

   ```
   git clone <repository-url>
   cd garuda4.0
   ```

2. Create a virtual environment (recommended):

   ```
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Train the models (this may take a few minutes):

   ```
   python models/train_models.py
   ```

5. Start the application:

   ```
   python app.py
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

```
garuda4.0/
├── app.py                 # Main Flask application
├── models/
│   ├── train_models.py    # Model training script
│   ├── predict.py         # Prediction utility
│   └── trained_models/    # Saved ML models
├── api/
│   └── llm_service.py     # Groq LLM API integration
├── static/
│   ├── css/
│   │   └── style.css      # Application styles
│   ├── js/
│   │   └── app.js         # Frontend JavaScript
│   └── images/            # Image assets
├── templates/
│   └── index.html         # Main HTML template
├── data/
│   └── original dataset   # Original dataset
├── docs/                  # Documentation
├── README.md              # Project documentation
└── requirements.txt       # Python dependencies
```

## How It Works

1. **Food Impact Prediction**:

   - User enters a food name in the predictor
   - The system uses Groq API to gather detailed nutritional information
   - This data is passed through the trained ML model
   - Predictions are displayed about the food's impact on menstrual symptoms

2. **Model Training**:

   - The system was trained on a dataset of foods and their impact on menstrual symptoms
   - Multiple ML algorithms were evaluated (Logistic Regression, Random Forest, Gradient Boosting, SVM)
   - The best performing model was selected based on accuracy metrics
   - ROC curves and performance metrics are generated during training

3. **AI Chat Functionality**:
   - Users can ask questions about nutrition, menstrual health, or anything related
   - Questions are processed by Groq's advanced LLM
   - Conversation history is stored for context-aware responses

## API Keys

The application uses the following Groq API keys:

- Primary: "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"
- Secondary: "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"

The application automatically falls back to the secondary key if the primary key fails.

## Deployment

### Local Deployment

For local development and testing, use:

```
python app.py
```

### Production Deployment

For production, you can use Gunicorn:

```
gunicorn app:app
```

## Troubleshooting

**Issue**: Model prediction errors

- Make sure you've run the training script first: `python models/train_models.py`
- Check that the trained model files exist in `models/trained_models/`

**Issue**: API connection errors

- Verify internet connectivity
- Check Groq API key validity
- The system will automatically try the secondary API key if the primary fails

## License

MIT License

## Credits

- Dataset: Menstrual Food Recommendations
- Groq LLM API: https://console.groq.com/docs/
- Icons: Font Awesome
- UI Framework: Bootstrap

## Contact

For questions or support, please create an issue in the repository.
