from django.contrib import admin
from .models import (
    Document, Project, Chapter, AIAssistanceRequest, MediaFile, Character,
    DocumentVersion, ChapterVersion, VersionControlSettings
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'chapter_count', 'total_word_count', 'target_word_count', 'progress_percentage', 'created_at']
    list_filter = ['created_at', 'updated_at', 'author', 'genre']
    search_fields = ['title', 'description', 'author__username']
    readonly_fields = ['created_at', 'updated_at']
    
    def chapter_count(self, obj):
        return obj.chapter_count
    chapter_count.short_description = 'Chapters'
    
    def total_word_count(self, obj):
        return obj.total_word_count
    total_word_count.short_description = 'Total Words'
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage:.1f}%"
    progress_percentage.short_description = 'Progress'


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'word_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['title', 'content']
    readonly_fields = ['word_count', 'created_at', 'updated_at']
    ordering = ['order']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'word_count', 'is_published', 'created_at', 'updated_at']
    list_filter = ['is_published', 'created_at', 'updated_at', 'author']
    search_fields = ['title', 'content', 'author__username']
    list_editable = ['is_published']
    readonly_fields = ['word_count', 'created_at', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'author', 'content', 'is_published')
        }),
        ('Metadata', {
            'fields': ('word_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AIAssistanceRequest)
class AIAssistanceRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'assistance_type', 'created_at', 'content_preview']
    list_filter = ['assistance_type', 'created_at', 'user']
    search_fields = ['content', 'prompt', 'response', 'user__username']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'file_type', 'file_size_display', 'upload_date']
    list_filter = ['file_type', 'upload_date', 'user']
    search_fields = ['title', 'description', 'user__username']
    readonly_fields = ['file_size', 'file_format', 'upload_date', 'updated_at']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'user', 'file', 'description')
        }),
        ('File Information', {
            'fields': ('file_type', 'file_format', 'file_size', 'upload_date', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def file_size_display(self, obj):
        if obj.file_size:
            if obj.file_size > 1024 * 1024:  # MB
                return f"{obj.file_size / (1024 * 1024):.1f} MB"
            elif obj.file_size > 1024:  # KB
                return f"{obj.file_size / 1024:.1f} KB"
            else:
                return f"{obj.file_size} bytes"
        return "Unknown"
    file_size_display.short_description = 'File Size'


@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'age', 'role', 'created_at']
    list_filter = ['role', 'created_at', 'project', 'age']
    search_fields = ['name', 'description', 'background', 'project__title']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'project', 'age', 'role', 'appearance')
        }),
        ('Character Development', {
            'fields': ('description', 'background', 'personality', 'goals', 'conflicts', 'relationships')
        }),
        ('Additional', {
            'fields': ('notes', 'image'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ['document', 'version_number', 'saved_by', 'word_count', 'is_major_version', 'created_at']
    list_filter = ['is_major_version', 'is_published_version', 'created_at', 'saved_by']
    search_fields = ['document__title', 'save_reason', 'saved_by__username']
    readonly_fields = ['word_count', 'created_at', 'changes_summary']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('document', 'version_number', 'title', 'saved_by', 'save_reason')
        }),
        ('Version Details', {
            'fields': ('is_major_version', 'is_published_version', 'word_count', 'changes_summary')
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def changes_summary(self, obj):
        return obj.changes_summary
    changes_summary.short_description = 'Changes from Previous Version'


@admin.register(ChapterVersion)
class ChapterVersionAdmin(admin.ModelAdmin):
    list_display = ['chapter', 'version_number', 'saved_by', 'word_count', 'is_major_version', 'created_at']
    list_filter = ['is_major_version', 'is_published_version', 'created_at', 'saved_by']
    search_fields = ['chapter__title', 'save_reason', 'saved_by__username']
    readonly_fields = ['word_count', 'created_at', 'changes_summary']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {
            'fields': ('chapter', 'version_number', 'title', 'saved_by', 'save_reason')
        }),
        ('Version Details', {
            'fields': ('is_major_version', 'is_published_version', 'word_count', 'changes_summary')
        }),
        ('Content', {
            'fields': ('content',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def changes_summary(self, obj):
        return obj.changes_summary
    changes_summary.short_description = 'Changes from Previous Version'


@admin.register(VersionControlSettings)
class VersionControlSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'auto_save_enabled', 'auto_save_interval', 'max_versions_to_keep']
    list_filter = ['auto_save_enabled', 'notify_on_version_save', 'require_save_reason']
    search_fields = ['user__username']
    
    fieldsets = (
        ('Auto-Save Settings', {
            'fields': ('user', 'auto_save_enabled', 'auto_save_interval')
        }),
        ('Version Management', {
            'fields': ('max_versions_to_keep', 'notify_on_version_save', 'require_save_reason')
        }),
    )
