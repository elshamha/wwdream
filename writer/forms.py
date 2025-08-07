from django import forms
from django.contrib.auth.models import User
from django.db import models
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
    class Meta:
        model = ImportedDocument
        fields = ['title', 'original_file', 'project']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Document title...'
            }),
            'original_file': forms.FileInput(attrs={
                'class': 'form-control',
                'accept': '.pdf,.docx,.doc,.txt,.rtf,.odt'
            }),
            'project': forms.Select(attrs={
                'class': 'form-control'
            })
        }
    
    def __init__(self, *args, **kwargs):
        user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        if user:
            self.fields['project'].queryset = Project.objects.filter(
                models.Q(author=user) | models.Q(collaborators=user)
            ).distinct()
        self.fields['project'].required = False


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


class DevicePreviewForm(forms.Form):
    DEVICE_CHOICES = [
        ('iphone', 'iPhone'),
        ('ipad', 'iPad'),
        ('kindle', 'Amazon Kindle'),
        ('imac', 'iMac'),
        ('macbook', 'MacBook'),
        ('android_phone', 'Android Phone'),
        ('android_tablet', 'Android Tablet'),
        ('windows_laptop', 'Windows Laptop'),
        ('paperback', 'Paperback Book'),
        ('hardcover', 'Hardcover Book'),
    ]
    
    device = forms.ChoiceField(
        choices=DEVICE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    font_family = forms.ChoiceField(
        choices=[
            ('serif', 'Serif (Times New Roman)'),
            ('sans-serif', 'Sans-serif (Arial)'),
            ('georgia', 'Georgia'),
            ('palatino', 'Palatino'),
            ('bookman', 'Bookman'),
            ('minion', 'Minion Pro'),
        ],
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    font_size = forms.IntegerField(
        min_value=8,
        max_value=72,
        initial=16,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    line_height = forms.FloatField(
        min_value=1.0,
        max_value=3.0,
        initial=1.5,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'step': '0.1'})
    )
