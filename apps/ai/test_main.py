import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["modelLoaded"] is True

def test_analyze_flooding():
    res = client.post("/analyze", json={"text": "Water surge and flooding near the sea wall, roads submerged."})
    assert res.status_code == 200
    data = res.json()
    assert data["hazardType"] == "coastal_flooding"
    assert "flooding" in data["keywords"]
    assert data["confidence"] >= 0.60

def test_analyze_oil_spill():
    res = client.post("/analyze", json={"text": "Large oil spill and black slick washing up on the shore."})
    assert res.status_code == 200
    data = res.json()
    assert data["hazardType"] == "oil_spill"
    assert "oil spill" in data["keywords"]

def test_analyze_unknown_text():
    res = client.post("/analyze", json={"text": "Nice sunny day with a coffee at the boardwalk."})
    assert res.status_code == 200
    data = res.json()
    assert data["hazardType"] == "unknown"
    assert data["needsReview"] is True

def test_analyze_empty_text():
    res = client.post("/analyze", json={"text": "   "})
    assert res.status_code == 422
