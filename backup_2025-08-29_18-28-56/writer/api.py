from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Document, Project, Chapter, Character, ImportedDocument, ProjectCollaborator, WritingTheme, PersonalLibrary, WritingSession, AIAssistanceRequest
from .serializers import DocumentSerializer, ProjectSerializer, ChapterSerializer, CharacterSerializer, ImportedDocumentSerializer, ProjectCollaboratorSerializer, WritingThemeSerializer, PersonalLibrarySerializer, WritingSessionSerializer, AIAssistanceRequestSerializer
# EPUB export endpoint
from django.http import HttpResponse
from ebooklib import epub
import io

@api_view(['GET'])
def export_document_epub(request, document_id):
    try:
        doc = Document.objects.get(pk=document_id)
        book = epub.EpubBook()
        book.set_identifier(str(doc.id))
        book.set_title(doc.title)
        book.set_language('en')
        book.add_author(doc.author.username)

        # Add content as a chapter
        chapter = epub.EpubHtml(title=doc.title, file_name='chapter1.xhtml', lang='en')
        chapter.content = f'<h1>{doc.title}</h1><p>{doc.content}</p>'
        book.add_item(chapter)
        book.spine = ['nav', chapter]
        book.add_item(epub.EpubNcx())
        book.add_item(epub.EpubNav())

        # Write to bytes
        out = io.BytesIO()
        epub.write_epub(out, book)
        out.seek(0)
        response = HttpResponse(out.read(), content_type='application/epub+zip')
        response['Content-Disposition'] = f'attachment; filename="{doc.title or "document"}.epub"'
        return response
    except Document.DoesNotExist:
        return Response({'error': 'Document not found.'}, status=status.HTTP_404_NOT_FOUND)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Document, Project, Chapter, Character, ImportedDocument, ProjectCollaborator, WritingTheme, PersonalLibrary, WritingSession, AIAssistanceRequest
from .serializers import DocumentSerializer, ProjectSerializer, ChapterSerializer, CharacterSerializer, ImportedDocumentSerializer, ProjectCollaboratorSerializer, WritingThemeSerializer, PersonalLibrarySerializer, WritingSessionSerializer, AIAssistanceRequestSerializer

# User profile endpoint
@api_view(['GET'])
def user_profile(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
    user = request.user
    return Response({
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })

# Registration endpoint
@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if not username or not password or not email:
        return Response({'error': 'All fields required.'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(username=username, password=password, email=email)
    return Response({'success': 'User registered successfully.'}, status=status.HTTP_201_CREATED)

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.all()
    serializer_class = CharacterSerializer
    permission_classes = [permissions.IsAuthenticated]

class ImportedDocumentViewSet(viewsets.ModelViewSet):
    queryset = ImportedDocument.objects.all()
    serializer_class = ImportedDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProjectCollaboratorViewSet(viewsets.ModelViewSet):
    queryset = ProjectCollaborator.objects.all()
    serializer_class = ProjectCollaboratorSerializer
    permission_classes = [permissions.IsAuthenticated]

class WritingThemeViewSet(viewsets.ModelViewSet):
    queryset = WritingTheme.objects.all()
    serializer_class = WritingThemeSerializer
    permission_classes = [permissions.IsAuthenticated]

class PersonalLibraryViewSet(viewsets.ModelViewSet):
    queryset = PersonalLibrary.objects.all()
    serializer_class = PersonalLibrarySerializer
    permission_classes = [permissions.IsAuthenticated]

class WritingSessionViewSet(viewsets.ModelViewSet):
    queryset = WritingSession.objects.all()
    serializer_class = WritingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

class AIAssistanceRequestViewSet(viewsets.ModelViewSet):
    queryset = AIAssistanceRequest.objects.all()
    serializer_class = AIAssistanceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]



