from rest_framework import viewsets, permissions
from .models import Document, Project, Chapter, Character, ImportedDocument, ProjectCollaborator, WritingTheme, PersonalLibrary, WritingSession, AIAssistanceRequest, DocumentVersion, IdeaJotPad, DreamLog
from .serializers import DocumentSerializer, ProjectSerializer, ChapterSerializer, CharacterSerializer, ImportedDocumentSerializer, ProjectCollaboratorSerializer, WritingThemeSerializer, PersonalLibrarySerializer, WritingSessionSerializer, AIAssistanceRequestSerializer, DocumentVersionSerializer, IdeaJotPadSerializer, DreamLogSerializer

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

class DocumentVersionViewSet(viewsets.ModelViewSet):
    queryset = DocumentVersion.objects.all()
    serializer_class = DocumentVersionSerializer
    permission_classes = [permissions.IsAuthenticated]

class IdeaJotPadViewSet(viewsets.ModelViewSet):
    queryset = IdeaJotPad.objects.all()
    serializer_class = IdeaJotPadSerializer
    permission_classes = [permissions.IsAuthenticated]

class DreamLogViewSet(viewsets.ModelViewSet):
    queryset = DreamLog.objects.all()
    serializer_class = DreamLogSerializer
    permission_classes = [permissions.IsAuthenticated]
