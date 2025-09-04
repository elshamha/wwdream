#!/usr/bin/env python
import os
import json
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.settings')
django.setup()

from django.contrib.auth.models import User, Group, Permission
from writer.models import Project, Chapter, Document

def import_all_data():
    with open('complete_data_export.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("=== Starting Import ===")
    
    # Import Groups first
    group_map = {}
    for group_data in data['groups']:
        group, created = Group.objects.get_or_create(
            name=group_data['name']
        )
        group_map[group_data['name']] = group
        
        # Add permissions if specified
        if group_data.get('permissions'):
            for perm_codename in group_data['permissions']:
                try:
                    perm = Permission.objects.get(codename=perm_codename)
                    group.permissions.add(perm)
                except Permission.DoesNotExist:
                    print(f"Permission {perm_codename} not found")
        
        if created:
            print(f"Created group: {group_data['name']}")
        else:
            print(f"Group already exists: {group_data['name']}")
    
    # Import Users and assign to groups
    user_map = {}
    for user_data in data['users']:
        username = user_data['username']
        if not User.objects.filter(username=username).exists():
            user = User.objects.create(
                username=username,
                email=user_data['email'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                is_staff=user_data['is_staff'],
                is_superuser=user_data['is_superuser'],
                is_active=user_data['is_active']
            )
            # Set a default password - users will need to reset
            user.set_password('ChangeMeNow123!')
            user.save()
            
            # Add user to groups
            for group_name in user_data.get('groups', []):
                if group_name in group_map:
                    user.groups.add(group_map[group_name])
                    print(f"  Added {username} to group: {group_name}")
            
            print(f"Created user: {username}")
        else:
            user = User.objects.get(username=username)
            
            # Update group memberships
            for group_name in user_data.get('groups', []):
                if group_name in group_map:
                    user.groups.add(group_map[group_name])
                    print(f"  Added {username} to group: {group_name}")
            
            print(f"User already exists: {username}")
        user_map[username] = user
    
    # Import Projects
    project_map = {}
    for proj_data in data['projects']:
        author_username = proj_data.get('author_username')
        if author_username and author_username in user_map:
            author = user_map[author_username]
            project, created = Project.objects.get_or_create(
                id=proj_data['id'],
                defaults={
                    'title': proj_data['title'],
                    'description': proj_data.get('description', ''),
                    'author': author
                }
            )
            project_map[proj_data['id']] = project
            if created:
                print(f"Created project: {proj_data['title']}")
    
    # Import Chapters
    for chap_data in data['chapters']:
        project_id = chap_data.get('project_id')
        if project_id and project_id in project_map:
            project = project_map[project_id]
            chapter, created = Chapter.objects.get_or_create(
                id=chap_data['id'],
                defaults={
                    'title': chap_data.get('title', 'Untitled'),
                    'content': chap_data.get('content', ''),
                    'project': project,
                    'order': chap_data.get('order', 0)
                }
            )
            if created:
                print(f"Created chapter: {chap_data.get('title', 'Untitled')}")
    
    # Import Documents
    for doc_data in data['documents']:
        author_username = doc_data.get('author_username')
        if author_username and author_username in user_map:
            author = user_map[author_username]
            doc, created = Document.objects.get_or_create(
                id=doc_data['id'],
                defaults={
                    'title': doc_data['title'],
                    'content': doc_data.get('content', ''),
                    'author': author
                }
            )
            if created:
                print(f"Created document: {doc_data['title']}")
    
    print("\n=== Import Complete! ===")
    print(f"Groups: {Group.objects.count()}")
    print(f"Users: {User.objects.count()}")
    print(f"Projects: {Project.objects.count()}")
    print(f"Chapters: {Chapter.objects.count()}")
    print(f"Documents: {Document.objects.count()}")
    print("\nAll imported users have the password: ChangeMeNow123!")
    print("Users should reset their passwords after logging in.")

if __name__ == '__main__':
    import_all_data()