import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atticus_writer.settings')
django.setup()

from writer.document_parser import extract_text_from_file, analyze_document_structure

# Test the document parser with our test HTML file
content = extract_text_from_file('test_document.html')
print('Extracted content length:', len(content))
print('First 200 chars:', content[:200])

analysis = analyze_document_structure(content)
print('Analysis results:')
print('- Titles found:', len(analysis['titles']))
print('- Chapters found:', len(analysis['chapters']))
print('- Total sentences:', analysis['total_sentences'])

if analysis['chapters']:
    print('Chapter details:')
    for i, chapter in enumerate(analysis['chapters'][:3]):
        print(f'  {i+1}. {chapter["text"]} (pos: {chapter["position"]})')
