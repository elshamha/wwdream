from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
import json


class WritingTheme(models.Model):
    """Different writing formats/themes like novels, scripts, essays"""
    THEME_TYPES = [
        ('novel', 'Novel'),
        ('screenplay', 'Screenplay'),
        ('stage_play', 'Stage Play'),
        ('essay', 'Essay'),
        ('short_story', 'Short Story'),
        ('poetry', 'Poetry'),
        ('academic', 'Academic Paper'),
        ('blog', 'Blog Post'),
        ('technical', 'Technical Writing'),
        ('creative_nonfiction', 'Creative Nonfiction'),
    ]
    
    name = models.CharField(max_length=50, choices=THEME_TYPES, unique=True)
    description = models.TextField()
    formatting_rules = models.JSONField(default=dict, help_text="JSON formatting rules for this theme")
    default_structure = models.JSONField(default=dict, help_text="Default project structure")
    
    def __str__(self):
        return self.get_name_display()


class Project(models.Model):
    """A writing project that can contain multiple chapters/documents"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    collaborators = models.ManyToManyField(User, through='ProjectCollaborator', related_name='collaborative_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    target_word_count = models.IntegerField(default=50000, help_text="Target word count for this project")
    genre = models.CharField(max_length=100, blank=True, null=True)
    theme = models.ForeignKey(WritingTheme, on_delete=models.SET_NULL, null=True, blank=True)
    is_collaborative = models.BooleanField(default=False)
    is_public = models.BooleanField(default=False, help_text="Allow public viewing")
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('writer:project_detail', kwargs={'pk': self.pk})
    
    @property
    def total_word_count(self):
        return sum(chapter.word_count for chapter in self.chapters.all())
    
    @property
    def chapter_count(self):
        return self.chapters.count()
    
    @property
    def character_count(self):
        return self.characters.count()
    
    @property
    def progress_percentage(self):
        if self.target_word_count > 0:
            return min(100, (self.total_word_count / self.target_word_count) * 100)
        return 0
    
    @property
    def content_preview(self):
        """Get a preview of content from the first chapter"""
        first_chapter = self.chapters.first()
        if first_chapter and first_chapter.content:
            import re
            # Remove HTML tags for preview
            text = re.sub(r'<[^>]+>', '', first_chapter.content)
            # Return first 150 characters
            if len(text) > 150:
                return text[:150] + "..."
            return text
        return "No content available yet."
    
    def update_word_count(self):
        """Update the cached word count for this project"""
        total_words = sum(chapter.word_count for chapter in self.chapters.all())
        # If you want to store this in the model, you'd need to add a field
        return total_words


class ProjectCollaborator(models.Model):
    """Through model for project collaboration"""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('editor', 'Editor'),
        ('contributor', 'Contributor'),
        ('reviewer', 'Reviewer'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='contributor')
    added_at = models.DateTimeField(auto_now_add=True)
    can_edit = models.BooleanField(default=True)
    can_delete = models.BooleanField(default=False)
    can_invite_others = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['project', 'user']
    
    def __str__(self):
        return f"{self.user.username} - {self.project.title} ({self.role})"


class Character(models.Model):
    """Character management for writing projects"""
    name = models.CharField(max_length=100)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='characters')
    description = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., Protagonist, Antagonist, Supporting")
    age = models.IntegerField(blank=True, null=True)
    appearance = models.TextField(blank=True, null=True)
    personality = models.TextField(blank=True, null=True)
    background = models.TextField(blank=True, null=True)
    goals = models.TextField(blank=True, null=True)
    conflicts = models.TextField(blank=True, null=True)
    relationships = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='characters/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        unique_together = ['project', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.project.title})"


class PersonalLibrary(models.Model):
    """Personal library for each user to store their work"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='library')
    name = models.CharField(max_length=100, default="My Library")
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s Library"


class ImportedDocument(models.Model):
    """Documents imported from various sources"""
    IMPORT_TYPES = [
        ('pdf', 'PDF'),
        ('docx', 'Word Document'),
        ('google_docs', 'Google Document'),
        ('txt', 'Text File'),
        ('html', 'HTML File'),
        ('rtf', 'Rich Text Format'),
        ('odt', 'OpenDocument Text'),
    ]
    
    title = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='imported_documents')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='imported_documents')
    original_file = models.FileField(upload_to='imports/', blank=True, null=True)
    google_docs_url = models.URLField(blank=True, null=True, help_text="Google Docs sharing URL")
    import_type = models.CharField(max_length=15, choices=IMPORT_TYPES)
    extracted_content = models.TextField(blank=True, null=True)
    import_date = models.DateTimeField(auto_now_add=True)
    file_size = models.IntegerField(default=0)
    word_count = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.title} ({self.get_import_type_display()})"
    
    def save(self, *args, **kwargs):
        # Calculate word count
        if self.extracted_content:
            import re
            text = re.sub(r'<[^>]+>', '', self.extracted_content)  # Remove HTML tags
            self.word_count = len(text.split())
        super().save(*args, **kwargs)
    
    @property
    def paragraph_count(self):
        """Calculate the number of paragraphs in the content"""
        if self.extracted_content:
            import re
            # Remove HTML tags and split by double line breaks or <p> tags
            text = re.sub(r'<[^>]+>', '', self.extracted_content)
            paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
            return len(paragraphs)
        return 0


class Chapter(models.Model):
    """A chapter within a project"""
    title = models.CharField(max_length=200, default="Untitled Chapter")
    content = models.TextField(blank=True, null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='chapters')
    order = models.IntegerField(default=0, help_text="Order within the project")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    word_count = models.IntegerField(default=0)
    notes = models.TextField(blank=True, null=True, help_text="Private notes for this chapter")
    characters_mentioned = models.ManyToManyField(Character, blank=True, related_name='mentioned_in_chapters')
    last_edited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['project', 'order']
        unique_together = ['project', 'order']
    
    def __str__(self):
        return f"{self.project.title} - {self.title}"
    
    def get_absolute_url(self):
        return reverse('writer:chapter_detail', kwargs={'pk': self.pk})
    
    def save(self, *args, **kwargs):
        # Calculate word count and extract character mentions
        if self.content:
            import re
            text = re.sub(r'<[^>]+>', '', self.content)  # Remove HTML tags
            self.word_count = len(text.split())
            
            # Auto-detect character mentions
            self.auto_detect_characters()
        super().save(*args, **kwargs)
    
    def auto_detect_characters(self):
        """Automatically detect character mentions in content"""
        if self.content and self.project:
            import re
            text = re.sub(r'<[^>]+>', '', self.content).lower()
            project_characters = self.project.characters.all()
            
            for character in project_characters:
                if character.name.lower() in text:
                    self.characters_mentioned.add(character)


class Document(models.Model):
    title = models.CharField(max_length=200, default="Untitled Document")
    content = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    word_count = models.IntegerField(default=0)
    characters_mentioned = models.ManyToManyField(Character, blank=True, related_name='mentioned_in_documents')
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('writer:document_detail', kwargs={'pk': self.pk})
    
    def save(self, *args, **kwargs):
        # Calculate word count
        if self.content:
            import re
            text = re.sub(r'<[^>]+>', '', self.content)  # Remove HTML tags
            self.word_count = len(text.split())
        super().save(*args, **kwargs)


class AIAssistanceRequest(models.Model):
    """Track AI assistance requests for writing help"""
    ASSISTANCE_TYPES = [
        ('brainstorm', 'Brainstorming'),
        ('edit', 'Editing Suggestions'),
        ('continue', 'Continue Writing'),
        ('rewrite', 'Rewrite Section'),
        ('grammar', 'Grammar Check'),
        ('style', 'Style Improvement'),
        ('character', 'Character Development'),
        ('dialogue', 'Dialogue Enhancement'),
        ('plot', 'Plot Development'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(help_text="The content to get assistance with")
    assistance_type = models.CharField(max_length=20, choices=ASSISTANCE_TYPES)
    prompt = models.TextField(help_text="Additional instructions or context")
    response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_assistance_type_display()} - {self.user.username}"


class WritingSession(models.Model):
    """Track collaborative writing sessions"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='writing_sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    words_written = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.project.title} ({self.start_time})"
