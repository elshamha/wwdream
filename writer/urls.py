from django.urls import path
from . import views

app_name = 'writer'

urlpatterns = [
    path('stats/', views.stats_api, name='stats_api'),
    path('tinymce-editor/', views.tinymce_editor, name='tinymce_editor'),
    path('simple-editor/', views.simple_editor, name='simple_editor'),
    # Editor shortcut
    path('editor/', views.latest_editor_shortcut, name='editor_shortcut'),
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
    path('projects/<int:project_id>/editor/', views.chapter_editor, name='chapter_editor'),
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
    path('projects/<int:project_id>/characters/', views.CharacterListView.as_view(), name='character_list'),
    path('projects/<int:project_id>/characters/new/', views.CharacterCreateView.as_view(), name='character_create'),
    path('characters/<int:pk>/', views.CharacterDetailView.as_view(), name='character_detail'),
    path('characters/<int:pk>/edit/', views.CharacterUpdateView.as_view(), name='character_update'),
    path('characters/<int:pk>/delete/', views.CharacterDeleteView.as_view(), name='character_delete'),
    
    # Document Import URLs
    path('import/', views.import_document, name='import_document'),
    path('import/<int:pk>/', views.import_detail, name='import_detail'),
    path('import/<int:pk>/convert-to-project/', views.convert_import_to_project, name='convert_import_to_project'),
    path('import/<int:pk>/add-to-project/<int:project_id>/', views.add_import_to_project, name='add_import_to_project'),
    path('import/<int:pk>/delete/', views.ImportedDocumentDeleteView.as_view(), name='import_delete'),
    
    # API URLs
    path('projects/api/list/', views.projects_api_list, name='projects_api_list'),
    path('upload-test/', views.upload_test, name='upload_test'),
    
    # AI Assistant
    path('ai-assistant/', views.ai_assistant, name='ai_assistant'),
    
    # Format & Export
    path('format/', views.format_page, name='format_page'),
    path('export/<int:project_id>/<str:format_type>/', views.export_project, name='export_project'),
    
    # Auto-save
    path('auto-save/', views.auto_save, name='auto_save'),
    
    # AJAX endpoints
    path('ajax/create-chapter/', views.ajax_create_chapter, name='ajax_create_chapter'),
    path('upload-file/', views.upload_file, name='upload_file'),
    
    # Document Collaboration API
    path('documents/<int:document_id>/share/', views.share_document_api, name='share_document_api'),
    path('documents/<int:document_id>/collaborators/', views.get_document_collaborators_api, name='get_document_collaborators_api'),
    
    # Users API
    path('api/users/', views.users_api, name='users_api'),
]
