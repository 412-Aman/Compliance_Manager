# Backend - Compliance Engine API

FastAPI-based backend for behavioral anomaly detection and regulatory monitoring.

## Setup

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt  # or install from pyproject.toml
```

## Run

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Visit http://localhost:8000/docs for interactive Swagger UI.

## Key Features

- SQLAlchemy ORM with SQLite (swappable to PostgreSQL)
- WebSocket support for real-time alerts
- Regulatory source polling with BeautifulSoup
- Comprehensive audit logging
- Pydantic validation for all endpoints
