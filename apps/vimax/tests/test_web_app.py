import pytest
from fastapi.testclient import TestClient
from web_app import app
import os
from dotenv import load_dotenv

# Load test environment
load_dotenv('.env')

# Override API key for testing
os.environ['API_KEY'] = 'test_api_key'

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "ViMax Web API" in response.json()["message"]

def test_generate_video_without_auth():
    """Test generate video endpoint without authentication"""
    response = client.post("/generate-video")
    assert response.status_code == 401

def test_generate_video_with_auth():
    """Test generate video endpoint with authentication"""
    headers = {"Authorization": "Bearer test_api_key"}
    response = client.post("/generate-video", headers=headers)
    # Should fail due to missing required fields, but not due to auth
    assert response.status_code != 401

def test_metrics_endpoint():
    """Test metrics endpoint"""
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert "cache" in data
    assert "system" in data

def test_invalid_pipeline_type():
    """Test validation of pipeline type"""
    headers = {"Authorization": "Bearer test_api_key"}
    data = {
        "pipeline_type": "invalid_type",
        "idea": "test idea"
    }
    response = client.post("/generate-video", headers=headers, data=data)
    assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__])