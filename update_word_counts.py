#!/usr/bin/env python
"""
Script to update word counts for existing ImportedDocument records
"""
import os
import sys
import django
import re

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.settings')
django.setup()

from writer.models import ImportedDocument

def update_imported_document_word_counts():
    """Update word counts for all existing ImportedDocument records"""
    documents = ImportedDocument.objects.all()
    updated_count = 0
    
    print(f"Found {documents.count()} imported documents to update...")
    
    for doc in documents:
        if doc.extracted_content and doc.word_count == 0:
            # Calculate word count
            text = re.sub(r'<[^>]+>', '', doc.extracted_content)  # Remove HTML tags
            word_count = len(text.split())
            
            # Update the document
            doc.word_count = word_count
            doc.save()
            
            updated_count += 1
            print(f"Updated '{doc.title}' - {word_count} words")
    
    print(f"\nCompleted! Updated {updated_count} documents.")

if __name__ == '__main__':
    update_imported_document_word_counts()
