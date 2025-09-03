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
    show_on_dashboard = models.BooleanField(default=True, help_text="Show this project on the dashboard bookshelf")
    ai_assistance_level = models.CharField(max_length=20, default='medium', choices=[
        ('minimal', 'Minimal AI Help'),
        ('medium', 'Standard AI Assistance'),
        ('maximum', 'Maximum AI Integration')
    ])
    writing_style_guide = models.CharField(max_length=20, default='mla', choices=[
        ('mla', 'MLA Format'),
        ('apa', 'APA Format'),
        ('chicago', 'Chicago Style'),
        ('custom', 'Custom Style')
    ])
    
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
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_documents', help_text="Users with whom this document is shared")
    
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


class UserProfile(models.Model):
    """Extended user profile with preferences and settings"""
    THEME_CHOICES = [
        ('ethereal', 'Ethereal (Default)'),
        ('forest', 'Forest Green'),
        ('ocean', 'Ocean Blue'),
        ('sunset', 'Sunset Orange'),
        ('midnight', 'Midnight Dark'),
        ('lavender', 'Lavender Purple'),
        ('autumn', 'Autumn Warm'),
        ('monochrome', 'Monochrome'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='writer_profile')
    theme = models.CharField(max_length=20, choices=THEME_CHOICES, default='ethereal')
    font_size = models.CharField(max_length=10, default='medium', choices=[
        ('small', 'Small'),
        ('medium', 'Medium'),
        ('large', 'Large'),
        ('x-large', 'Extra Large'),
    ])
    writing_goal_daily = models.IntegerField(default=500, help_text="Daily word count goal")
    preferred_editor = models.CharField(max_length=20, default='ultimate', choices=[
        ('ultimate', 'Ultimate Editor'),
        ('simple', 'Simple Editor'),
        ('academic', 'Academic Editor'),
        ('google_docs', 'Google Docs Style'),
    ])
    show_statistics = models.BooleanField(default=True)
    show_bookshelf = models.BooleanField(default=True)
    
    # New profile fields
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        null=True, 
        blank=True,
        help_text="Upload a profile picture"
    )
    bio = models.TextField(
        max_length=500, 
        blank=True, 
        null=True,
        help_text="Tell us about yourself"
    )
    interests = models.TextField(
        blank=True, 
        null=True,
        help_text="Your writing interests (e.g., fantasy, sci-fi, romance, mystery)"
    )
    favorite_writers = models.TextField(
        blank=True, 
        null=True,
        help_text="Authors who inspire you"
    )
    favorite_quotes = models.TextField(
        blank=True, 
        null=True,
        help_text="Quotes that motivate your writing"
    )
    hopes_and_dreams = models.TextField(
        blank=True, 
        null=True,
        help_text="Your writing goals and aspirations"
    )
    location = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Where you're writing from"
    )
    website = models.URLField(
        blank=True, 
        null=True,
        help_text="Your personal website or blog"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Get or create a profile for the given user"""
        profile, created = cls.objects.get_or_create(user=user)
        return profile


class CreativeNotebook(models.Model):
    """Creative Notebook for brainstorming and idea development"""
    title = models.CharField(max_length=200, default="My Creative Notebook")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creative_notebooks')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='creative_notebooks')
    description = models.TextField(blank=True, null=True)
    board_data = models.JSONField(default=dict, help_text="Stores the visual board layout and connections")
    notes = models.TextField(blank=True, null=True)
    ai_suggestions = models.JSONField(default=list, help_text="Stores AI-generated suggestions")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_shared = models.BooleanField(default=False)
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_creative_notebooks')
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"


class CreativeNode(models.Model):
    """Individual nodes in the creative notebook board"""
    NODE_TYPES = [
        ('idea', 'Idea'),
        ('character', 'Character'),
        ('plot', 'Plot Point'),
        ('conflict', 'Conflict'),
        ('theme', 'Theme'),
        ('setting', 'Setting'),
        ('note', 'Note'),
        ('question', 'Question'),
    ]
    
    notebook = models.ForeignKey(CreativeNotebook, on_delete=models.CASCADE, related_name='nodes')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True)
    node_type = models.CharField(max_length=20, choices=NODE_TYPES, default='idea')
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    color = models.CharField(max_length=7, default='#4CAF50', help_text="Hex color code")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} ({self.get_node_type_display()})"


class NodeConnection(models.Model):
    """Connections between creative nodes"""
    CONNECTION_TYPES = [
        ('leads_to', 'Leads To'),
        ('relates_to', 'Relates To'),
        ('conflicts_with', 'Conflicts With'),
        ('supports', 'Supports'),
        ('explains', 'Explains'),
        ('causes', 'Causes'),
        ('prevents', 'Prevents'),
    ]
    
    from_node = models.ForeignKey(CreativeNode, on_delete=models.CASCADE, related_name='outgoing_connections')
    to_node = models.ForeignKey(CreativeNode, on_delete=models.CASCADE, related_name='incoming_connections')
    connection_type = models.CharField(max_length=20, choices=CONNECTION_TYPES, default='relates_to')
    label = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['from_node', 'to_node']
    
    def __str__(self):
        return f"{self.from_node.title} {self.get_connection_type_display()} {self.to_node.title}"


class WorkshopSession(models.Model):
    """Saved creativity workshop sessions"""
    SESSION_TYPES = [
        ('character_development', 'Character Development'),
        ('plot_brainstorming', 'Plot Brainstorming'),
        ('world_building', 'World Building'),
        ('general_creative', 'General Creative Session'),
        ('problem_solving', 'Problem Solving'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workshop_sessions')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='workshop_sessions')
    session_type = models.CharField(max_length=30, choices=SESSION_TYPES, default='general_creative')
    
    # JSON fields to store workshop data
    character_ideas = models.JSONField(default=list, blank=True, help_text="Character ideas generated in this session")
    plot_ideas = models.JSONField(default=list, blank=True, help_text="Plot ideas generated in this session")
    world_building_notes = models.JSONField(default=list, blank=True, help_text="World building concepts")
    general_notes = models.TextField(blank=True, null=True, help_text="General notes from the session")
    ai_suggestions_used = models.JSONField(default=list, blank=True, help_text="AI suggestions that were accepted/used")
    connections_made = models.JSONField(default=list, blank=True, help_text="Idea connections made during session")
    
    # Session metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    session_duration_minutes = models.IntegerField(default=0, help_text="How long the session lasted")
    is_completed = models.BooleanField(default=False, help_text="Whether the user marked the session as complete")
    is_archived = models.BooleanField(default=False, help_text="Archived sessions are hidden from main view")
    
    class Meta:
        ordering = ['-updated_at']
        
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def get_absolute_url(self):
        return reverse('writer:workshop_session_detail', kwargs={'pk': self.pk})
    
    @property
    def total_ideas_count(self):
        """Count total ideas across all categories"""
        return (len(self.character_ideas) + 
                len(self.plot_ideas) + 
                len(self.world_building_notes) + 
                len(self.ai_suggestions_used))
    
    @property
    def is_recent(self):
        """Check if session was created in the last 7 days"""
        from django.utils import timezone
        from datetime import timedelta
        return self.created_at >= timezone.now() - timedelta(days=7)


class MediaFile(models.Model):
    """Media files storage for multiple file types"""
    FILE_TYPES = [
        ('document', 'Document'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('other', 'Other'),
    ]
    
    DOCUMENT_FORMATS = [
        ('pdf', 'PDF'),
        ('docx', 'Word Document'),
        ('doc', 'Word Document (Legacy)'),
        ('txt', 'Text File'),
        ('rtf', 'Rich Text Format'),
        ('odt', 'OpenDocument Text'),
        ('html', 'HTML File'),
        ('md', 'Markdown'),
    ]
    
    IMAGE_FORMATS = [
        ('jpg', 'JPEG Image'),
        ('jpeg', 'JPEG Image'),
        ('png', 'PNG Image'),
        ('gif', 'GIF Image'),
        ('webp', 'WebP Image'),
        ('svg', 'SVG Image'),
        ('bmp', 'Bitmap Image'),
    ]
    
    VIDEO_FORMATS = [
        ('mp4', 'MP4 Video'),
        ('avi', 'AVI Video'),
        ('mov', 'QuickTime Video'),
        ('wmv', 'Windows Media Video'),
        ('flv', 'Flash Video'),
        ('webm', 'WebM Video'),
        ('mkv', 'Matroska Video'),
    ]
    
    AUDIO_FORMATS = [
        ('mp3', 'MP3 Audio'),
        ('wav', 'WAV Audio'),
        ('flac', 'FLAC Audio'),
        ('aac', 'AAC Audio'),
        ('ogg', 'OGG Audio'),
        ('m4a', 'M4A Audio'),
    ]
    
    title = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='media_files')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='media_files')
    file = models.FileField(upload_to='media_library/')
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    file_format = models.CharField(max_length=10, blank=True, null=True)
    file_size = models.BigIntegerField(default=0, help_text="File size in bytes")
    duration = models.DurationField(null=True, blank=True, help_text="Duration for video/audio files")
    dimensions = models.JSONField(null=True, blank=True, help_text="Width/height for images/videos")
    extracted_text = models.TextField(blank=True, null=True, help_text="Extracted text content from documents")
    metadata = models.JSONField(default=dict, help_text="Additional file metadata")
    tags = models.JSONField(default=list, help_text="User-defined tags")
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    upload_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-upload_date']
        
    def __str__(self):
        return f"{self.title} ({self.get_file_type_display()})"
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            file_extension = self.file.name.split('.')[-1].lower()
            self.file_format = file_extension
            
            # Determine file type based on extension
            if file_extension in ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'md']:
                self.file_type = 'document'
            elif file_extension in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']:
                self.file_type = 'image'
            elif file_extension in ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']:
                self.file_type = 'video'
            elif file_extension in ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a']:
                self.file_type = 'audio'
            else:
                self.file_type = 'other'
        
        super().save(*args, **kwargs)
    
    @property
    def file_size_human(self):
        """Human readable file size"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    @property
    def is_viewable_in_browser(self):
        """Check if file can be viewed directly in browser"""
        viewable_formats = ['pdf', 'txt', 'html', 'md', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mp3', 'wav']
        return self.file_format in viewable_formats
    
    @property
    def thumbnail_url(self):
        """Get thumbnail URL for images and videos"""
        if self.file_type == 'image':
            return self.file.url
        elif self.file_type == 'video':
            return '/static/images/video-thumbnail.png'
        elif self.file_type == 'audio':
            return '/static/images/audio-thumbnail.png'
        elif self.file_type == 'document':
            return '/static/images/document-thumbnail.png'
        else:
            return '/static/images/file-thumbnail.png'


class DocumentVersion(models.Model):
    """Version control for documents - stores historical versions"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField(default=1)
    title = models.CharField(max_length=200)
    content = models.TextField()
    saved_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='document_versions_saved')
    save_reason = models.CharField(max_length=100, blank=True, null=True, help_text="Reason for saving this version")
    created_at = models.DateTimeField(auto_now_add=True)
    word_count = models.IntegerField(default=0)
    is_major_version = models.BooleanField(default=False, help_text="Mark important versions")
    is_published_version = models.BooleanField(default=False, help_text="Version that was published")
    
    class Meta:
        ordering = ['-version_number']
        unique_together = ['document', 'version_number']
    
    def __str__(self):
        return f"{self.document.title} - Version {self.version_number}"
    
    def save(self, *args, **kwargs):
        # Calculate word count
        if self.content:
            import re
            text = re.sub(r'<[^>]+>', '', self.content)  # Remove HTML tags
            self.word_count = len(text.split())
        super().save(*args, **kwargs)
    
    @property
    def changes_summary(self):
        """Compare with previous version to show changes"""
        previous_version = DocumentVersion.objects.filter(
            document=self.document,
            version_number__lt=self.version_number
        ).first()
        
        if not previous_version:
            return "Initial version"
        
        # Simple change detection
        old_word_count = previous_version.word_count
        new_word_count = self.word_count
        word_diff = new_word_count - old_word_count
        
        if word_diff > 0:
            return f"+{word_diff} words added"
        elif word_diff < 0:
            return f"{word_diff} words removed"
        else:
            return "Content modified"


class ChapterVersion(models.Model):
    """Version control for chapters - stores historical versions"""
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField(default=1)
    title = models.CharField(max_length=200)
    content = models.TextField()
    saved_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chapter_versions_saved')
    save_reason = models.CharField(max_length=100, blank=True, null=True, help_text="Reason for saving this version")
    created_at = models.DateTimeField(auto_now_add=True)
    word_count = models.IntegerField(default=0)
    is_major_version = models.BooleanField(default=False, help_text="Mark important versions")
    is_published_version = models.BooleanField(default=False, help_text="Version that was published")
    
    class Meta:
        ordering = ['-version_number']
        unique_together = ['chapter', 'version_number']
    
    def __str__(self):
        return f"{self.chapter.title} - Version {self.version_number}"
    
    def save(self, *args, **kwargs):
        # Calculate word count
        if self.content:
            import re
            text = re.sub(r'<[^>]+>', '', self.content)  # Remove HTML tags
            self.word_count = len(text.split())
        super().save(*args, **kwargs)
    
    @property
    def changes_summary(self):
        """Compare with previous version to show changes"""
        previous_version = ChapterVersion.objects.filter(
            chapter=self.chapter,
            version_number__lt=self.version_number
        ).first()
        
        if not previous_version:
            return "Initial version"
        
        # Simple change detection
        old_word_count = previous_version.word_count
        new_word_count = self.word_count
        word_diff = new_word_count - old_word_count
        
        if word_diff > 0:
            return f"+{word_diff} words added"
        elif word_diff < 0:
            return f"{word_diff} words removed"
        else:
            return "Content modified"


class VersionControlSettings(models.Model):
    """User preferences for version control"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='version_settings')
    auto_save_enabled = models.BooleanField(default=True, help_text="Automatically create versions on save")
    auto_save_interval = models.IntegerField(default=10, help_text="Minutes between auto-saves")
    max_versions_to_keep = models.IntegerField(default=50, help_text="Maximum versions to keep per document")
    notify_on_version_save = models.BooleanField(default=True, help_text="Show notifications when versions are saved")
    require_save_reason = models.BooleanField(default=False, help_text="Require reason when manually saving versions")
    
    def __str__(self):
        return f"Version Settings for {self.user.username}"
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Get or create version settings for the given user"""
        settings, created = cls.objects.get_or_create(user=user)
        return settings


class ClassicBook(models.Model):
    """Public domain books available in the classics library"""
    GENRE_CHOICES = [
        ('fiction', 'Fiction'),
        ('non-fiction', 'Non-Fiction'),
        ('poetry', 'Poetry'),
        ('drama', 'Drama'),
        ('philosophy', 'Philosophy'),
        ('history', 'History'),
        ('science', 'Science'),
        ('biography', 'Biography'),
        ('romance', 'Romance'),
        ('mystery', 'Mystery'),
        ('adventure', 'Adventure'),
        ('fantasy', 'Fantasy'),
        ('horror', 'Horror'),
        ('children', 'Children\'s Literature'),
    ]
    
    LANGUAGE_CHOICES = [
        ('english', 'English'),
        ('french', 'French'),
        ('german', 'German'),
        ('spanish', 'Spanish'),
        ('italian', 'Italian'),
        ('portuguese', 'Portuguese'),
        ('russian', 'Russian'),
        ('latin', 'Latin'),
        ('greek', 'Greek'),
        ('chinese', 'Chinese'),
        ('japanese', 'Japanese'),
        ('arabic', 'Arabic'),
    ]
    
    ERA_CHOICES = [
        ('ancient', 'Ancient (Before 500 CE)'),
        ('medieval', 'Medieval (500-1500)'),
        ('renaissance', 'Renaissance (1500-1700)'),
        ('enlightenment', 'Enlightenment (1700-1800)'),
        ('romantic', 'Romantic (1800-1850)'),
        ('victorian', 'Victorian (1850-1900)'),
        ('modern', 'Modern (1900-1950)'),
        ('contemporary', 'Contemporary (1950+)'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=500)
    author = models.CharField(max_length=200)
    original_title = models.CharField(max_length=500, blank=True, help_text="Original title if translated")
    subtitle = models.CharField(max_length=500, blank=True)
    
    # Classification
    genre = models.CharField(max_length=50, choices=GENRE_CHOICES)
    language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, default='english')
    original_language = models.CharField(max_length=50, choices=LANGUAGE_CHOICES, blank=True)
    era = models.CharField(max_length=50, choices=ERA_CHOICES)
    
    # Publication Details
    publication_year = models.IntegerField(help_text="Year of original publication")
    copyright_status = models.CharField(max_length=100, default='Public Domain')
    gutenberg_id = models.CharField(max_length=20, blank=True, help_text="Project Gutenberg ID if available")
    
    # Content Details
    description = models.TextField(help_text="Book description or synopsis")
    page_count = models.IntegerField(blank=True, null=True)
    word_count = models.IntegerField(blank=True, null=True)
    isbn = models.CharField(max_length=20, blank=True)
    
    # Metadata
    subjects = models.JSONField(default=list, help_text="List of subject categories")
    keywords = models.JSONField(default=list, help_text="Keywords for search")
    
    # Files and Resources
    cover_image_url = models.URLField(blank=True, help_text="URL to book cover image")
    epub_url = models.URLField(blank=True, help_text="URL to EPUB file")
    pdf_url = models.URLField(blank=True, help_text="URL to PDF file")
    txt_url = models.URLField(blank=True, help_text="URL to plain text file")
    html_url = models.URLField(blank=True, help_text="URL to HTML version")
    mobi_url = models.URLField(blank=True, help_text="URL to MOBI file")
    
    # Statistics
    download_count = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    rating_count = models.IntegerField(default=0)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_featured = models.BooleanField(default=False, help_text="Featured on homepage")
    is_active = models.BooleanField(default=True, help_text="Available for borrowing")
    
    class Meta:
        ordering = ['-is_featured', 'title']
        indexes = [
            models.Index(fields=['genre']),
            models.Index(fields=['language']),
            models.Index(fields=['era']),
            models.Index(fields=['author']),
            models.Index(fields=['publication_year']),
            models.Index(fields=['-download_count']),
            models.Index(fields=['-rating']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.author}"
    
    @property
    def available_formats(self):
        """Return list of available formats"""
        formats = []
        if self.epub_url:
            formats.append('epub')
        if self.pdf_url:
            formats.append('pdf')
        if self.txt_url:
            formats.append('txt')
        if self.html_url:
            formats.append('html')
        if self.mobi_url:
            formats.append('mobi')
        return formats
    
    @property
    def primary_download_url(self):
        """Return the primary download URL (prefer EPUB, then PDF, then TXT)"""
        if self.epub_url:
            return self.epub_url
        elif self.pdf_url:
            return self.pdf_url
        elif self.txt_url:
            return self.txt_url
        elif self.html_url:
            return self.html_url
        elif self.mobi_url:
            return self.mobi_url
        return None


class BorrowedBook(models.Model):
    """Track books borrowed by users from the classics library"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowed_books')
    book = models.ForeignKey(ClassicBook, on_delete=models.CASCADE, related_name='borrowers')
    borrowed_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(auto_now=True)
    reading_progress = models.IntegerField(default=0, help_text="Reading progress as percentage")
    current_page = models.IntegerField(default=1)
    bookmarks = models.JSONField(default=list, help_text="List of bookmarked pages/positions")
    notes = models.TextField(blank=True, help_text="User's notes on this book")
    favorite = models.BooleanField(default=False)
    reading_status = models.CharField(max_length=20, default='not_started', choices=[
        ('not_started', 'Not Started'),
        ('reading', 'Currently Reading'),
        ('finished', 'Finished'),
        ('paused', 'Paused'),
        ('abandoned', 'Abandoned'),
    ])
    
    class Meta:
        unique_together = ['user', 'book']
        ordering = ['-last_read_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.book.title}"
    
    @property
    def is_reading(self):
        return self.reading_status == 'reading'
    
    @property
    def is_finished(self):
        return self.reading_status == 'finished'


class BookReview(models.Model):
    """User reviews for classic books"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(ClassicBook, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], help_text="Rating from 1 to 5 stars")
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    helpful_votes = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['user', 'book']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s review of {self.book.title}"
