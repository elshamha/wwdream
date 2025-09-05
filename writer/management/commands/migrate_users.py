#!/usr/bin/env python
import os
import json
import django
from datetime import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission

class Command(BaseCommand):
    help = 'Import users, groups, and data from complete_data_export.json'

    def handle(self, *args, **options):
        # Import data from the JSON file
        file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), 'complete_data_export.json')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('complete_data_export.json not found'))
            return

        self.stdout.write('=== Starting Import ===')

        # Import Groups
        for group_data in data.get('groups', []):
            group, created = Group.objects.get_or_create(
                name=group_data['name'],
                defaults={'name': group_data['name']}
            )
            if created:
                self.stdout.write(f'Created group: {group.name}')
                # Add permissions if they exist
                for perm_codename in group_data.get('permissions', []):
                    try:
                        perm = Permission.objects.get(codename=perm_codename)
                        group.permissions.add(perm)
                    except Permission.DoesNotExist:
                        pass
            else:
                self.stdout.write(f'Group already exists: {group.name}')

        # Import Users with their groups
        user_map = {}
        for user_data in data.get('users', []):
            username = user_data['username']
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'is_staff': user_data['is_staff'],
                    'is_superuser': user_data['is_superuser'],
                    'is_active': user_data['is_active']
                }
            )
            if created:
                # Set a default password - users will need to reset
                user.set_password('ChangeMeNow123!')
                user.save()
                self.stdout.write(f'Created user: {username}')
            else:
                self.stdout.write(f'User already exists: {username}')
            
            # Add user to groups
            for group_name in user_data.get('groups', []):
                try:
                    group = Group.objects.get(name=group_name)
                    user.groups.add(group)
                except Group.DoesNotExist:
                    pass
            
            user_map[username] = user

        # Import Projects, Chapters, Documents
        from writer.models import Project, Chapter, Document
        
        # Import Projects
        project_map = {}
        for proj_data in data.get('projects', []):
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
                    self.stdout.write(f'Created project: {proj_data["title"]}')

        # Import Chapters
        for chap_data in data.get('chapters', []):
            project_id = chap_data.get('project_id')
            if project_id and project_id in project_map:
                project = project_map[project_id]
                Chapter.objects.get_or_create(
                    id=chap_data['id'],
                    defaults={
                        'title': chap_data.get('title', 'Untitled'),
                        'content': chap_data.get('content', ''),
                        'project': project,
                        'order': chap_data.get('order', 0)
                    }
                )

        # Import Documents
        for doc_data in data.get('documents', []):
            author_username = doc_data.get('author_username')
            if author_username and author_username in user_map:
                author = user_map[author_username]
                Document.objects.get_or_create(
                    id=doc_data['id'],
                    defaults={
                        'title': doc_data['title'],
                        'content': doc_data.get('content', ''),
                        'author': author
                    }
                )

        self.stdout.write('\n=== Import Complete! ===')
        self.stdout.write(f'Groups: {len(data.get("groups", []))}')
        self.stdout.write(f'Users: {len(data.get("users", []))}')
        self.stdout.write(f'Projects: {len(data.get("projects", []))}')
        self.stdout.write(f'Chapters: {len(data.get("chapters", []))}')
        self.stdout.write(f'Documents: {len(data.get("documents", []))}')
        self.stdout.write('\nAll imported users have the password: ChangeMeNow123!')
        self.stdout.write('Users should reset their passwords after logging in.')