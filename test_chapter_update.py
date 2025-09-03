import requests
import json

# Test chapter update endpoint
chapter_id = 125  # Using a chapter ID from the logs
url = f"http://localhost:8000/writer/api/chapters/{chapter_id}/"
token = "191b9f875ea663a31707406e0d46db2a67a49157"  # Your auth token

# First, get the current chapter to see its content
headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

print(f"Getting current chapter {chapter_id}...")
try:
    get_response = requests.get(url, headers=headers)
    print(f"GET Status Code: {get_response.status_code}")
    
    if get_response.status_code == 200:
        current_data = get_response.json()
        print(f"Current Chapter Data: {json.dumps(current_data, indent=2)}")
    else:
        print(f"GET Error Response: {get_response.text}")
        print("Cannot continue test - failed to get chapter data")
        exit(1)
    
    # Now update the chapter with some test content
    update_data = {
        "title": "Test Chapter Title",
        "content": "<p>This is a test content update from the API script. Let's see if it saves properly.</p>"
    }
    
    print(f"\nUpdating chapter with new content...")
    print(f"Update data: {json.dumps(update_data, indent=2)}")
    
    put_response = requests.put(url, json=update_data, headers=headers)
    print(f"PUT Status Code: {put_response.status_code}")
    print(f"PUT Response: {json.dumps(put_response.json(), indent=2)}")
    
    # Get the chapter again to verify the update
    print(f"\nVerifying update...")
    verify_response = requests.get(url, headers=headers)
    print(f"Verification Status Code: {verify_response.status_code}")
    print(f"Updated Chapter Data: {json.dumps(verify_response.json(), indent=2)}")
    
except Exception as e:
    print(f"Error: {e}")