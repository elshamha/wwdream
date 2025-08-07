"""
Document parsing utilities for different file formats.
Handles PDF, DOCX, TXT, and HTML files for chapter analysis.
"""

import os
import re
from typing import Dict, List, Tuple
import mimetypes

def extract_text_from_file(file_path: str) -> str:
    """
    Extract text content from various file formats.
    
    Args:
        file_path: Path to the file to parse
        
    Returns:
        Extracted text content as string
    """
    if not os.path.exists(file_path):
        return ""
    
    mime_type, _ = mimetypes.guess_type(file_path)
    file_extension = os.path.splitext(file_path)[1].lower()
    
    try:
        if file_extension == '.txt' or mime_type == 'text/plain':
            return extract_from_txt(file_path)
        elif file_extension == '.html' or mime_type == 'text/html':
            return extract_from_html(file_path)
        elif file_extension == '.pdf':
            return extract_from_pdf(file_path)
        elif file_extension in ['.docx', '.doc']:
            return extract_from_docx(file_path)
        else:
            # Try to read as plain text
            return extract_from_txt(file_path)
    except Exception as e:
        print(f"Error parsing file {file_path}: {e}")
        return ""

def extract_from_txt(file_path: str) -> str:
    """Extract text from plain text file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        # Try with different encoding
        with open(file_path, 'r', encoding='latin-1') as file:
            return file.read()

def extract_from_html(file_path: str) -> str:
    """Extract text from HTML file while preserving structure."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove script and style elements
        content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
        content = re.sub(r'<style.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)
        
        return content
    except Exception as e:
        print(f"Error parsing HTML: {e}")
        return ""

def extract_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file.
    Note: This is a placeholder. In production, you'd use libraries like PyPDF2 or pdfplumber.
    """
    try:
        # For now, return empty string since PDF parsing requires additional libraries
        # In production, install PyPDF2 or pdfplumber:
        # pip install PyPDF2
        # or
        # pip install pdfplumber
        
        print(f"PDF parsing not implemented yet for {file_path}")
        return ""
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def extract_from_docx(file_path: str) -> str:
    """
    Extract text from DOCX file.
    Note: This is a placeholder. In production, you'd use python-docx library.
    """
    try:
        # For now, return empty string since DOCX parsing requires additional libraries
        # In production, install python-docx:
        # pip install python-docx
        
        print(f"DOCX parsing not implemented yet for {file_path}")
        return ""
    except Exception as e:
        print(f"Error parsing DOCX: {e}")
        return ""

def analyze_document_structure(content: str) -> Dict:
    """
    Analyze document structure to identify titles and chapters.
    
    Args:
        content: Text content to analyze
        
    Returns:
        Dictionary with analysis results
    """
    if not content:
        return {
            'titles': [],
            'chapters': [],
            'total_words': 0,
            'total_sentences': 0,
            'suggested_splits': []
        }
    
    # Find titles (H1 tags or lines that look like titles)
    titles = []
    title_patterns = [
        r'<h1[^>]*>(.*?)</h1>',  # HTML H1 tags
        r'^([A-Z][A-Z\s]{2,})$',  # ALL CAPS lines
        r'^(Title:|TITLE:)\s*(.+)$',  # Explicit title markers
    ]
    
    for pattern in title_patterns:
        matches = re.findall(pattern, content, re.MULTILINE | re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                title_text = match[-1].strip()
            else:
                title_text = match.strip()
            
            if title_text and len(title_text) > 1:
                titles.append({
                    'text': title_text,
                    'position': content.find(title_text)
                })
    
    # Find chapters (H2 tags or lines that look like chapters)
    chapters = []
    chapter_patterns = [
        r'<h2[^>]*>(.*?)</h2>',  # HTML H2 tags
        r'^(Chapter\s+\d+.*?)$',  # Chapter X patterns
        r'^(\d+\.\s+.+)$',  # Numbered sections
        r'^([A-Z][a-z]+\s+[A-Z][a-z]+.*?)$',  # Title Case sections
    ]
    
    for pattern in chapter_patterns:
        matches = re.findall(pattern, content, re.MULTILINE)
        for match in matches:
            chapter_text = match.strip() if isinstance(match, str) else match
            if chapter_text and len(chapter_text) > 1:
                chapters.append({
                    'text': chapter_text,
                    'position': content.find(chapter_text)
                })
    
    # Count words and sentences
    # Remove HTML tags for accurate word count
    clean_content = re.sub(r'<[^>]+>', ' ', content)
    words = clean_content.split()
    total_words = len(words)
    
    sentence_endings = re.findall(r'[.!?]+', content)
    total_sentences = len(sentence_endings)
    
    # Suggest splits for long content (every 4000 words, ending at last period)
    suggested_splits = []
    if total_words > 4000:
        # Split into chunks of approximately 4000 words
        words_per_chunk = 4000
        current_pos = 0
        split_count = 1
        
        while current_pos < len(words):
            # Find the end position for this chunk (4000 words ahead)
            end_word_pos = min(current_pos + words_per_chunk, len(words))
            
            if end_word_pos >= len(words):
                # This is the last chunk
                break
            
            # Find the text position of this word range
            words_before = words[current_pos:end_word_pos]
            chunk_text = ' '.join(words_before)
            
            # Find the last period in this chunk
            last_period_pos = chunk_text.rfind('.')
            
            if last_period_pos != -1:
                # Split at the last period
                actual_chunk_text = chunk_text[:last_period_pos + 1]
                actual_word_count = len(actual_chunk_text.split())
                
                # Find this position in the original content
                original_pos = content.find(actual_chunk_text)
                if original_pos == -1:
                    # Fallback: find approximate position
                    partial_content = ' '.join(words[:current_pos + actual_word_count])
                    original_pos = len(partial_content)
                
                suggested_splits.append({
                    'position': original_pos + len(actual_chunk_text),
                    'chapter_name': f'Untitled Chapter {split_count}',
                    'word_count': actual_word_count,
                    'ends_with_period': True
                })
                
                # Update current position to start after the period
                current_pos += actual_word_count
            else:
                # No period found, split at word boundary
                suggested_splits.append({
                    'position': len(' '.join(words[:end_word_pos])),
                    'chapter_name': f'Untitled Chapter {split_count}',
                    'word_count': words_per_chunk,
                    'ends_with_period': False
                })
                current_pos = end_word_pos
            
            split_count += 1
    
    return {
        'titles': titles,
        'chapters': chapters,
        'total_words': total_words,
        'total_sentences': total_sentences,
        'suggested_splits': suggested_splits
    }

def create_chapters_from_analysis(content: str, analysis: Dict, project_id: int) -> List[Dict]:
    """
    Create chapter data from analysis results with proper 4000-word pagination.
    
    Args:
        content: Original content
        analysis: Analysis results from analyze_document_structure
        project_id: ID of the project to add chapters to
        
    Returns:
        List of chapter dictionaries ready for database insertion
    """
    chapters_data = []
    
    # If we have detected chapters, use them but still respect word limits
    if analysis['chapters']:
        # Sort chapters by position
        sorted_chapters = sorted(analysis['chapters'], key=lambda x: x['position'])
        
        for i, chapter in enumerate(sorted_chapters):
            # Find content between this chapter and the next
            start_pos = chapter['position']
            end_pos = sorted_chapters[i + 1]['position'] if i + 1 < len(sorted_chapters) else len(content)
            
            chapter_content = content[start_pos:end_pos].strip()
            
            # Check if this chapter exceeds 4000 words
            clean_content = re.sub(r'<[^>]+>', ' ', chapter_content)
            word_count = len(clean_content.split())
            
            if word_count > 4000:
                # Split this long chapter into smaller ones
                sub_chapters = split_long_chapter(chapter_content, chapter['text'], i + 1)
                chapters_data.extend([{**ch, 'project_id': project_id} for ch in sub_chapters])
            else:
                chapters_data.append({
                    'title': chapter['text'],
                    'content': chapter_content,
                    'order': i + 1,
                    'project_id': project_id
                })
    
    # If no chapters detected but content is long, use suggested splits
    elif analysis['suggested_splits']:
        start_pos = 0
        for i, split in enumerate(analysis['suggested_splits']):
            end_pos = split['position']
            chapter_content = content[start_pos:end_pos].strip()
            
            chapters_data.append({
                'title': split['chapter_name'],
                'content': chapter_content,
                'order': i + 1,
                'project_id': project_id,
                'word_count': split['word_count'],
                'auto_split': True
            })
            
            start_pos = end_pos
        
        # Add the remaining content as the last chapter
        if start_pos < len(content):
            remaining_content = content[start_pos:].strip()
            if remaining_content:
                clean_remaining = re.sub(r'<[^>]+>', ' ', remaining_content)
                remaining_words = len(clean_remaining.split())
                
                chapters_data.append({
                    'title': f'Untitled Chapter {len(analysis["suggested_splits"]) + 1}',
                    'content': remaining_content,
                    'order': len(analysis['suggested_splits']) + 1,
                    'project_id': project_id,
                    'word_count': remaining_words,
                    'auto_split': True
                })
    
    # If no chapters and content is short, create a single chapter
    else:
        title = analysis['titles'][0]['text'] if analysis['titles'] else 'Imported Document'
        clean_content = re.sub(r'<[^>]+>', ' ', content)
        word_count = len(clean_content.split())
        
        chapters_data.append({
            'title': title,
            'content': content,
            'order': 1,
            'project_id': project_id,
            'word_count': word_count
        })
    
    return chapters_data

def split_long_chapter(content: str, chapter_title: str, base_order: int) -> List[Dict]:
    """
    Split a long chapter into multiple chapters of ~4000 words each,
    ending at the last period before the word limit.
    """
    chapters = []
    
    # Remove HTML tags for accurate word counting
    clean_content = re.sub(r'<[^>]+>', ' ', content)
    words = clean_content.split()
    
    if len(words) <= 4000:
        return [{
            'title': chapter_title,
            'content': content,
            'order': base_order,
            'word_count': len(words)
        }]
    
    start_pos = 0
    part_num = 1
    
    while start_pos < len(content):
        # Find approximately 4000 words from current position
        words_subset = words[start_pos:start_pos + 4000]
        
        if not words_subset:
            break
            
        # Create the text chunk
        chunk_text = ' '.join(words_subset)
        
        # Find the last period in this chunk
        last_period_pos = chunk_text.rfind('.')
        
        if last_period_pos != -1 and len(words_subset) == 4000:
            # We're not at the end and found a period
            actual_chunk = chunk_text[:last_period_pos + 1]
            actual_words = actual_chunk.split()
        else:
            # Either we're at the end or no period found, use all words
            actual_chunk = chunk_text
            actual_words = words_subset
        
        # Find this chunk in the original content (with HTML)
        # This is approximate since we're working with cleaned content
        start_char_pos = content.find(actual_words[0]) if actual_words else start_pos
        if start_char_pos == -1:
            start_char_pos = start_pos
            
        # Find end position by looking for the last word
        if actual_words:
            last_word = actual_words[-1].rstrip('.')
            end_char_pos = content.find(last_word, start_char_pos) + len(last_word)
            if content[end_char_pos:end_char_pos+1] == '.':
                end_char_pos += 1
        else:
            end_char_pos = len(content)
        
        chapter_content = content[start_char_pos:end_char_pos].strip()
        
        # Create chapter title
        if part_num == 1:
            title = chapter_title
        else:
            title = f"{chapter_title} (Part {part_num})"
        
        chapters.append({
            'title': title,
            'content': chapter_content,
            'order': base_order + (part_num - 1) * 0.1,  # Use decimal for sub-parts
            'word_count': len(actual_words),
            'auto_split': part_num > 1
        })
        
        # Move to next chunk
        start_pos += len(actual_words)
        part_num += 1
        
        # Safety check to prevent infinite loops
        if part_num > 50:  # Max 50 parts per chapter
            break
    
    return chapters
