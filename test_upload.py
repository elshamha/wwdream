import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User

# Create a test client
client = Client()

# Login with admin user
user = User.objects.get(username='admin')
client.force_login(user)

# Test GET request first
print("Testing GET request...")
response = client.get('/writer/upload-analysis/')
print(f"GET Status: {response.status_code}")

# Test file upload
print("\nTesting file upload...")
with open('test_document.html', 'rb') as f:
    response = client.post('/writer/upload-analysis/', {
        'file': f
    })
    print(f"POST Status: {response.status_code}")
    if response.status_code == 200:
        print("Response content type:", response.get('Content-Type'))
        if 'application/json' in response.get('Content-Type', ''):
            import json
            data = json.loads(response.content)
            print("JSON Response:", data)
        else:
            print("HTML Response length:", len(response.content))
    else:
        print("Response content:", response.content[:500])
