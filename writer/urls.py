from django.urls import path, include
from rest_framework import routers
from .api import DocumentViewSet, ProjectViewSet
from . import views
from . import api


# DRF router for API endpoints
router = routers.DefaultRouter()
router.register(r'api/documents', DocumentViewSet, basename='document')
router.register(r'api/projects', ProjectViewSet, basename='project')

app_name = 'writer'

urlpatterns = [
    path('stats/', views.stats_api, name='stats_api'),
    path('tinymce-editor/', views.tinymce_editor, name='tinymce_editor'),
    path('simple-editor/', views.simple_editor, name='simple_editor'),
    path('docs-editor/', views.google_docs_editor, name='google_docs_editor'),
    path('docs-editor/<int:document_id>/', views.google_docs_editor, name='google_docs_editor_document'),
    path('academic-editor/', views.academic_editor, name='academic_editor'),
    # Editor shortcut
    path('editor/', views.latest_editor_shortcut, name='editor_shortcut'),
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    path('clean-dashboard/', views.clean_dashboard, name='clean_dashboard'),
    
    
    # Ultimate Templates - The Most Beautiful Writing Platform
    path('ultimate-dashboard/', views.ultimate_dashboard, name='ultimate_dashboard'), 
    path('ultimate-library/', views.ultimate_library, name='ultimate_library'),
    path('ultimate-workshop/', views.ai_playground, name='ultimate_workshop'),
    
    # AI Creative Playground
    path('ai-playground/', views.ai_playground, name='ai_playground'),
    
    # Creativity Workshop
    path('creativity-workshop/', views.creativity_workshop, name='creativity_workshop'),
    
    # Creative Notebook
    path('creative-notebook/', views.creative_notebook, name='creative_notebook'),
    
    # Philosopher's Corner
    path('philosophers-corner/', views.philosophers_corner, name='philosophers_corner'),
    
    # Bookshelf Dashboard
    path('bookshelf/', views.bookshelf_dashboard, name='bookshelf_dashboard'),
    
    # Personal Library
    path('library/', views.personal_library, name='personal_library'),
    path('compact-library/', views.compact_library, name='compact_library'),
    path('my-library/', views.my_library, name='my_library'),
    
    # Projects
    path('projects/', views.ProjectListView.as_view(), name='project_list'),
    path('projects/new/', views.ProjectCreateView.as_view(), name='project_create'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project_detail'),
    path('projects/<int:pk>/edit/', views.ProjectUpdateView.as_view(), name='project_update'),
    path('projects/<int:pk>/delete/', views.ProjectDeleteView.as_view(), name='project_delete'),
    
    # Project Collaboration
    path('projects/<int:project_id>/toggle-collaboration/', views.toggle_project_collaboration, name='toggle_project_collaboration'),
    path('projects/<int:project_id>/share-link/', views.get_project_share_link, name='get_project_share_link'),
    path('projects/<int:project_id>/collaborate/', views.join_collaborative_project, name='project_collaborate'),
    
    # Chapters
    path('projects/<int:project_id>/chapters/new/', views.ChapterCreateView.as_view(), name='chapter_create'),
    path('projects/<int:project_id>/editor/', views.chapter_editor, name='chapter_editor'),
    path('projects/<int:project_id>/reader/', views.book_reader, name='book_reader'),
    path('chapters/<int:pk>/', views.ChapterDetailView.as_view(), name='chapter_detail'),
    path('chapters/<int:pk>/edit/', views.ChapterUpdateView.as_view(), name='chapter_update'),
    path('chapters/<int:pk>/delete/', views.ChapterDeleteView.as_view(), name='chapter_delete'),
    
    # Chapter Management API
    path('projects/<int:project_id>/chapters/list/', views.get_chapter_list, name='get_chapter_list'),
    path('projects/<int:project_id>/chapters/create/', views.create_new_chapter, name='create_new_chapter'),
    path('projects/<int:project_id>/chapters/reorder/', views.reorder_chapters, name='reorder_chapters'),
    path('projects/<int:project_id>/chapters/<int:chapter_id>/order/', views.update_chapter_order, name='update_chapter_order'),
    path('projects/<int:project_id>/chapters/<int:chapter_id>/delete/', views.delete_chapter, name='delete_chapter'),
    
    # Documents
    path('documents/', views.DocumentListView.as_view(), name='document_list'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('documents/<int:pk>/edit/', views.DocumentUpdateView.as_view(), name='document_update'),
    path('documents/<int:pk>/delete/', views.DocumentDeleteView.as_view(), name='document_delete'),
    
    # Character URLs
    path('characters/', views.GlobalCharacterListView.as_view(), name='all_characters'),
    path('projects/<int:project_id>/characters/', views.CharacterListView.as_view(), name='character_list'),
    path('projects/<int:project_id>/characters/new/', views.CharacterCreateView.as_view(), name='character_create'),
    path('characters/<int:pk>/', views.CharacterDetailView.as_view(), name='character_detail'),
    path('characters/<int:pk>/edit/', views.CharacterUpdateView.as_view(), name='character_update'),
    path('characters/<int:pk>/delete/', views.CharacterDeleteView.as_view(), name='character_delete'),
    
    # Document Import URLs
    path('import/', views.import_document, name='import_document'),
    path('import/<int:pk>/', views.import_detail, name='import_detail'),
    path('import/<int:pk>/update-content/', views.update_import_content, name='update_import_content'),
    path('import/<int:pk>/convert-to-project/', views.convert_import_to_project, name='convert_import_to_project'),
    path('import/<int:pk>/add-to-project/<int:project_id>/', views.add_import_to_project, name='add_import_to_project'),
    path('import/<int:pk>/delete/', views.ImportedDocumentDeleteView.as_view(), name='import_delete'),
    
    # API URLs
    path('projects/api/list/', views.projects_api_list, name='projects_api_list'),
    path('api/save-document/', views.api_save_document, name='api_save_document'),
    path('api/ai-assistance/', views.api_ai_assistance, name='api_ai_assistance'),
    path('api/ai/quotes/', views.ai_quote_extraction, name='ai_quote_extraction'),
    path('upload-test/', views.upload_test, name='upload_test'),
        path('endpoint/', views.api_endpoint, name='api-endpoint'),
    path('register/', api.register, name='api_register'),
    path('api/register/', views.api_register, name='api_register_mobile'),
    
    # AI Assistant
    path('ai-assistant/', views.ai_assistant, name='ai_assistant'),
    
    # User Preferences
    path('preferences/', views.user_preferences, name='user_preferences'),
    path('api/update-theme/', views.api_update_theme, name='api_update_theme'),
    path('api/toggle-bookshelf/', views.toggle_bookshelf_visibility, name='toggle_bookshelf_visibility'),
    
    # Format & Export
    path('format/', views.format_page, name='format_page'),
    path('export/<int:project_id>/<str:format_type>/', views.export_project, name='export_project'),
    path('api/documents/<int:document_id>/export_epub/', api.export_document_epub, name='export_document_epub'),
    
    # Auto-save
    path('auto-save/', views.auto_save, name='auto_save'),
    
    # AJAX endpoints
    path('ajax/create-chapter/', views.ajax_create_chapter, name='ajax_create_chapter'),
    path('upload-file/', views.upload_file, name='upload_file'),
    path('api/upload-document/', views.api_upload_document, name='api_upload_document'),
    
    # Document Collaboration API
    path('documents/<int:document_id>/share/', views.share_document_api, name='share_document_api'),
    path('documents/<int:document_id>/collaborators/', views.get_document_collaborators_api, name='get_document_collaborators_api'),
    
    # Users API
    path('api/users/', api.user_profile, name='users_api'),
    
    # Mobile API endpoints
    path('api/projects/<int:project_id>/chapters/', views.chapters_api, name='chapters_api'),
    path('api/chapters/<int:chapter_id>/', views.chapter_api, name='chapter_api'),
    
    # New Chapter Management API endpoints
    path('chapters/create/', views.create_chapter_api, name='create_chapter_api'),
    path('chapters/<int:chapter_id>/delete/', views.delete_chapter_api, name='delete_chapter_api'),
    path('chapters/reorder/', views.reorder_chapters_api, name='reorder_chapters_api'),
    
    # API endpoints for documents and projects
    path('', include(router.urls)),
]
