#!/usr/bin/env python
"""
One-time restore script to be run on Railway
"""
import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.production_settings')
django.setup()

from django.contrib.auth.models import User, Group
from writer.models import Project, Chapter, Document

def restore_data():
    with open('complete_data_export.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("=== Restoring Users ===")
    
    # Import Groups first
    for group_data in data.get('groups', []):
        Group.objects.get_or_create(name=group_data['name'])
    
    # Import Users (skip existing to preserve passwords)
    user_map = {}
    for user_data in data.get('users', []):
        username = user_data['username']
        
        if not User.objects.filter(username=username).exists():
            user = User.objects.create(
                username=username,
                email=user_data.get('email', ''),
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                is_staff=user_data.get('is_staff', False),
                is_superuser=user_data.get('is_superuser', False),
                is_active=user_data.get('is_active', True)
            )
            # Set temporary password
            user.set_password('Welcome2025!')
            user.save()
            print(f"Created user: {username}")
        else:
            user = User.objects.get(username=username)
            print(f"User exists: {username}")
        
        user_map[username] = user
    
    # Import Projects
    project_map = {}
    for proj_data in data.get('projects', []):
        author_username = proj_data.get('author_username')
        if author_username in user_map:
            project, created = Project.objects.get_or_create(
                id=proj_data['id'],
                defaults={
                    'title': proj_data['title'],
                    'description': proj_data.get('description', ''),
                    'author': user_map[author_username]
                }
            )
            project_map[proj_data['id']] = project
            if created:
                print(f"Created project: {proj_data['title']}")
    
    # Import Chapters
    for chap_data in data.get('chapters', []):
        project_id = chap_data.get('project_id')
        if project_id in project_map:
            chapter, created = Chapter.objects.get_or_create(
                id=chap_data['id'],
                defaults={
                    'title': chap_data.get('title', 'Untitled'),
                    'content': chap_data.get('content', ''),
                    'project': project_map[project_id],
                    'order': chap_data.get('order', 0)
                }
            )
    
    print(f"\n=== Complete ===")
    print(f"Users: {User.objects.count()}")
    print(f"Projects: {Project.objects.count()}")
    print(f"Chapters: {Chapter.objects.count()}")
    print("\nNew users have password: Welcome2025!")

if __name__ == '__main__':
    restore_data()