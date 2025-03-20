# Garuda 4.0 Deployment Guide

This guide provides instructions for deploying the Garuda 4.0 application in both development and production environments.

## Prerequisites

Before deploying Garuda 4.0, ensure you have the following:

- Python 3.8 or higher
- pip (Python package manager)
- Git (for cloning the repository)
- Sufficient disk space for the application and its dependencies (~500MB)
- Internet connectivity for API access

## Local Development Deployment

### 1. Clone the Repository

```bash
git clone <repository-url>
cd garuda4.0
```

### 2. Set Up a Virtual Environment

#### On Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

#### On macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Train the Models

This step is required before starting the application for the first time:

```bash
python models/train_models.py
```

> **Note**: The training process may take a few minutes depending on your system's performance.

### 5. Start the Development Server

```bash
python app.py
```

The application will be available at `http://localhost:5000`.

## Production Deployment

For production environments, additional steps are recommended for security, performance, and reliability.

### 1. Set Up the Environment

Follow steps 1-4 from the Local Development Deployment, then proceed with the following steps.

### 2. Configure Environment Variables (Recommended)

While the application works with hardcoded API keys, it's best practice to use environment variables in production:

#### On Windows:

```bash
set GROQ_API_KEY_PRIMARY=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
set GROQ_API_KEY_SECONDARY=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
set FLASK_SECRET_KEY=<generate-a-secure-random-key>
```

#### On macOS/Linux:

```bash
export GROQ_API_KEY_PRIMARY=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
export GROQ_API_KEY_SECONDARY=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
export FLASK_SECRET_KEY=<generate-a-secure-random-key>
```

### 3. Update API Configuration (Optional)

If you're using environment variables, modify `api/llm_service.py` to use them:

```python
# Replace the hardcoded API keys with:
self.api_keys = [
    os.environ.get("GROQ_API_KEY_PRIMARY", "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"),
    os.environ.get("GROQ_API_KEY_SECONDARY", "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")
]
```

And update `app.py` to use the environment variable for the secret key:

```python
app.secret_key = os.environ.get("FLASK_SECRET_KEY", os.urandom(24))
```

### 4. Deploy with Gunicorn (Linux/macOS)

For production use, we recommend using Gunicorn as the WSGI server:

```bash
pip install gunicorn
gunicorn app:app -w 4 -b 0.0.0.0:8000
```

The application will be available at `http://your-server-ip:8000`.

### 5. Deploy with Waitress (Windows)

For Windows production environments, Waitress is a good alternative:

```bash
pip install waitress
waitress-serve --port=8000 app:app
```

### 6. Set Up a Reverse Proxy (Recommended)

For production, it's recommended to use Nginx or Apache as a reverse proxy in front of your application:

#### Example Nginx Configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7. Set Up SSL/TLS (Highly Recommended)

For production, secure your application with HTTPS using Let's Encrypt:

```bash
# Install certbot (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain and install certificate
sudo certbot --nginx -d your-domain.com
```

## Cloud Deployment Options

### Deploy on Heroku

1. Create a `Procfile` in the root directory:

```
web: gunicorn app:app
```

2. Create a `runtime.txt` file:

```
python-3.9.7
```

3. Deploy using the Heroku CLI:

```bash
heroku login
heroku create garuda-4-app
git push heroku main
```

### Deploy on AWS

1. Set up an EC2 instance with Python installed
2. Clone the repository and follow the production deployment steps
3. Set up an Elastic IP and associate it with your instance
4. Configure security groups to allow traffic on port 80/443

### Deploy on Google Cloud

1. Create a `app.yaml` file:

```yaml
runtime: python39
entrypoint: gunicorn -b :$PORT app:app
```

2. Deploy using gcloud CLI:

```bash
gcloud app deploy
```

## Database Considerations

The application uses SQLite by default, which is suitable for small to medium deployments. For larger production deployments, consider:

1. Regularly backing up the SQLite database file
2. Migrating to a more robust database like PostgreSQL or MySQL for high-traffic scenarios

## Monitoring and Maintenance

### Logging

Add a logging configuration to app.py for better monitoring:

```python
import logging
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Regular Maintenance

1. Periodically check for updates to dependencies and apply them
2. Monitor API usage to avoid hitting rate limits
3. Back up the database regularly
4. Monitor disk space, especially if the database grows large
5. Periodically retrain the ML models with new data if available

## Troubleshooting Deployment Issues

### Application Fails to Start

1. Check if all dependencies are installed:

```bash
pip install -r requirements.txt
```

2. Verify model files exist in the correct location:

```bash
ls -la models/trained_models/
```

3. Check application logs for specific errors

### API Connection Issues

1. Verify internet connectivity
2. Check if API keys are valid
3. Monitor API rate limits and usage

### Performance Issues

1. Monitor memory usage and scale accordingly
2. Consider using a more powerful database for high-traffic scenarios
3. Implement caching for frequently accessed data

## Scaling the Application

For higher traffic loads:

1. Use multiple Gunicorn workers:

```bash
gunicorn app:app -w <number-of-cores*2+1>
```

2. Consider deploying behind a load balancer with multiple instances
3. Implement Redis or Memcached for session management and caching
4. Move to a more robust database system

---

For additional assistance with deployment, contact the development team or refer to the technical documentation.
