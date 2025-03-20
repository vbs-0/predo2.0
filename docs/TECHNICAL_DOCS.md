# Garuda 4.0 Technical Documentation

This technical documentation provides a comprehensive overview of the Garuda 4.0 system architecture, components, and implementation details.

## System Architecture

Garuda 4.0 follows a typical web application architecture with the following components:

1. **Frontend Layer**: HTML, CSS, JavaScript
2. **Backend Layer**: Flask web server, SQLite database
3. **ML Layer**: Scikit-learn models, data processing
4. **External API Integration**: Groq LLM API

### Architecture Diagram

```
┌───────────────┐     ┌─────────────────────────┐     ┌──────────────┐
│               │     │                         │     │              │
│   Browser     │<───>│   Flask Web Server      │<───>│  SQLite DB   │
│   (Client)    │     │   (app.py)              │     │              │
│               │     │                         │     └──────────────┘
└───────────────┘     └─────────────────────────┘
                                 ▲
                                 │
                      ┌──────────┴───────────┐
                      │                      │
              ┌───────┴────────┐    ┌────────┴───────┐
              │                │    │                │
              │  ML Models     │    │  Groq LLM API  │
              │                │    │                │
              └────────────────┘    └────────────────┘
```

## Component Details

### 1. Frontend Components

#### HTML Structure (templates/index.html)

- Main sections: Header, Hero, Predictor, Chatbot, History, About, Footer
- Responsive design with mobile compatibility
- Bootstrap integration for grid layout and components

#### CSS Styling (static/css/style.css)

- Custom variables for consistent theming
- Responsive design with media queries
- Animations and transitions for UI elements
- CSS Grid and Flexbox for layouts

#### JavaScript (static/js/app.js)

- Event handlers for user interactions
- Fetch API for backend communication
- DOM manipulation for dynamic content
- Animations and visual feedback

### 2. Backend Components

#### Flask Application (app.py)

- Main application entry point
- Route definitions
- Request handling
- Database operations
- API integration

#### API Integration (api/llm_service.py)

- Groq LLM API client
- API key management and rotation
- Request/response handling
- Error handling and fallback mechanisms

#### Database Schema (SQLite)

- **Predictions Table**:

  - id (INTEGER, PRIMARY KEY)
  - food_name (TEXT)
  - food_data (TEXT, JSON)
  - prediction_results (TEXT, JSON)
  - timestamp (DATETIME)

- **Chat History Table**:
  - id (INTEGER, PRIMARY KEY)
  - session_id (TEXT)
  - user_message (TEXT)
  - bot_response (TEXT)
  - timestamp (DATETIME)

### 3. ML Components

#### Model Training (models/train_models.py)

- Data loading and preprocessing
- Feature extraction
- Model training and evaluation
- Model selection
- Performance visualization

#### Prediction Utility (models/predict.py)

- Model loading
- Input preprocessing
- Prediction generation
- Result formatting

#### Model Details

- **Algorithms Tested**:
  - Logistic Regression
  - Random Forest
  - Gradient Boosting
  - Support Vector Machine
- **Target Variables**:
  - impact_on_cramps
  - impact_on_bloating
  - impact_on_headache
  - impact_on_mood_swings
  - impact_on_fatigue
  - impact_on_acne
- **Evaluation Metrics**:
  - Accuracy
  - Precision
  - Recall
  - F1 Score
  - ROC AUC

## API Endpoints

### 1. `/predict` (POST)

- **Description**: Predicts the impact of a food on menstrual symptoms
- **Request Body**:
  ```json
  {
    "food_name": "string"
  }
  ```
- **Response**:
  ```json
  {
    "food_data": {
      "food_name": "string",
      "food_category": "string",
      "food_subcategory": "string",
      "processing_level": "string",
      "caffeine_content_mg": "number",
      "flavor_profile": "string",
      "common_allergens": "string",
      "glycemic_index": "number",
      "inflammatory_index": "number",
      "calories_kcal": "number"
    },
    "prediction_results": {
      "impact_on_cramps": "string",
      "impact_on_bloating": "string",
      "impact_on_headache": "string",
      "impact_on_mood_swings": "string",
      "impact_on_fatigue": "string",
      "impact_on_acne": "string"
    }
  }
  ```

### 2. `/chat` (POST)

- **Description**: Sends a message to the AI chatbot
- **Request Body**:
  ```json
  {
    "message": "string"
  }
  ```
- **Response**:
  ```json
  {
    "response": "string"
  }
  ```

### 3. `/history` (GET)

- **Description**: Retrieves prediction history
- **Response**:
  ```json
  {
    "history": [
      {
        "food_name": "string",
        "results": {
          "impact_on_cramps": "string",
          "impact_on_bloating": "string",
          "impact_on_headache": "string",
          "impact_on_mood_swings": "string",
          "impact_on_fatigue": "string",
          "impact_on_acne": "string"
        },
        "timestamp": "string"
      }
    ]
  }
  ```

## External API Integration

### Groq LLM API

The application integrates with Groq's API to analyze food attributes and provide conversational AI capabilities.

#### API Configuration

- **Base URL**: https://api.groq.com/openai/v1
- **Model**: llama-3.3-70b-versatile
- **Primary API Key**: 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
- **Secondary API Key**: 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

#### API Endpoints Used

- `/chat/completions` - Used for both food attribute analysis and chatbot functionality

#### Implementation Details

- Automatic fallback to secondary API key if primary fails
- Retry mechanism for failed requests
- Default values for when API fails to provide complete information
- JSON parsing and error handling

## Deployment

### Local Deployment

- Flask development server
- Command: `python app.py`
- Accessible at: http://localhost:5000

### Production Deployment

- Gunicorn WSGI server
- Command: `gunicorn app:app`
- Considerations:
  - Environment variables for API keys
  - Proper error handling
  - Logging configuration
  - HTTPS setup

## Security Considerations

1. **API Key Management**:

   - API keys are hardcoded in the current implementation
   - For production, these should be moved to environment variables

2. **Input Validation**:

   - All user inputs are validated before processing
   - SQL injection protection through SQLite parameterized queries

3. **Error Handling**:

   - Graceful error handling to prevent exposing sensitive information
   - Default responses when external services fail

4. **Data Protection**:
   - No personal identifiable information (PII) is collected
   - Session management uses secure cookies
   - Database access is properly encapsulated

## Performance Optimization

1. **Lazy Loading**:

   - ML models are loaded only when needed to reduce startup time
   - Background tasks for non-critical operations

2. **Caching**:

   - Prediction results are cached in the database
   - Frequently accessed data is cached in memory

3. **Efficient Queries**:
   - Database queries are optimized
   - Limits on history retrieval to prevent large result sets

## Future Enhancements

1. **User Accounts**:

   - Optional user accounts for personalized recommendations
   - Sync history across devices

2. **Advanced Analytics**:

   - Trend analysis of foods and their impacts
   - Personalized recommendations based on user history

3. **Mobile App**:

   - Native mobile applications for iOS and Android
   - Offline functionality

4. **Expanded Dataset**:

   - Continuous training with more food items
   - User feedback incorporation for model improvement

5. **Meal Planning**:
   - Recommend meals based on desired health impacts
   - Meal combinations with optimal nutrition profile

## Troubleshooting

1. **Model Loading Errors**:

   - Ensure model files exist in models/trained_models/
   - Check for compatibility issues with scikit-learn version

2. **API Connection Issues**:

   - Verify internet connectivity
   - Check API key validity
   - Review API rate limits

3. **Database Errors**:
   - Check file permissions for SQLite database
   - Verify database schema is correctly created
   - Monitor database size and implement cleanup if needed

## Development Workflow

1. **Setup Development Environment**:

   - Clone repository
   - Install dependencies
   - Set up virtual environment

2. **Local Testing**:

   - Run Flask in development mode
   - Test API endpoints with Postman or similar
   - Debug using Flask's debug mode

3. **Adding New Features**:

   - Update backend logic
   - Update frontend components
   - Test integration
   - Document changes

4. **Deployment**:
   - Train and save ML models
   - Configure environment
   - Deploy using Gunicorn or similar
   - Verify functionality

---

This documentation is intended for developers and technical users. For end-user documentation, please refer to the USER_GUIDE.md file.
