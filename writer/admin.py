from django.contrib import admin
from .models import Document, Project, Chapter, AIAssistanceRequest


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
