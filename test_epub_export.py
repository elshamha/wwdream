#!/usr/bin/env python
"""
Test script for EPUB export functionality
"""

from ebooklib import epub
import io

def test_epub_generation():
    """Test basic EPUB generation with ebooklib"""
    
    try:
        # Create EPUB book
        book = epub.EpubBook()
        
        # Set metadata
        book.set_identifier('test123')
        book.set_title('Test EPUB Export')
        book.set_language('en')
        book.add_author('Atticus Writer')
        
        # Create CSS for styling
        style = '''
        body { 
            font-family: Georgia, serif; 
            line-height: 1.6; 
            margin: 1em; 
        }
        h1 { 
            color: #333; 
            text-align: center;
            page-break-before: always;
        }
        h2 { 
            color: #666; 
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.3em;
            margin-top: 2em;
        }
        p { 
            text-indent: 1.5em; 
            margin-bottom: 1em;
        }
        .first-paragraph { text-indent: 0; }
        '''
        nav_css = epub.EpubItem(uid="nav_css", file_name="style/nav.css", media_type="text/css", content=style)
        book.add_item(nav_css)
        
        # Create title page
        title_content = '''
        <html>
        <head>
            <link rel="stylesheet" href="style/nav.css"/>
            <title>Test EPUB Export</title>
        </head>
        <body>
            <div style="text-align: center; margin-top: 3em;">
                <h1>Test EPUB Export</h1>
                <p><em>by Atticus Writer</em></p>
                <p style="margin-top: 2em; font-style: italic;">
                    A comprehensive test of the EPUB generation system
                </p>
            </div>
        </body>
        </html>
        '''
        
        title_page = epub.EpubHtml(title='Title Page', file_name='title.xhtml', lang='en')
        title_page.content = title_content
        book.add_item(title_page)
        
        # Create sample chapters
        chapters = []
        
        for i in range(1, 4):
            chapter_content = f'''
            <html>
            <head>
                <link rel="stylesheet" href="style/nav.css"/>
                <title>Chapter {i}</title>
            </head>
            <body>
                <h1>Chapter {i}: Sample Content</h1>
                
                <p class="first-paragraph">This is chapter {i} of the test EPUB book. 
                The EPUB export functionality has been successfully implemented in 
                the Atticus Writer application.</p>
                
                <p>Users can now export their writing projects as complete EPUB files, 
                making it easy to read their work on e-readers, tablets, and other 
                devices that support the EPUB format.</p>
                
                <p>The system automatically handles:</p>
                <ul>
                    <li>Proper EPUB structure and metadata</li>
                    <li>CSS styling for professional appearance</li>
                    <li>Table of contents generation</li>
                    <li>Chapter organization and navigation</li>
                </ul>
                
                <p>Each chapter is properly formatted with headers, paragraphs, 
                and styling that makes the content pleasant to read across different 
                devices and screen sizes.</p>
                
                <h2>Section {i}.1: Advanced Features</h2>
                
                <p>The EPUB export supports advanced formatting features including 
                custom CSS styles, proper typography, and responsive design that 
                adapts to different reading environments.</p>
                
                <p>Writers can export individual chapters or entire projects, 
                giving them flexibility in how they share and distribute their work.</p>
            </body>
            </html>
            '''
            
            chapter = epub.EpubHtml(title=f'Chapter {i}', file_name=f'chapter_{i}.xhtml', lang='en')
            chapter.content = chapter_content
            book.add_item(chapter)
            chapters.append(chapter)
        
        # Create table of contents
        book.toc = (epub.Link("title.xhtml", "Title Page", "title"),
                   (epub.Section('Chapters'),
                    tuple(epub.Link(f"chapter_{i}.xhtml", f"Chapter {i}", f"chapter_{i}") 
                         for i in range(1, 4))
                   ))
        
        # Add navigation files
        book.add_item(epub.EpubNcx())
        book.add_item(epub.EpubNav())
        
        # Define book spine
        book.spine = ['nav', title_page] + chapters
        
        # Write EPUB to memory
        epub_buffer = io.BytesIO()
        epub.write_epub(epub_buffer, book)
        
        # Save to file
        epub_buffer.seek(0)
        with open('test_export.epub', 'wb') as f:
            f.write(epub_buffer.read())
        
        print("EPUB generation test successful!")
        print("Test EPUB saved as 'test_export.epub'")
        print(f"Book metadata: {book.get_metadata('DC', 'title')}")
        print(f"Number of chapters: {len(chapters)}")
        return True
        
    except Exception as e:
        print(f"EPUB generation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_epub_with_html_content():
    """Test EPUB generation with HTML content (simulating real usage)"""
    
    try:
        print("\nTesting EPUB with HTML content...")
        
        # Sample HTML content like what would come from the editor
        sample_html = '''
        <h1>My Writing Project</h1>
        <p>This is the first paragraph of my story. It contains <strong>bold text</strong> 
        and <em>italic text</em> to test formatting preservation.</p>
        
        <h2>Chapter 1: The Beginning</h2>
        <p>Once upon a time, in a land far away, there lived a writer who discovered 
        the power of digital storytelling.</p>
        
        <p>The writer used <a href="#">Atticus Writer</a> to craft beautiful stories 
        that could be exported to multiple formats.</p>
        
        <blockquote>
        <p>"Writing is the painting of the voice." - Voltaire</p>
        </blockquote>
        
        <ul>
        <li>Feature 1: Rich text editing</li>
        <li>Feature 2: Multiple export formats</li>
        <li>Feature 3: Collaborative writing</li>
        </ul>
        '''
        
        # Create book
        book = epub.EpubBook()
        book.set_identifier('test_html_456')
        book.set_title('HTML Content Test')
        book.set_language('en')
        book.add_author('Test Author')
        
        # Add CSS
        css = '''
        body { font-family: Georgia, serif; line-height: 1.6; margin: 20px; }
        h1, h2 { color: #333; }
        h1 { text-align: center; border-bottom: 3px solid #333; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #666; padding-bottom: 5px; }
        blockquote { 
            font-style: italic; 
            border-left: 4px solid #ccc; 
            margin-left: 0; 
            padding-left: 20px; 
        }
        '''
        nav_css = epub.EpubItem(uid="nav_css", file_name="style/nav.css", media_type="text/css", content=css)
        book.add_item(nav_css)
        
        # Create chapter with HTML content
        chapter_html = f'''
        <html>
        <head>
            <link rel="stylesheet" href="style/nav.css"/>
            <title>HTML Content Test</title>
        </head>
        <body>
            {sample_html}
        </body>
        </html>
        '''
        
        chapter = epub.EpubHtml(title='HTML Content Test', file_name='content.xhtml', lang='en')
        chapter.content = chapter_html
        book.add_item(chapter)
        
        # Set up navigation
        book.toc = (epub.Link("content.xhtml", "Content", "content"),)
        book.add_item(epub.EpubNcx())
        book.add_item(epub.EpubNav())
        book.spine = ['nav', chapter]
        
        # Write to file
        epub_buffer = io.BytesIO()
        epub.write_epub(epub_buffer, book)
        
        epub_buffer.seek(0)
        with open('test_html_export.epub', 'wb') as f:
            f.write(epub_buffer.read())
        
        print("HTML content EPUB test successful!")
        print("HTML test EPUB saved as 'test_html_export.epub'")
        return True
        
    except Exception as e:
        print(f"HTML EPUB generation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        print("Testing EPUB export functionality...\n")
        
        # Run basic test
        test1_passed = test_epub_generation()
        
        # Run HTML content test  
        test2_passed = test_epub_with_html_content()
        
        if test1_passed and test2_passed:
            print("\nAll EPUB export tests passed!")
            print("\nGenerated files:")
            print("  - test_export.epub (basic EPUB with multiple chapters)")
            print("  - test_html_export.epub (HTML content preservation test)")
            print("\nYou can open these files in any EPUB reader to verify the output.")
        else:
            print("\nSome EPUB tests failed!")
            
    except Exception as e:
        print(f"EPUB test suite failed: {e}")
        import traceback
        traceback.print_exc()