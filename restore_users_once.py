#!/usr/bin/env python
"""
One-time script to restore users to production database
Run this LOCALLY, not on the server
"""
import os
import json
import requests
from datetime import datetime

# IMPORTANT: Update this with your Railway database URL
# You can find this in Railway dashboard > Variables > DATABASE_URL
DATABASE_URL = input("Enter your Railway DATABASE_URL (from Railway dashboard): ")

# Set up Django with production settings
os.environ['DATABASE_URL'] = DATABASE_URL
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.production_settings')

import django
django.setup()

from django.contrib.auth.models import User, Group
from writer.models import Project, Chapter, Document

def restore_users():
    """Restore users from the export file without resetting existing passwords"""
    
    # Check if we have the export file
    if not os.path.exists('complete_data_export.json'):
        print("Error: complete_data_export.json not found!")
        print("Please make sure you have the export file in the current directory")
        return
    
    with open('complete_data_export.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("\n=== Starting User Restoration ===")
    print(f"Found {len(data.get('users', []))} users to restore")
    
    # Import Groups first
    group_map = {}
    for group_data in data.get('groups', []):
        group, created = Group.objects.get_or_create(
            name=group_data['name']
        )
        group_map[group_data['name']] = group
        if created:
            print(f"Created group: {group_data['name']}")
    
    # Import Users
    restored_count = 0
    skipped_count = 0
    
    for user_data in data.get('users', []):
        username = user_data['username']
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"User {username} already exists - skipping to preserve password")
            skipped_count += 1
            continue
        
        # Create new user
        try:
            user = User.objects.create(
                username=username,
                email=user_data.get('email', ''),
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                is_staff=user_data.get('is_staff', False),
                is_superuser=user_data.get('is_superuser', False),
                is_active=user_data.get('is_active', True)
            )
            
            # Set a temporary password - users will need to reset
            user.set_password('TempPassword123!')
            user.save()
            
            # Add to groups
            for group_name in user_data.get('groups', []):
                if group_name in group_map:
                    user.groups.add(group_map[group_name])
            
            print(f"✓ Restored user: {username}")
            restored_count += 1
            
        except Exception as e:
            print(f"✗ Failed to restore {username}: {e}")
    
    print("\n=== Restoration Complete ===")
    print(f"Restored: {restored_count} users")
    print(f"Skipped (already exist): {skipped_count} users")
    
    if restored_count > 0:
        print("\n⚠️  IMPORTANT: Newly restored users have temporary password: TempPassword123!")
        print("They should reset their passwords after logging in.")
    
    # Also restore projects and content if needed
    restore_content = input("\nDo you also want to restore projects and chapters? (y/n): ")
    if restore_content.lower() == 'y':
        restore_projects_and_content(data)

def restore_projects_and_content(data):
    """Restore projects and chapters"""
    
    print("\n=== Restoring Projects and Content ===")
    
    # Get user mapping
    user_map = {}
    for user in User.objects.all():
        user_map[user.username] = user
    
    # Restore projects
    project_map = {}
    project_count = 0
    
    for proj_data in data.get('projects', []):
        author_username = proj_data.get('author_username')
        if author_username and author_username in user_map:
            try:
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
                    print(f"✓ Created project: {proj_data['title']}")
                    project_count += 1
            except Exception as e:
                print(f"✗ Failed to create project {proj_data.get('title', 'Unknown')}: {e}")
    
    # Restore chapters
    chapter_count = 0
    for chap_data in data.get('chapters', []):
        project_id = chap_data.get('project_id')
        if project_id and project_id in project_map:
            try:
                chapter, created = Chapter.objects.get_or_create(
                    id=chap_data['id'],
                    defaults={
                        'title': chap_data.get('title', 'Untitled'),
                        'content': chap_data.get('content', ''),
                        'project': project_map[project_id],
                        'order': chap_data.get('order', 0)
                    }
                )
                if created:
                    chapter_count += 1
            except Exception as e:
                print(f"✗ Failed to create chapter: {e}")
    
    print(f"\nRestored {project_count} projects and {chapter_count} chapters")

if __name__ == '__main__':
    print("=== Writer's Web Dream User Restoration Script ===")
    print("This will restore users from your backup without affecting existing users")
    print("\nWARNING: Make sure you have your Railway DATABASE_URL ready!")
    print("You can find it in Railway dashboard > Variables > DATABASE_URL")
    
    confirm = input("\nDo you want to proceed? (y/n): ")
    if confirm.lower() == 'y':
        restore_users()
    else:
        print("Restoration cancelled.")