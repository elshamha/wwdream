#!/usr/bin/env python
"""
Test script for PDF export functionality
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from io import BytesIO

def test_pdf_generation():
    """Test basic PDF generation with ReportLab"""
    
    # Create a buffer
    buffer = BytesIO()
    
    # Create PDF document
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Container for flowables
    elements = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Add custom styles
    styles.add(ParagraphStyle(name='BookTitle',
                             parent=styles['Heading1'],
                             fontSize=24,
                             alignment=TA_CENTER,
                             spaceAfter=30))
    
    # Add content
    elements.append(Paragraph("Test PDF Export", styles['BookTitle']))
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph("by Atticus Writer", styles['Title']))
    elements.append(Spacer(1, 0.5*inch))
    
    # Add sample chapter
    elements.append(PageBreak())
    elements.append(Paragraph("Chapter 1: Introduction", styles['Heading2']))
    elements.append(Spacer(1, 0.2*inch))
    
    sample_text = """This is a test of the PDF export functionality. 
    The system can now convert writing projects, chapters, and documents 
    into professionally formatted PDF files for easy sharing and printing.
    
    Users can download their entire project as a single PDF, export individual 
    chapters, or convert standalone documents. The formatting preserves the 
    structure and readability of the original content."""
    
    for paragraph in sample_text.split('\n'):
        if paragraph.strip():
            elements.append(Paragraph(paragraph.strip(), styles['Normal']))
            elements.append(Spacer(1, 0.1*inch))
    
    # Build PDF
    doc.build(elements)
    
    # Save to file
    buffer.seek(0)
    with open('test_export.pdf', 'wb') as f:
        f.write(buffer.read())
    
    print("PDF generation test successful!")
    print("Test PDF saved as 'test_export.pdf'")
    return True

if __name__ == "__main__":
    try:
        test_pdf_generation()
        print("\nAll PDF export tests passed!")
    except Exception as e:
        print(f"PDF generation test failed: {e}")
        import traceback
        traceback.print_exc()