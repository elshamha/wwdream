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
    # Authentication
    path('signup/', views.signup, name='signup'),
    
    # Privacy Policy
    path('privacy/', views.privacy_policy, name='privacy_policy'),
    
    path('stats/', views.stats_api, name='stats_api'),
    path('tinymce-editor/', views.tinymce_editor, name='tinymce_editor'),
    path('simple-editor/', views.simple_editor, name='simple_editor'),
    path('docs-editor/', views.google_docs_editor, name='google_docs_editor'),
    path('docs-editor/<int:document_id>/', views.google_docs_editor, name='google_docs_editor_document'),
    path('docs-editor/media/<int:media_id>/', views.google_docs_editor, name='google_docs_editor_media'),
    path('academic-editor/', views.academic_editor, name='academic_editor'),
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
    path('api/workshop-sessions/', views.workshop_sessions_api, name='workshop_sessions_api'),
    path('api/workshop-sessions/<int:session_id>/', views.workshop_session_detail_api, name='workshop_session_detail_api'),
    path('workshop-history/', views.workshop_history, name='workshop_history'),
    
    # Creative Notebook
    path('creative-notebook/', views.creative_notebook, name='creative_notebook'),
    
    # Philosopher's Corner
    path('philosophers-corner/', views.philosophers_corner, name='philosophers_corner'),
    
    # Poetry Workshop
    path('poetry-workshop/', views.poetry_workshop, name='poetry_workshop'),
    
    # Book Formatter - Professional Publishing Preview
    path('book-formatter/', views.book_formatter_new, name='book_formatter'),
    
    # Cover Designer - Professional Book Covers
    path('cover-designer/', views.cover_designer, name='cover_designer'),
    
    # Export APIs for Book Formatter
    path('api/export-book/', views.export_formatted_book, name='export_formatted_book'),
    path('api/export-cover/', views.export_book_cover, name='export_book_cover'),
    
    # Bookshelf Dashboard
    path('bookshelf/', views.bookshelf_dashboard, name='bookshelf_dashboard'),
    
    # Personal Library
    path('library/', views.personal_library, name='personal_library'),
    path('compact-library/', views.compact_library, name='compact_library'),
    path('my-library/', views.my_library, name='my_library'),
    path('vault-of-lagrimas/', views.vault_of_lagrimas, name='vault_of_lagrimas'),
    
    # Classics Library - Public Domain Books
    path('classics-library/', views.classics_library, name='classics_library'),
    path('api/classics/search/', views.classics_search_api, name='classics_search_api'),
    path('api/classics/<int:book_id>/borrow/', views.borrow_classic_book, name='borrow_classic_book'),
    path('api/classics/<int:book_id>/return/', views.return_classic_book, name='return_classic_book'),
    path('api/classics/<int:book_id>/read/', views.read_classic_book, name='read_classic_book'),
    path('api/classics/fetch-content/', views.fetch_book_content, name='fetch_book_content'),
    
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
    path('projects/<int:project_id>/docs-editor/', views.google_docs_editor, name='chapter_editor'),
    path('projects/<int:project_id>/chapters/<int:chapter_id>/docs-editor/', views.google_docs_editor, name='chapter_editor_detail'),
    path('projects/<int:project_id>/reader/', views.book_reader, name='book_reader'),
    path('chapters/<int:pk>/', views.ChapterDetailView.as_view(), name='chapter_detail'),
    path('chapters/<int:pk>/edit/', views.ChapterUpdateView.as_view(), name='chapter_update'),
    path('chapters/<int:pk>/delete/', views.ChapterDeleteView.as_view(), name='chapter_delete'),
    
    # Chapter Management API
    path('projects/<int:project_id>/chapters/list/', views.get_chapter_list, name='get_chapter_list'),
    path('projects/<int:project_id>/collaborators/', views.get_project_collaborators_api, name='get_project_collaborators_api'),
    path('projects/<int:project_id>/chapters/create/', views.create_new_chapter, name='create_new_chapter'),
    path('projects/<int:project_id>/chapters/reorder/', views.reorder_chapters, name='reorder_chapters'),
    path('projects/<int:project_id>/chapters/<int:chapter_id>/order/', views.update_chapter_order, name='update_chapter_order'),
    path('projects/<int:project_id>/chapters/<int:chapter_id>/delete/', views.delete_chapter, name='delete_chapter'),
    
    # Chapter Auto-Detection API
    path('api/detect-chapters/', views.detect_chapters_api, name='detect_chapters_api'),
    path('api/create-chapters-from-detection/', views.create_chapters_from_detection, name='create_chapters_from_detection'),
    
    # Documents
    path('documents/', views.DocumentListView.as_view(), name='document_list'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('documents/<int:pk>/edit/', views.DocumentUpdateView.as_view(), name='document_update'),
    path('documents/<int:pk>/delete/', views.DocumentDeleteView.as_view(), name='document_delete'),
    
    # Character URLs - Enhanced Universe Experience
    path('characters/', views.GlobalCharacterListView.as_view(), name='all_characters'),
    path('projects/<int:project_id>/universe/', views.character_universe, name='character_universe'),
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
    
    # User Preferences & Profile
    path('preferences/', views.user_preferences, name='user_preferences'),
    path('api/update-theme/', views.api_update_theme, name='api_update_theme'),
    path('api/toggle-bookshelf/', views.toggle_bookshelf_visibility, name='toggle_bookshelf_visibility'),
    
    # User Profile
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/<str:username>/', views.user_profile, name='user_profile_public'),
    
    # Format & Export
    path('format/', views.format_page, name='format_page'),
    path('export/<int:project_id>/<str:format_type>/', views.export_project, name='export_project'),
    path('api/documents/<int:document_id>/export_epub/', api.export_document_epub, name='export_document_epub'),
    
    # PDF Export
    path('projects/<int:pk>/export-pdf/', views.export_project_pdf, name='export_project_pdf'),
    path('chapters/<int:pk>/export-pdf/', views.export_chapter_pdf, name='export_chapter_pdf'),
    path('documents/<int:pk>/export-pdf/', views.export_document_pdf, name='export_document_pdf'),
    path('api/export-cover-pdf/', views.export_cover_pdf, name='export_cover_pdf'),
    
    # EPUB Export
    path('projects/<int:pk>/export-epub/', views.export_project_epub, name='export_project_epub'),
    path('chapters/<int:pk>/export-epub/', views.export_chapter_epub, name='export_chapter_epub'),
    path('documents/<int:pk>/export-epub/', views.export_document_epub_view, name='export_document_epub_view'),
    
    # Auto-save
    path('auto-save/', views.auto_save, name='auto_save'),
    
    # AJAX endpoints
    path('ajax/create-chapter/', views.ajax_create_chapter, name='ajax_create_chapter'),
    path('upload-file/', views.upload_file, name='upload_file'),
    path('upload-to-editor/', views.upload_to_editor, name='upload_to_editor'),
    path('api/upload-document/', views.api_upload_document, name='api_upload_document'),
    path('api/analyze-chapters/', views.analyze_document_chapters, name='analyze_document_chapters'),
    path('api/detect-chapters/', views.detect_chapters_from_text, name='detect_chapters_from_text'),
    path('api/create-chapters/', views.create_chapters_from_document, name='create_chapters_from_document'),
    
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
    
    # Media Library URLs
    path('media-library/', views.media_library, name='media_library'),
    path('media/upload/', views.media_upload, name='media_upload'),
    path('media/<int:media_id>/', views.media_detail, name='media_detail'),
    path('media/<int:media_id>/view/', views.media_view, name='media_view'),
    path('media/<int:media_id>/edit/', views.media_update, name='media_edit'),
    path('media/<int:media_id>/update/', views.media_update, name='media_update'),
    path('media/<int:media_id>/delete/', views.media_delete, name='media_delete'),
    path('media/<int:media_id>/download/', views.media_download, name='media_download'),
    
    # Version Control URLs
    path('documents/<int:document_id>/versions/', views.document_versions, name='document_versions'),
    path('documents/<int:document_id>/versions/save/', views.save_document_version, name='save_document_version'),
    path('documents/<int:document_id>/versions/<int:version_id>/restore/', views.restore_document_version, name='restore_document_version'),
    path('documents/<int:document_id>/versions/<int:version_id>/delete/', views.delete_document_version, name='delete_document_version'),
    path('documents/<int:document_id>/versions/compare/<int:version1_id>/<int:version2_id>/', views.compare_document_versions, name='compare_document_versions'),
    
    path('chapters/<int:chapter_id>/versions/', views.chapter_versions, name='chapter_versions'),
    path('chapters/<int:chapter_id>/versions/save/', views.save_chapter_version, name='save_chapter_version'),
    path('chapters/<int:chapter_id>/versions/<int:version_id>/restore/', views.restore_chapter_version, name='restore_chapter_version'),
    path('chapters/<int:chapter_id>/versions/<int:version_id>/delete/', views.delete_chapter_version, name='delete_chapter_version'),
    path('chapters/<int:chapter_id>/versions/compare/<int:version1_id>/<int:version2_id>/', views.compare_chapter_versions, name='compare_chapter_versions'),
    
    path('version-control/settings/', views.version_control_settings, name='version_control_settings'),
    path('api/auto-save-version/', views.auto_save_version_api, name='auto_save_version_api'),

    # API endpoints for documents and projects
    path('', include(router.urls)),
    
    # Mobile authentication endpoint
    path('mobile-auth/', views.mobile_auth, name='mobile_auth'),
]
