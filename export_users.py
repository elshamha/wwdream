#!/usr/bin/env python
import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.settings')
django.setup()

from django.contrib.auth.models import User
from writer.models import Project, Chapter, Document

def export_data():
    data = {
        'users': [],
        'projects': [],
        'chapters': [],
        'documents': []
    }
    
    # Export Users
    for user in User.objects.all():
        data['users'].append({
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
        })
    
    # Export Projects
    for project in Project.objects.all():
        data['projects'].append({
            'id': project.id,
            'title': project.title,
            'description': project.description if hasattr(project, 'description') else '',
            'author_username': project.author.username if project.author else None,
            'created_at': project.created_at.isoformat() if hasattr(project, 'created_at') and project.created_at else None,
        })
    
    # Export Chapters
    try:
        for chapter in Chapter.objects.all():
            data['chapters'].append({
                'id': chapter.id,
                'title': chapter.title if hasattr(chapter, 'title') else '',
                'content': chapter.content if hasattr(chapter, 'content') else '',
                'project_id': chapter.project.id if hasattr(chapter, 'project') and chapter.project else None,
                'order': chapter.order if hasattr(chapter, 'order') else 0,
            })
    except Exception as e:
        print(f"Could not export chapters: {e}")
    
    # Export Documents
    try:
        for doc in Document.objects.all():
            data['documents'].append({
                'id': doc.id,
                'title': doc.title,
                'content': doc.content if hasattr(doc, 'content') else '',
                'author_username': doc.author.username if doc.author else None,
                'created_at': doc.created_at.isoformat() if hasattr(doc, 'created_at') and doc.created_at else None,
            })
    except Exception as e:
        print(f"Could not export documents: {e}")
    
    # Save to file with UTF-8 encoding
    with open('user_data_export.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Exported {len(data['users'])} users")
    print(f"Exported {len(data['projects'])} projects")
    print(f"Exported {len(data['chapters'])} chapters")
    print(f"Exported {len(data['documents'])} documents")
    print("Data saved to user_data_export.json")

if __name__ == '__main__':
    export_data()