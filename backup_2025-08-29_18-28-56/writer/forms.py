from django import forms
from django.contrib.auth.models import User
from django.db import models
import os
from .models import (Document, Project, Chapter, AIAssistanceRequest, 
                    Character, ImportedDocument, ProjectCollaborator, WritingTheme)


class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['title', 'content', 'project', 'is_published']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter document title...'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 20
            }),
            'project': forms.Select(attrs={
                'class': 'form-control'
            }),
            'is_published': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        self.fields['title'].required = False
        self.fields['content'].required = False
        if user:
            self.fields['project'].queryset = Project.objects.filter(
                models.Q(author=user) | models.Q(collaborators=user)
            ).distinct()


class ProjectForm(forms.ModelForm):
    collaborator_emails = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter email addresses separated by commas...'
        }),
        help_text="Add collaborators by email (separated by commas)"
    )
    
    class Meta:
        model = Project
        fields = ['title', 'description', 'target_word_count', 'genre', 'theme', 'is_collaborative', 'is_public']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter project title...'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Describe your project...'
            }),
            'target_word_count': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 1000
            }),
            'genre': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Fantasy, Romance, Sci-Fi...'
            }),
            'theme': forms.Select(attrs={
                'class': 'form-control'
            }),
            'is_collaborative': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'is_public': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }


class ChapterForm(forms.ModelForm):
    class Meta:
        model = Chapter
        fields = ['title', 'content', 'order', 'notes']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter chapter title...'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 20
            }),
            'order': forms.NumberInput(attrs={
                'class': 'form-control'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Private notes for this chapter...'
            })
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['content'].required = False
        self.fields['notes'].required = False


class CharacterForm(forms.ModelForm):
    class Meta:
        model = Character
        fields = ['name', 'description', 'role', 'age', 'appearance', 'personality', 
                 'background', 'goals', 'conflicts', 'relationships', 'notes', 'image']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Character name...'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Brief character description...'
            }),
            'role': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Protagonist, Antagonist, Supporting...'
            }),
            'age': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': 0
            }),
            'appearance': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Physical appearance...'
            }),
            'personality': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Personality traits...'
            }),
            'background': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Character background and history...'
            }),
            'goals': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Character goals and motivations...'
            }),
            'conflicts': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Internal and external conflicts...'
            }),
            'relationships': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Relationships with other characters...'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Additional notes...'
            }),
            'image': forms.FileInput(attrs={
                'class': 'form-control'
            })
        }


class ImportDocumentForm(forms.ModelForm):
    # Google Docs URL field
    google_docs_url = forms.URLField(
        required=False,
        help_text="Paste a Google Docs sharing URL here instead of uploading a file",
        widget=forms.URLInput(attrs={
            'class': 'form-control',
            'placeholder': 'https://docs.google.com/document/d/...',
        })
    )
    
    # Additional fields for better document processing
    preserve_formatting = forms.BooleanField(
        required=False,
        initial=True,
        help_text="Preserve bold, italic, headings, and other formatting",
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        })
    )
    
    extract_metadata = forms.BooleanField(
        required=False,
        initial=True,
        help_text="Extract document metadata like creation date and author",
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        })
    )
    
    auto_create_chapters = forms.BooleanField(
        required=False,
        initial=False,
        help_text="Automatically split document into chapters based on headings",
        widget=forms.CheckboxInput(attrs={
            'class': 'form-check-input'
        })
    )
    
    description = forms.CharField(
        required=False,
        help_text="Optional description for this imported document",
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'Document description (optional)...'
        })
    )
    
    target_project = forms.ModelChoiceField(
        queryset=Project.objects.none(),
        required=False,
        empty_label="Create New Project Automatically",
        help_text="Select an existing project or leave blank to automatically create a new project",
        widget=forms.Select(attrs={
            'class': 'form-control'
        })
    )
    
    class Meta:
        model = ImportedDocument
        fields = ['title', 'original_file', 'google_docs_url', 'description']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Document title...',
                'required': True
            }),
            'original_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf,.docx,.doc,.txt,.rtf,.odt,.html,.htm',
                'title': 'Select PDF, Word, Text, RTF, ODT, or HTML files'
            })
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['target_project'].queryset = Project.objects.filter(
                models.Q(author=user) | models.Q(collaborators=user)
            ).distinct()
        
        # Make original_file not required since user can use Google Docs URL
        self.fields['original_file'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        original_file = cleaned_data.get('original_file')
        google_docs_url = cleaned_data.get('google_docs_url')
        
        # Ensure either file or Google Docs URL is provided
        if not original_file and not google_docs_url:
            raise forms.ValidationError("Please either upload a file or provide a Google Docs URL.")
        
        if original_file and google_docs_url:
            raise forms.ValidationError("Please provide either a file upload OR a Google Docs URL, not both.")
        
        # Validate Google Docs URL if provided
        if google_docs_url:
            # from .document_parser import validate_document_access, is_google_docs_url
            
            # if not is_google_docs_url(google_docs_url):
            #     raise forms.ValidationError("Please provide a valid Google Docs URL.")
            
            # is_valid, message = validate_document_access(google_docs_url)
            # if not is_valid:
            #     raise forms.ValidationError(f"Google Docs access error: {message}")
            raise forms.ValidationError("Google Docs import is temporarily disabled. Please export as DOCX and upload the file instead.")
        
        return cleaned_data
    
    def clean_original_file(self):
        file = self.cleaned_data.get('original_file')
        if file:
            # Check file size (max 50MB)
            if file.size > 50 * 1024 * 1024:
                raise forms.ValidationError("File size cannot exceed 50MB.")
            
            # Check file extension
            allowed_extensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.odt', '.html', '.htm']
            file_extension = os.path.splitext(file.name)[1].lower()
            if file_extension not in allowed_extensions:
                raise forms.ValidationError(
                    f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
                )
        return file


class CollaboratorForm(forms.ModelForm):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter collaborator email...'
        })
    )
    
    class Meta:
        model = ProjectCollaborator
        fields = ['role', 'can_edit', 'can_delete', 'can_invite_others']
        widgets = {
            'role': forms.Select(attrs={
                'class': 'form-control'
            }),
            'can_edit': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'can_delete': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
            'can_invite_others': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            })
        }


class AIAssistanceForm(forms.ModelForm):
    class Meta:
        model = AIAssistanceRequest
        fields = ['content', 'assistance_type', 'prompt']
        widgets = {
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 5,
                'placeholder': 'Paste the text you need help with...'
            }),
            'assistance_type': forms.Select(attrs={
                'class': 'form-control'
            }),
            'prompt': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Additional instructions or context...'
            })
        }
