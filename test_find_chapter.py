import requests
import json

# Find chapters that belong to the test user
token = "191b9f875ea663a31707406e0d46db2a67a49157"  # Your auth token

headers = {
    "Authorization": f"Token {token}",
    "Content-Type": "application/json"
}

print("Getting user's projects...")
try:
    # Get projects owned by the user
    projects_url = "http://localhost:8000/writer/projects/api/list/?bookshelf_only=true"
    projects_response = requests.get(projects_url, headers=headers)
    print(f"Projects Status Code: {projects_response.status_code}")
    
    if projects_response.status_code == 200:
        projects_data = projects_response.json()
        
        if 'results' in projects_data and projects_data['results']:
            # Get the first project
            first_project = projects_data['results'][0]
            project_id = first_project['id']
            print(f"Found project: {first_project['title']} (ID: {project_id})")
            
            # Get chapters for this project
            chapters_url = f"http://localhost:8000/writer/projects/{project_id}/chapters/list/"
            chapters_response = requests.get(chapters_url, headers=headers)
            print(f"Chapters Status Code: {chapters_response.status_code}")
            
            if chapters_response.status_code == 200:
                chapters_data = chapters_response.json()
                print(f"Chapters data keys: {list(chapters_data.keys())}")
                
                if 'chapters' in chapters_data and chapters_data['chapters']:
                    first_chapter = chapters_data['chapters'][0]
                    chapter_id = first_chapter['id']
                    print(f"Found chapter: {first_chapter['title']} (ID: {chapter_id})")
                    
                    # Test the chapter API
                    chapter_url = f"http://localhost:8000/writer/api/chapters/{chapter_id}/"
                    print(f"\nTesting chapter API: {chapter_url}")
                    
                    chapter_response = requests.get(chapter_url, headers=headers)
                    print(f"Chapter API Status Code: {chapter_response.status_code}")
                    
                    if chapter_response.status_code == 200:
                        chapter_data = chapter_response.json()
                        print(f"Chapter API Response: {json.dumps(chapter_data, indent=2)}")
                    else:
                        print(f"Chapter API Error: {chapter_response.text}")
                else:
                    print("No chapters found in project")
            else:
                print(f"Failed to get chapters: {chapters_response.text}")
        else:
            print("No projects found for user")
    else:
        print(f"Failed to get projects: {projects_response.text}")
        
except Exception as e:
    print(f"Error: {e}")