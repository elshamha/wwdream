from django.core.management.base import BaseCommand
from writer.models import ClassicBook

class Command(BaseCommand):
    help = 'Populates the database with classic books'

    def handle(self, *args, **options):
        # Sample classic books data
        books_data = [
            {
                'title': 'Pride and Prejudice',
                'author': 'Jane Austen',
                'year': 1813,
                'genre': 'fiction',
                'language': 'english',
                'pages': 432,
                'description': 'A romantic novel of manners written by Jane Austen in 1813.',
                'gutenberg_id': '1342',
                'epub_url': 'https://www.gutenberg.org/ebooks/1342.epub.images',
                'txt_url': 'https://www.gutenberg.org/files/1342/1342-0.txt',
                'html_url': 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm',
                'rating': 4.8,
                'download_count': 15420,
                'is_featured': True,
            },
            {
                'title': 'The Adventures of Sherlock Holmes',
                'author': 'Arthur Conan Doyle',
                'year': 1892,
                'genre': 'mystery',
                'language': 'english',
                'pages': 307,
                'description': 'A collection of twelve short stories featuring Sherlock Holmes.',
                'gutenberg_id': '1661',
                'epub_url': 'https://www.gutenberg.org/ebooks/1661.epub.images',
                'txt_url': 'https://www.gutenberg.org/files/1661/1661-0.txt',
                'html_url': 'https://www.gutenberg.org/files/1661/1661-h/1661-h.htm',
                'rating': 4.9,
                'download_count': 12300,
                'is_featured': True,
            },
        ]

        created_count = 0
        for book_data in books_data:
            book, created = ClassicBook.objects.get_or_create(
                title=book_data['title'],
                author=book_data['author'],
                defaults=book_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created: {book.title} by {book.author}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} books')
        )
