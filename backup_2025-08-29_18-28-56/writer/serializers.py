from rest_framework import serializers
from .models import Document, Project, Chapter, Character, ImportedDocument, ProjectCollaborator, WritingTheme, PersonalLibrary, WritingSession, AIAssistanceRequest

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = '__all__'

class CharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Character
        fields = '__all__'

class ImportedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportedDocument
        fields = '__all__'

class ProjectCollaboratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCollaborator
        fields = '__all__'

class WritingThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WritingTheme
        fields = '__all__'

class PersonalLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalLibrary
        fields = '__all__'

class WritingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WritingSession
        fields = '__all__'

class AIAssistanceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAssistanceRequest
        fields = '__all__'

