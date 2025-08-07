import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.settings')
django.setup()

from writer.document_parser import extract_text_from_file, analyze_document_structure

# Test with the long document
content = extract_text_from_file('long_test_document.html')
print('Document length:', len(content), 'characters')

# Count words properly
import re
clean_content = re.sub(r'<[^>]+>', ' ', content)
words = clean_content.split()
print('Total words:', len(words))

analysis = analyze_document_structure(content)
print('\nAnalysis results:')
print('- Titles found:', len(analysis['titles']))
print('- Chapters found:', len(analysis['chapters']))
print('- Total words:', analysis['total_words'])
print('- Total sentences:', analysis['total_sentences'])
print('- Suggested splits:', len(analysis['suggested_splits']))

if analysis['suggested_splits']:
    print('\nSuggested splits:')
    for i, split in enumerate(analysis['suggested_splits']):
        print(f'  {i+1}. {split["chapter_name"]} - {split["word_count"]} words - Ends with period: {split["ends_with_period"]}')
