import requests
import json

# Test project creation endpoint
url = "http://localhost:8000/writer/api/projects/"
token = "191b9f875ea663a31707406e0d46db2a67a49157"  # Your auth token

data = {
    "title": "Test Book",
    "description": "A test book created from script",
    "genre": "Fiction",
    "target_word_count": 50000,
    "show_on_dashboard": True
}

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

print(f"Testing project creation at: {url}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("Success! Project created")
    else:
        print(f"Failed with status {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")