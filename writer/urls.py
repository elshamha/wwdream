from django.urls import path
from . import views

app_name = 'writer'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    
    # Personal Library
    path('library/', views.personal_library, name='personal_library'),
    
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
    path('projects/<int:project_id>/chapters/manager/', views.chapter_manager, name='chapter_manager'),
    path('projects/<int:project_id>/editor/', views.chapter_editor, name='chapter_editor'),
    path('chapters/<int:pk>/', views.ChapterDetailView.as_view(), name='chapter_detail'),
    path('chapters/<int:pk>/edit/', views.ChapterUpdateView.as_view(), name='chapter_update'),
    path('chapters/<int:pk>/delete/', views.ChapterDeleteView.as_view(), name='chapter_delete'),
    
    # Documents
    path('documents/', views.DocumentListView.as_view(), name='document_list'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('documents/<int:pk>/edit/', views.DocumentUpdateView.as_view(), name='document_update'),
    path('documents/<int:pk>/delete/', views.DocumentDeleteView.as_view(), name='document_delete'),
    
    # Character URLs
    path('projects/<int:project_id>/characters/', views.CharacterListView.as_view(), name='character_list'),
    path('projects/<int:project_id>/characters/new/', views.CharacterCreateView.as_view(), name='character_create'),
    path('characters/<int:pk>/', views.CharacterDetailView.as_view(), name='character_detail'),
    path('characters/<int:pk>/edit/', views.CharacterUpdateView.as_view(), name='character_update'),
    path('characters/<int:pk>/delete/', views.CharacterDeleteView.as_view(), name='character_delete'),
    
    # Document Import URLs
    path('import/', views.import_document, name='import_document'),
    path('import/<int:pk>/', views.import_detail, name='import_detail'),
    path('import/<int:pk>/delete/', views.ImportedDocumentDeleteView.as_view(), name='import_delete'),
    path('upload-analysis/', views.upload_document_analysis, name='upload_document_analysis'),
    path('upload-test/', views.upload_test, name='upload_test'),
    
    # Device Preview URLs
    path('preview/', views.device_preview, name='device_preview'),
    path('preview/document/<int:document_id>/', views.device_preview, name='device_preview_document'),
    path('preview/chapter/<int:chapter_id>/', views.device_preview, name='device_preview_chapter'),
    
    # AI Assistant
    path('ai-assistant/', views.ai_assistant, name='ai_assistant'),
    
    # Auto-save
    path('auto-save/', views.auto_save, name='auto_save'),
]
