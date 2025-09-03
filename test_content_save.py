import requests
import json

# Test if content is actually being saved and retrieved correctly
token = "191b9f875ea663a31707406e0d46db2a67a49157"
chapter_id = 126  # From the recent logs

url = f"http://localhost:8000/writer/api/chapters/{chapter_id}/"
headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

print(f"Testing content save/retrieve for chapter {chapter_id}")
print("=" * 50)

try:
    # Get current content
    print("1. Getting current chapter content...")
    get_response = requests.get(url, headers=headers)
    print(f"GET Status: {get_response.status_code}")
    
    if get_response.status_code == 200:
        current_data = get_response.json()
        print(f"Current content: '{current_data.get('content', '')}'")
        print(f"Current title: '{current_data.get('title', '')}'")
        
        # Update with test content
        test_content = "This is a test to see if content saves properly. Here's some text with formatting: **bold text** and *italic text*."
        update_data = {
            "title": current_data.get('title', 'Test Chapter'),
            "content": test_content
        }
        
        print(f"\n2. Updating with test content...")
        print(f"Sending content: '{test_content}'")
        
        put_response = requests.put(url, json=update_data, headers=headers)
        print(f"PUT Status: {put_response.status_code}")
        print(f"PUT Response: {put_response.text}")
        
        # Get content again to verify it was saved
        print(f"\n3. Verifying content was saved...")
        verify_response = requests.get(url, headers=headers)
        print(f"Verify GET Status: {verify_response.status_code}")
        
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            saved_content = verify_data.get('content', '')
            print(f"Saved content: '{saved_content}'")
            print(f"Content matches: {saved_content == test_content}")
            
            if saved_content != test_content:
                print("❌ Content was not saved correctly!")
                print(f"Expected: '{test_content}'")
                print(f"Got: '{saved_content}'")
            else:
                print("✅ Content was saved correctly!")
        else:
            print(f"Failed to verify: {verify_response.text}")
            
    elif get_response.status_code == 403:
        print("❌ Permission denied - chapter doesn't belong to test user")
    else:
        print(f"Failed to get chapter: {get_response.text}")
        
except Exception as e:
    print(f"Error: {e}")