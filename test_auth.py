import requests
import json

# Test authentication endpoint
url = "http://localhost:8000/api-token-auth/"
data = {
    "username": "testuser",
    "password": "testpass123"
}

print(f"Testing login at: {url}")
print(f"Credentials: username={data['username']}")

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        token = response.json().get('token')
        print(f"Success! Token: {token[:20]}..." if token else "No token in response")
    else:
        print(f"Login failed with status {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")