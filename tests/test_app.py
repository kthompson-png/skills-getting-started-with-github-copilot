import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert isinstance(data["Chess Club"], dict)


def test_signup_for_activity_success():
    email = "newstudent@mergington.edu"
    response = client.post("/activities/Chess Club/signup?email=" + email)
    assert response.status_code == 200
    assert "Signed up" in response.json()["message"]
    # Clean up: remove the test participant
    data = client.get("/activities").json()
    participants = data["Chess Club"]["participants"]
    if email in participants:
        idx = participants.index(email)
        client.delete(f"/activities/Chess Club/unregister?index={idx}")


def test_signup_for_activity_already_signed_up():
    email = "michael@mergington.edu"
    response = client.post(f"/activities/Chess Club/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]


def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=test@mergington.edu")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]


def test_unregister_participant_success():
    email = "tempuser@mergington.edu"
    # Add participant
    client.post(f"/activities/Art Club/signup?email={email}")
    # Get index
    data = client.get("/activities").json()
    participants = data["Art Club"]["participants"]
    idx = participants.index(email)
    # Unregister
    response = client.delete(f"/activities/Art Club/unregister?index={idx}")
    assert response.status_code == 200
    assert "Unregistered" in response.json()["message"]


def test_unregister_participant_invalid_index():
    response = client.delete("/activities/Art Club/unregister?index=999")
    assert response.status_code == 400
    assert "Invalid participant index" in response.json()["detail"]


def test_unregister_activity_not_found():
    response = client.delete("/activities/Nonexistent/unregister?index=0")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
