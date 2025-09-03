import requests
import json

# Test listing all chapters accessible to the user
url = "http://localhost:8000/writer/api/chapters/"
token = "191b9f875ea663a31707406e0d46db2a67a49157"  # Your auth token

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

print("Listing all accessible chapters...")
try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        chapters = response.json()
        print(f"Found {len(chapters)} chapters:")
        for chapter in chapters:
            print(f"- Chapter {chapter['id']}: {chapter['title']} (Project: {chapter['project']})")
            print(f"  Content preview: {(chapter.get('content', '') or '')[:50]}...")
    else:
        print(f"Error response: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")