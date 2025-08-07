from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy, reverse
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.models import User
from django.db.models import Q, Max
from django.db import models
import re
from .models import (Document, Project, Chapter, AIAssistanceRequest, Character, 
                    ImportedDocument, ProjectCollaborator, WritingTheme, DevicePreview, 
                    PersonalLibrary, WritingSession)
from .forms import (DocumentForm, ProjectForm, ChapterForm, AIAssistanceForm, 
                   CharacterForm, ImportDocumentForm, CollaboratorForm, DevicePreviewForm)
import json
import random
import os
import mimetypes
from django.conf import settings
from .document_parser import extract_text_from_file, analyze_document_structure, create_chapters_from_analysis
from docx import Document as DocxDocument
import PyPDF2
import tempfile


# Utility Functions
def extract_text_from_file(file_obj, file_type):
    """Extract text from uploaded files"""
    try:
        if file_type == 'pdf':
            pdf_reader = PyPDF2.PdfReader(file_obj)
            text = ''
            for page in pdf_reader.pages:
                text += page.extract_text() + '\n'
            return text
        elif file_type in ['docx', 'doc']:
            doc = DocxDocument(file_obj)
            text = ''
            for paragraph in doc.paragraphs:
                text += paragraph.text + '\n'
            return text
        elif file_type == 'txt':
            return file_obj.read().decode('utf-8')
        else:
            return "File type not supported for text extraction"
    except Exception as e:
        return f"Error extracting text: {str(e)}"


# Personal Library Views
@login_required
def personal_library(request):
    library, created = PersonalLibrary.objects.get_or_create(user=request.user)
    user_projects = Project.objects.filter(
        Q(author=request.user) | Q(collaborators=request.user)
    ).distinct()
    imported_docs = ImportedDocument.objects.filter(user=request.user)
    
    context = {
        'library': library,
        'projects': user_projects,
        'imported_documents': imported_docs,
    }
    return render(request, 'writer/personal_library.html', context)


# Project Views
class ProjectListView(LoginRequiredMixin, ListView):
    model = Project
    template_name = 'writer/project_list.html'
    context_object_name = 'projects'
    paginate_by = 10
    
    def get_queryset(self):
        return Project.objects.filter(
            Q(author=self.request.user) | Q(collaborators=self.request.user)
        ).distinct()


class ProjectDetailView(LoginRequiredMixin, DetailView):
    model = Project
    template_name = 'writer/project_detail.html'
    context_object_name = 'project'
    
    def get_queryset(self):
        return Project.objects.filter(
            Q(author=self.request.user) | Q(collaborators=self.request.user)
        ).distinct()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['chapters'] = self.object.chapters.all().order_by('order')
        context['characters'] = self.object.characters.all()
        context['collaborators'] = self.object.projectcollaborator_set.all()
        context['writing_sessions'] = self.object.writing_sessions.filter(
            is_active=True
        )[:5]
        return context


class ProjectCreateView(LoginRequiredMixin, CreateView):
    model = Project
    form_class = ProjectForm
    template_name = 'writer/project_form.html'
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        response = super().form_valid(form)
        
        # Add collaborators if specified
        collaborator_emails = form.cleaned_data.get('collaborator_emails')
        if collaborator_emails:
            self.add_collaborators(form.instance, collaborator_emails)
        
        # Create personal library if it doesn't exist
        PersonalLibrary.objects.get_or_create(user=self.request.user)
        
        return response
    
    def add_collaborators(self, project, email_string):
        emails = [email.strip() for email in email_string.split(',') if email.strip()]
        for email in emails:
            try:
                user = User.objects.get(email=email)
                ProjectCollaborator.objects.get_or_create(
                    project=project,
                    user=user,
                    defaults={'role': 'contributor'}
                )
            except User.DoesNotExist:
                messages.warning(self.request, f"User with email {email} not found.")


class ProjectUpdateView(LoginRequiredMixin, UpdateView):
    model = Project
    form_class = ProjectForm
    template_name = 'writer/project_form.html'
    
    def get_queryset(self):
        return Project.objects.filter(author=self.request.user)


class ProjectDeleteView(LoginRequiredMixin, DeleteView):
    model = Project
    template_name = 'writer/project_confirm_delete.html'
    success_url = reverse_lazy('writer:project_list')
    
    def get_queryset(self):
        return Project.objects.filter(author=self.request.user)


@login_required
def toggle_project_collaboration(request, project_id):
    """Toggle collaboration status for a project"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Only POST method allowed'}, status=405)
    
    try:
        project = get_object_or_404(Project, id=project_id, author=request.user)
        project.is_collaborative = not project.is_collaborative
        project.save()
        
        return JsonResponse({
            'success': True,
            'is_collaborative': project.is_collaborative,
            'message': f'Project is now {"collaborative" if project.is_collaborative else "private"}'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
def get_project_share_link(request, project_id):
    """Generate share link for collaborative project"""
    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Check if user has permission (author or collaborator with sharing rights)
        if not (project.author == request.user or 
                project.collaborators.filter(id=request.user.id).exists()):
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to share this project'
            }, status=403)
        
        if not project.is_collaborative:
            return JsonResponse({
                'success': False,
                'error': 'This project is not collaborative'
            }, status=400)
        
        # Generate share URL
        share_url = request.build_absolute_uri(
            reverse('writer:project_collaborate', kwargs={'project_id': project.id})
        )
        
        return JsonResponse({
            'success': True,
            'share_url': share_url,
            'project_title': project.title
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
def join_collaborative_project(request, project_id):
    """Allow users to join a collaborative project via shared link"""
    try:
        project = get_object_or_404(Project, id=project_id, is_collaborative=True)
        
        if request.method == 'GET':
            # Show collaboration join page
            context = {
                'project': project,
            }
            return render(request, 'writer/project_collaborate.html', context)
        
        elif request.method == 'POST':
            # Check if user is already a collaborator
            if project.collaborators.filter(id=request.user.id).exists() or project.author == request.user:
                messages.info(request, 'You are already part of this project.')
                return redirect('writer:chapter_editor', project_id=project.id)
            
            # Add user as collaborator
            ProjectCollaborator.objects.create(
                project=project,
                user=request.user,
                role='contributor',
                can_edit=True,
                can_delete=False,
                can_invite_others=False
            )
            
            messages.success(request, f'You have successfully joined the collaborative project "{project.title}"!')
            return redirect('writer:chapter_editor', project_id=project.id)
        
    except Exception as e:
        messages.error(request, f'Error joining project: {str(e)}')
        return redirect('writer:personal_library')


# Character Views
class CharacterListView(LoginRequiredMixin, ListView):
    model = Character
    template_name = 'writer/character_list.html'
    context_object_name = 'characters'
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Character.objects.filter(
            project_id=project_id,
            project__author=self.request.user
        )
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project_id = self.kwargs.get('project_id')
        context['project'] = get_object_or_404(Project, id=project_id, author=self.request.user)
        return context


class CharacterDetailView(LoginRequiredMixin, DetailView):
    model = Character
    template_name = 'writer/character_detail.html'
    context_object_name = 'character'
    
    def get_queryset(self):
        return Character.objects.filter(project__author=self.request.user)


class CharacterCreateView(LoginRequiredMixin, CreateView):
    model = Character
    form_class = CharacterForm
    template_name = 'writer/character_form.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project_id = self.kwargs.get('project_id')
        context['project'] = get_object_or_404(Project, id=project_id, author=self.request.user)
        return context
    
    def form_valid(self, form):
        project_id = self.kwargs.get('project_id')
        form.instance.project = get_object_or_404(Project, id=project_id, author=self.request.user)
        return super().form_valid(form)


class CharacterUpdateView(LoginRequiredMixin, UpdateView):
    model = Character
    form_class = CharacterForm
    template_name = 'writer/character_form.html'
    
    def get_queryset(self):
        return Character.objects.filter(project__author=self.request.user)


class CharacterDeleteView(LoginRequiredMixin, DeleteView):
    model = Character
    template_name = 'writer/character_confirm_delete.html'
    
    def get_queryset(self):
        return Character.objects.filter(project__author=self.request.user)
    
    def get_success_url(self):
        return reverse_lazy('writer:character_list', kwargs={'project_id': self.object.project.pk})


# Chapter Views (Updated)
class ChapterDetailView(LoginRequiredMixin, DetailView):
    model = Chapter
    template_name = 'writer/chapter_detail.html'
    context_object_name = 'chapter'
    
    def get_queryset(self):
        return Chapter.objects.filter(
            Q(project__author=self.request.user) | Q(project__collaborators=self.request.user)
        ).distinct()


class ChapterCreateView(LoginRequiredMixin, CreateView):
    model = Chapter
    form_class = ChapterForm
    template_name = 'writer/chapter_form.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        project_id = self.kwargs.get('project_id')
        context['project'] = get_object_or_404(Project, id=project_id)
        return context
    
    def form_valid(self, form):
        project_id = self.kwargs.get('project_id')
        project = get_object_or_404(Project, id=project_id)
        
        # Check permissions
        if not (project.author == self.request.user or 
                project.collaborators.filter(id=self.request.user.id).exists()):
            messages.error(self.request, "You don't have permission to add chapters to this project.")
            return redirect('writer:project_detail', pk=project.id)
        
        form.instance.project = project
        form.instance.last_edited_by = self.request.user
        
        if not form.instance.order:
            # Set order to be the next chapter
            last_chapter = Chapter.objects.filter(project=project).order_by('-order').first()
            form.instance.order = (last_chapter.order + 1) if last_chapter else 1
        
        return super().form_valid(form)


class ChapterUpdateView(LoginRequiredMixin, UpdateView):
    model = Chapter
    form_class = ChapterForm
    template_name = 'writer/chapter_form.html'
    
    def get_queryset(self):
        return Chapter.objects.filter(
            Q(project__author=self.request.user) | Q(project__collaborators=self.request.user)
        ).distinct()
    
    def form_valid(self, form):
        form.instance.last_edited_by = self.request.user
        return super().form_valid(form)


class ChapterDeleteView(LoginRequiredMixin, DeleteView):
    model = Chapter
    template_name = 'writer/chapter_confirm_delete.html'
    
    def get_queryset(self):
        return Chapter.objects.filter(project__author=self.request.user)
    
    def get_success_url(self):
        return reverse_lazy('writer:project_detail', kwargs={'pk': self.object.project.pk})


@login_required
def chapter_manager(request, project_id):
    """Chapter manager with drag-and-drop reordering"""
    project = get_object_or_404(Project, id=project_id, author=request.user)
    chapters = Chapter.objects.filter(project=project).order_by('order')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'reorder':
            # Handle drag-and-drop reordering
            chapter_ids = request.POST.getlist('chapter_ids[]')
            for index, chapter_id in enumerate(chapter_ids):
                Chapter.objects.filter(id=chapter_id, project=project).update(order=index)
            return JsonResponse({'status': 'success'})
        
        elif action == 'manual_reorder':
            # Handle manual chapter number input
            chapter_id = request.POST.get('chapter_id')
            new_order = int(request.POST.get('new_order', 0))
            chapter = get_object_or_404(Chapter, id=chapter_id, project=project)
            
            # Get all chapters ordered by their current order
            chapters_list = list(Chapter.objects.filter(project=project).order_by('order'))
            
            # Remove the chapter from its current position
            chapters_list.remove(chapter)
            
            # Insert at new position (adjust for 0-based indexing)
            new_index = max(0, min(new_order - 1, len(chapters_list)))
            chapters_list.insert(new_index, chapter)
            
            # Update all chapter orders
            for index, ch in enumerate(chapters_list):
                ch.order = index
                ch.save()
                
            return JsonResponse({'status': 'success'})
        
        elif action == 'create_chapter':
            # Handle creating new chapter with heading
            title = request.POST.get('title', 'Untitled Chapter')
            heading_level = request.POST.get('heading_level', 'h2')
            
            # Get the next order number
            max_order = Chapter.objects.filter(project=project).aggregate(
                max_order=models.Max('order')
            )['max_order'] or -1
            
            # Create heading content based on level
            heading_tag = f"<{heading_level}>{title}</{heading_level}>"
            content = f"{heading_tag}<p></p>"
            
            chapter = Chapter.objects.create(
                title=title,
                content=content,
                project=project,
                order=max_order + 1
            )
            
            return JsonResponse({
                'status': 'success',
                'chapter_id': chapter.id,
                'chapter_title': chapter.title,
                'chapter_order': chapter.order + 1
            })
    
    context = {
        'project': project,
        'chapters': chapters,
    }
    return render(request, 'writer/chapter_manager.html', context)


def analyze_document_for_chapters(content):
    """
    Analyze uploaded document content to extract chapters based on headings and structure
    """
    # Remove extra whitespace and normalize
    content = re.sub(r'\s+', ' ', content).strip()
    
    # Split content by potential chapter markers
    # Look for H1 tags (titles), H2 tags (chapters), and common chapter patterns
    chapters = []
    
    # First, try to split by H1 and H2 tags
    h1_pattern = r'<h1[^>]*>(.*?)</h1>'
    h2_pattern = r'<h2[^>]*>(.*?)</h2>'
    
    # Find all H1 and H2 headings with their positions
    headings = []
    
    for match in re.finditer(h1_pattern, content, re.IGNORECASE | re.DOTALL):
        headings.append({
            'level': 1,
            'title': re.sub(r'<[^>]+>', '', match.group(1)).strip(),
            'start': match.start(),
            'end': match.end()
        })
    
    for match in re.finditer(h2_pattern, content, re.IGNORECASE | re.DOTALL):
        headings.append({
            'level': 2,
            'title': re.sub(r'<[^>]+>', '', match.group(1)).strip(),
            'start': match.start(),
            'end': match.end()
        })
    
    # Sort headings by position
    headings.sort(key=lambda x: x['start'])
    
    # If no headings found, look for common chapter patterns
    if not headings:
        chapter_patterns = [
            r'chapter\s+\d+[:\.\-\s]*([^\n\r]*)',
            r'chapter\s+[a-z]+[:\.\-\s]*([^\n\r]*)',
            r'part\s+\d+[:\.\-\s]*([^\n\r]*)',
            r'section\s+\d+[:\.\-\s]*([^\n\r]*)',
        ]
        
        for pattern in chapter_patterns:
            for match in re.finditer(pattern, content, re.IGNORECASE):
                headings.append({
                    'level': 2,
                    'title': match.group(0).strip(),
                    'start': match.start(),
                    'end': match.end()
                })
    
    # Extract content between headings
    if headings:
        for i, heading in enumerate(headings):
            # Determine content start and end
            content_start = heading['end']
            content_end = headings[i + 1]['start'] if i + 1 < len(headings) else len(content)
            
            # Extract content
            chapter_content = content[content_start:content_end].strip()
            
            # Clean up the content
            chapter_content = re.sub(r'<[^>]+>', '', chapter_content)  # Remove remaining HTML
            chapter_content = re.sub(r'\s+', ' ', chapter_content).strip()
            
            # Only create chapter if it has substantial content
            if len(chapter_content) > 100:  # Minimum 100 characters
                # Split long chapters automatically
                split_chapters = split_long_content(chapter_content, heading['title'])
                chapters.extend(split_chapters)
    else:
        # No headings found, split by length and punctuation
        clean_content = re.sub(r'<[^>]+>', '', content)
        split_chapters = split_long_content(clean_content, "Imported Chapter")
        chapters.extend(split_chapters)
    
    return chapters if chapters else [{'title': 'Imported Document', 'content': content[:5000]}]


def split_long_content(content, base_title):
    """
    Split long content into smaller chapters based on sentence count and punctuation
    """
    chapters = []
    
    # Split by sentences
    sentences = re.split(r'([.!?]+)', content)
    current_chapter = ""
    sentence_count = 0
    chapter_num = 1
    
    i = 0
    while i < len(sentences):
        sentence = sentences[i].strip()
        if not sentence:
            i += 1
            continue
            
        # Add sentence and punctuation
        if i + 1 < len(sentences) and sentences[i + 1] in '.!?':
            current_chapter += sentence + sentences[i + 1] + " "
            sentence_count += 1
            i += 2
        else:
            current_chapter += sentence + " "
            i += 1
        
        # Check if we've reached the limit (4000 sentences) or chapter is long enough
        if sentence_count >= 3999 or (sentence_count >= 100 and len(current_chapter) > 5000):
            title = f"{base_title}" if chapter_num == 1 else f"{base_title} - Part {chapter_num}"
            chapters.append({
                'title': title,
                'content': current_chapter.strip()
            })
            
            current_chapter = ""
            sentence_count = 0
            chapter_num += 1
    
    # Add remaining content if any
    if current_chapter.strip():
        title = f"{base_title}" if chapter_num == 1 else f"{base_title} - Part {chapter_num}"
        chapters.append({
            'title': title,
            'content': current_chapter.strip()
        })
    
    return chapters


@login_required
def chapter_editor(request, project_id):
    """Integrated chapter management and editor view with pagination"""
    from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
    
    project = get_object_or_404(Project, id=project_id, author=request.user)
    all_chapters = Chapter.objects.filter(project=project).order_by('order')
    
    # Pagination settings
    chapters_per_page = int(request.GET.get('per_page', 10))  # Allow customizable pagination
    if chapters_per_page not in [5, 10, 15, 25, 50]:  # Validate allowed values
        chapters_per_page = 10
    page = request.GET.get('page', 1)
    
    # Create paginator
    paginator = Paginator(all_chapters, chapters_per_page)
    
    try:
        chapters = paginator.page(page)
    except PageNotAnInteger:
        chapters = paginator.page(1)
    except EmptyPage:
        chapters = paginator.page(paginator.num_pages)
    
    # Get the current chapter being edited (default to first or create one)
    current_chapter_id = request.GET.get('chapter_id')
    current_chapter = None
    
    if current_chapter_id:
        current_chapter = get_object_or_404(Chapter, id=current_chapter_id, project=project)
    elif all_chapters.exists():
        current_chapter = all_chapters.first()
    
    # If current chapter is not on the current page, find which page it's on
    current_chapter_page = 1
    if current_chapter:
        try:
            chapter_position = list(all_chapters.values_list('id', flat=True)).index(current_chapter.id)
            current_chapter_page = (chapter_position // chapters_per_page) + 1
        except ValueError:
            current_chapter_page = 1
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'reorder':
            # Handle drag-and-drop reordering
            chapter_ids = request.POST.getlist('chapter_ids[]')
            for index, chapter_id in enumerate(chapter_ids):
                Chapter.objects.filter(id=chapter_id, project=project).update(order=index)
            return JsonResponse({'status': 'success'})
        
        elif action == 'save_chapter':
            # Handle chapter content saving
            chapter_id = request.POST.get('chapter_id')
            title = request.POST.get('title', 'Untitled Chapter')
            content = request.POST.get('content', '')
            
            if chapter_id:
                chapter = get_object_or_404(Chapter, id=chapter_id, project=project)
                chapter.title = title
                chapter.content = content
                chapter.save()
                
                return JsonResponse({
                    'status': 'success',
                    'word_count': chapter.word_count,
                    'message': 'Chapter saved successfully'
                })
        
        elif action == 'create_chapter':
            # Handle creating new chapter
            title = request.POST.get('title', 'Untitled Chapter')
            heading_level = request.POST.get('heading_level', 'h2')
            
            # Get the next order number
            max_order = Chapter.objects.filter(project=project).aggregate(
                max_order=models.Max('order')
            )['max_order'] or -1
            
            # Create heading content based on level
            heading_tag = f"<{heading_level}>{title}</{heading_level}>"
            content = f"{heading_tag}<p></p>"
            
            chapter = Chapter.objects.create(
                title=title,
                content=content,
                project=project,
                order=max_order + 1
            )
            
            return JsonResponse({
                'status': 'success',
                'chapter_id': chapter.id,
                'chapter_title': chapter.title,
                'chapter_order': chapter.order + 1,
                'redirect_url': f'/writer/projects/{project_id}/editor/?chapter_id={chapter.id}'
            })
        
        elif action == 'delete_chapter':
            # Handle chapter deletion
            chapter_id = request.POST.get('chapter_id')
            chapter = get_object_or_404(Chapter, id=chapter_id, project=project)
            chapter.delete()
            
            # Reorder remaining chapters
            remaining_chapters = Chapter.objects.filter(project=project).order_by('order')
            for index, ch in enumerate(remaining_chapters):
                ch.order = index
                ch.save()
            
            return JsonResponse({'status': 'success'})
        
        elif action == 'split_long_chapter':
            # Handle automatic chapter splitting when content is too long
            try:
                import json
                data = json.loads(request.body)
                chapter_id = data.get('chapter_id')
                first_part = data.get('first_part')
                remaining_part = data.get('remaining_part')
                
                current_chapter = get_object_or_404(Chapter, id=chapter_id, project=project)
                
                # Update current chapter with first part
                current_chapter.content = first_part
                current_chapter.save()
                
                # Create new chapter with remaining content
                new_chapter = Chapter.objects.create(
                    title="Untitled Chapter (Auto-split)",
                    content=remaining_part,
                    project=project,
                    order=current_chapter.order + 1
                )
                
                # Reorder subsequent chapters
                subsequent_chapters = Chapter.objects.filter(
                    project=project, 
                    order__gt=current_chapter.order
                ).exclude(id=new_chapter.id)
                
                for chapter in subsequent_chapters:
                    chapter.order += 1
                    chapter.save()
                
                return JsonResponse({
                    'success': True,
                    'new_chapter_title': new_chapter.title,
                    'new_chapter_id': new_chapter.id
                })
                
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        elif action == 'analyze_uploaded_document':
            # Handle document upload and chapter analysis
            try:
                import json
                data = json.loads(request.body)
                document_content = data.get('content')
                
                chapters_data = analyze_document_for_chapters(document_content)
                
                # Create chapters from analyzed content
                created_chapters = []
                for i, chapter_data in enumerate(chapters_data):
                    chapter = Chapter.objects.create(
                        title=chapter_data['title'],
                        content=chapter_data['content'],
                        project=project,
                        order=all_chapters.count() + i + 1
                    )
                    created_chapters.append({
                        'id': chapter.id,
                        'title': chapter.title,
                        'order': chapter.order
                    })
                
                return JsonResponse({
                    'success': True,
                    'chapters_created': len(created_chapters),
                    'chapters': created_chapters
                })
                
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)})
        
        elif action == 'create_chapter_from_heading':
            # Handle creating new chapter from H2 heading
            title = request.POST.get('title', 'Untitled Chapter')
            current_chapter_id = request.POST.get('current_chapter_id')
            content_before = request.POST.get('content_before', '')
            content_after = request.POST.get('content_after', '')
            
            # Update current chapter content (remove the heading and content after)
            if current_chapter_id:
                current_chapter = get_object_or_404(Chapter, id=current_chapter_id, project=project)
                current_chapter.content = content_before
                current_chapter.save()
            
            # Get the next order number (insert after current chapter)
            current_order = current_chapter.order if current_chapter_id else -1
            
            # Shift all chapters after current chapter
            chapters_to_shift = Chapter.objects.filter(project=project, order__gt=current_order)
            for ch in chapters_to_shift:
                ch.order += 1
                ch.save()
            
            # Create new chapter
            new_chapter = Chapter.objects.create(
                title=title,
                content=f"<h2>{title}</h2>{content_after}",
                project=project,
                order=current_order + 1
            )
            
            return JsonResponse({
                'status': 'success',
                'chapter_id': new_chapter.id,
                'chapter_title': new_chapter.title,
                'chapter_order': new_chapter.order + 1,
                'redirect_url': f'/writer/projects/{project_id}/editor/?chapter_id={new_chapter.id}'
            })
    
    context = {
        'project': project,
        'chapters': chapters,
        'all_chapters': all_chapters,
        'current_chapter': current_chapter,
        'current_chapter_page': current_chapter_page,
        'chapters_per_page': chapters_per_page,
        'page_obj': chapters,  # For template compatibility with Django pagination
    }
    return render(request, 'writer/chapter_editor.html', context)


@login_required
def upload_document_analysis(request):
    """Upload and analyze documents for intelligent chapter creation."""
    if request.method == 'POST':
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            
            # Save the uploaded file temporarily
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp_uploads')
            os.makedirs(temp_dir, exist_ok=True)
            
            temp_file_path = os.path.join(temp_dir, uploaded_file.name)
            
            try:
                # Save the file
                with open(temp_file_path, 'wb+') as destination:
                    for chunk in uploaded_file.chunks():
                        destination.write(chunk)
                
                # Extract text content
                content = extract_text_from_file(temp_file_path)
                
                if not content:
                    return JsonResponse({
                        'success': False,
                        'error': 'Could not extract text from the uploaded file. Please try a different format.'
                    })
                
                # Analyze the document structure
                analysis = analyze_document_structure(content)
                
                # Clean up temporary file
                os.remove(temp_file_path)
                
                return JsonResponse({
                    'success': True,
                    'analysis': {
                        'titles': analysis['titles'][:5],  # Limit to first 5 titles
                        'chapters': analysis['chapters'][:20],  # Limit to first 20 chapters
                        'total_sentences': analysis['total_sentences'],
                        'suggested_splits': analysis['suggested_splits'][:10],  # Limit suggested splits
                        'content_preview': content[:500] + '...' if len(content) > 500 else content
                    },
                    'full_content': content  # Store for project creation
                })
                
            except Exception as e:
                # Clean up temporary file on error
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
                
                return JsonResponse({
                    'success': False,
                    'error': f'Error processing file: {str(e)}'
                })
        
        elif 'create_project' in request.POST:
            # Create project from analyzed document
            try:
                project_title = request.POST.get('project_title', 'Imported Document')
                content = request.POST.get('content', '')
                analysis_data = json.loads(request.POST.get('analysis', '{}'))
                
                # Create the project
                project = Project.objects.create(
                    title=project_title,
                    description=f'Project created from uploaded document analysis',
                    author=request.user,
                    is_collaboration=False
                )
                
                # Create chapters from analysis
                chapters_data = create_chapters_from_analysis(content, analysis_data, project.id)
                
                # Create Chapter objects
                for chapter_data in chapters_data:
                    Chapter.objects.create(
                        title=chapter_data['title'],
                        content=chapter_data['content'],
                        order=chapter_data['order'],
                        project=project
                    )
                
                messages.success(request, f'Project "{project_title}" created successfully with {len(chapters_data)} chapters!')
                return redirect('writer:chapter_editor', project_id=project.id)
                
            except Exception as e:
                messages.error(request, f'Error creating project: {str(e)}')
                return redirect('writer:upload_document_analysis')
    
    user_projects = Project.objects.filter(
        Q(author=request.user) | Q(collaborators=request.user)
    ).distinct()
    
    context = {
        'user_projects': user_projects,
    }
    return render(request, 'writer/upload_document_analysis.html', context)

@login_required
def upload_test(request):
    """Simple upload test page."""
    return render(request, 'writer/upload_test.html')



# Document Views (Updated)
class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = 'writer/document_list.html'
    context_object_name = 'documents'
    paginate_by = 10
    
    def get_queryset(self):
        return Document.objects.filter(author=self.request.user)


class DocumentDetailView(LoginRequiredMixin, DetailView):
    model = Document
    template_name = 'writer/document_detail.html'
    context_object_name = 'document'
    
    def get_queryset(self):
        return Document.objects.filter(author=self.request.user)


class DocumentCreateView(LoginRequiredMixin, CreateView):
    model = Document
    form_class = DocumentForm
    template_name = 'writer/document_form.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
    
    def form_valid(self, form):
        form.instance.author = self.request.user
        return super().form_valid(form)


class DocumentUpdateView(LoginRequiredMixin, UpdateView):
    model = Document
    form_class = DocumentForm
    template_name = 'writer/document_form.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs
    
    def get_queryset(self):
        return Document.objects.filter(author=self.request.user)


class DocumentDeleteView(LoginRequiredMixin, DeleteView):
    model = Document
    template_name = 'writer/document_confirm_delete.html'
    success_url = reverse_lazy('writer:document_list')
    
    def get_queryset(self):
        return Document.objects.filter(author=self.request.user)


# Document Import Views
@login_required
def import_document(request):
    if request.method == 'POST':
        form = ImportDocumentForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            imported_doc = form.save(commit=False)
            imported_doc.user = request.user
            imported_doc.file_size = imported_doc.original_file.size
            
            # Determine file type
            file_name = imported_doc.original_file.name.lower()
            if file_name.endswith('.pdf'):
                imported_doc.import_type = 'pdf'
            elif file_name.endswith(('.docx', '.doc')):
                imported_doc.import_type = 'docx'
            elif file_name.endswith('.txt'):
                imported_doc.import_type = 'txt'
            elif file_name.endswith('.rtf'):
                imported_doc.import_type = 'rtf'
            elif file_name.endswith('.odt'):
                imported_doc.import_type = 'odt'
            
            # Extract text content
            imported_doc.extracted_content = extract_text_from_file(
                imported_doc.original_file, 
                imported_doc.import_type
            )
            
            imported_doc.save()
            messages.success(request, f"Document '{imported_doc.title}' imported successfully!")
            return redirect('writer:import_detail', pk=imported_doc.pk)
    else:
        form = ImportDocumentForm(user=request.user)
    
    return render(request, 'writer/import_document.html', {'form': form})


@login_required
def import_detail(request, pk):
    imported_doc = get_object_or_404(ImportedDocument, pk=pk, user=request.user)
    return render(request, 'writer/import_detail.html', {'imported_doc': imported_doc})


class ImportedDocumentDeleteView(LoginRequiredMixin, DeleteView):
    model = ImportedDocument
    template_name = 'writer/import_confirm_delete.html'
    success_url = reverse_lazy('writer:personal_library')
    
    def get_queryset(self):
        return ImportedDocument.objects.filter(user=self.request.user)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['object_type'] = 'Imported Document'
        return context


# Device Preview Views
@login_required
def device_preview(request, document_id=None, chapter_id=None):
    if request.method == 'POST':
        form = DevicePreviewForm(request.POST)
        if form.is_valid():
            device = form.cleaned_data['device']
            font_family = form.cleaned_data['font_family']
            font_size = form.cleaned_data['font_size']
            line_height = form.cleaned_data['line_height']
            
            # Get content
            content = ""
            title = "Preview"
            
            if document_id:
                doc = get_object_or_404(Document, id=document_id, author=request.user)
                content = doc.content or "No content available"
                title = doc.title
            elif chapter_id:
                chapter = get_object_or_404(Chapter, id=chapter_id)
                if chapter.project.author != request.user and not chapter.project.collaborators.filter(id=request.user.id).exists():
                    messages.error(request, "Permission denied")
                    return redirect('writer:dashboard')
                content = chapter.content or "No content available"
                title = f"{chapter.project.title} - {chapter.title}"
            else:
                # Default sample content for preview
                content = """
                <h2>Sample Chapter</h2>
                <p>This is a sample preview showing how your content would appear on different devices. You can select different devices, fonts, and formatting options to see how your writing would look.</p>
                
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                
                <blockquote>
                "The art of writing is the art of discovering what you believe." - Gustave Flaubert
                </blockquote>
                
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                
                <h3>Sample Dialogue</h3>
                <p>"This device preview feature is quite helpful," she said, adjusting the font size on her tablet.</p>
                <p>"Indeed," he replied, "it shows exactly how readers will experience our work."</p>
                """
                title = "Sample Preview Content"
            
            context = {
                'content': content,
                'title': title,
                'device': device,
                'font_family': font_family,
                'font_size': font_size,
                'line_height': line_height,
                'form': form,
            }
            return render(request, 'writer/device_preview.html', context)
    else:
        form = DevicePreviewForm()
    
    # Provide default sample content for GET requests
    context = {
        'form': form,
        'content': """
        <h2>Welcome to Device Preview</h2>
        <p>This tool allows you to preview how your writing will appear on different devices and with various formatting options.</p>
        
        <p>To get started:</p>
        <ol>
            <li>Select a device type from the dropdown</li>
            <li>Choose your preferred font family</li>
            <li>Adjust font size and line height</li>
            <li>Click "Update Preview" to see the changes</li>
        </ol>
        
        <p>You can also preview specific documents by navigating to them first, then accessing the device preview feature.</p>
        
        <blockquote>
        "The first draft of anything is shit." - Ernest Hemingway
        </blockquote>
        
        <p>Use this preview to ensure your writing looks great on every device your readers might use.</p>
        """,
        'title': 'Device Preview Demo',
        'device': 'iphone',
        'font_family': 'serif',
        'font_size': 16,
        'line_height': 1.6,
    }
    return render(request, 'writer/device_preview.html', context)


@login_required
def dashboard(request):
    recent_documents = Document.objects.filter(author=request.user)[:5]
    recent_projects = Project.objects.filter(
        Q(author=request.user) | Q(collaborators=request.user)
    ).distinct()[:3]
    
    total_documents = Document.objects.filter(author=request.user).count()
    total_projects = Project.objects.filter(
        Q(author=request.user) | Q(collaborators=request.user)
    ).distinct().count()
    
    total_words = sum(doc.word_count for doc in Document.objects.filter(author=request.user))
    total_project_words = sum(project.total_word_count for project in Project.objects.filter(
        Q(author=request.user) | Q(collaborators=request.user)
    ).distinct())
    
    # Get user's characters
    user_characters = Character.objects.filter(
        project__in=Project.objects.filter(
            Q(author=request.user) | Q(collaborators=request.user)
        ).distinct()
    ).count()
    
    context = {
        'recent_documents': recent_documents,
        'recent_projects': recent_projects,
        'total_documents': total_documents,
        'total_projects': total_projects,
        'total_words': total_words + total_project_words,
        'total_characters': user_characters,
    }
    return render(request, 'writer/dashboard.html', context)


# AI Assistant Views (Enhanced)
@login_required
def ai_assistant(request):
    if request.method == 'POST':
        form = AIAssistanceForm(request.POST)
        if form.is_valid():
            assistance = form.save(commit=False)
            assistance.user = request.user
            
            # Generate AI response
            assistance.response = generate_ai_response(
                assistance.content, 
                assistance.assistance_type, 
                assistance.prompt
            )
            assistance.save()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'response': assistance.response
                })
            else:
                messages.success(request, 'AI assistance generated successfully!')
                return redirect('writer:ai_assistant')
    else:
        form = AIAssistanceForm()
    
    recent_requests = AIAssistanceRequest.objects.filter(user=request.user)[:10]
    context = {
        'form': form,
        'recent_requests': recent_requests
    }
    return render(request, 'writer/ai_assistant.html', context)


def generate_ai_response(content, assistance_type, prompt):
    """Enhanced AI response generator with character and plot development"""
    responses = {
        'brainstorm': [
            "Here are some creative ideas to expand your story:\n\n• What if your protagonist discovers a hidden secret about their past?\n• Consider adding a subplot involving a secondary character\n• Explore the consequences of your main character's decisions\n• Add unexpected obstacles or complications\n• Introduce a mentor figure who challenges your protagonist's beliefs",
            "To develop this further, consider:\n\n• Character motivations and backstory\n• Setting details that affect the plot\n• Potential conflicts between characters\n• Themes you want to explore\n• How the environment shapes your characters",
        ],
        'character': [
            "Character development suggestions:\n\n• Give your character a specific fear or weakness\n• Create a contradiction in their personality\n• Develop their unique voice and speech patterns\n• Consider their relationships with family and friends\n• What drives them? What do they want most?\n• Add physical quirks or habits that reveal personality",
            "To make this character more compelling:\n\n• Create internal conflict that mirrors external conflict\n• Give them a secret they're hiding\n• Develop their backstory - what shaped them?\n• Consider how they've changed throughout the story\n• What would they never do? What would force them to do it?",
        ],
        'dialogue': [
            "Dialogue enhancement tips:\n\n• Each character should have a distinct voice\n• Use subtext - characters rarely say exactly what they mean\n• Add action beats between dialogue\n• Show character relationships through how they speak to each other\n• Cut unnecessary dialogue tags\n• Make every line serve a purpose",
            "To improve this dialogue:\n\n• Add more conflict or tension\n• Use contractions for natural speech\n• Show character emotions through word choice\n• Consider what characters aren't saying\n• Add interruptions and overlapping speech for realism",
        ],
        'plot': [
            "Plot development ideas:\n\n• Increase the stakes - what happens if your protagonist fails?\n• Add a ticking clock element\n• Create obstacles that force character growth\n• Consider the three-act structure\n• Plant seeds early that pay off later\n• Make sure each scene advances plot or character",
            "To strengthen your plot:\n\n• Give your antagonist clear, understandable motivations\n• Create moments where victory seems impossible\n• Add plot twists that feel inevitable in hindsight\n• Make sure cause and effect are clear\n• Consider multiple storylines that intersect",
        ],
        'edit': [
            "Here are some suggestions to improve your writing:\n\n• Consider varying your sentence structure for better flow\n• Some paragraphs could be shortened for better pacing\n• Look for opportunities to show rather than tell\n• Strong dialogue! Consider adding more action beats between speeches\n• Watch for repeated words or phrases",
            "Editorial suggestions:\n\n• The opening could be stronger with more immediate action\n• Character descriptions are vivid and engaging\n• Consider tightening some exposition\n• The dialogue feels natural and authentic\n• Look for places to add sensory details",
        ],
        'continue': [
            "Here's a possible continuation:\n\nAs the door creaked open, Sarah held her breath. The hallway beyond was darker than she'd expected, and the musty smell of old books filled her nostrils. Each step forward felt like crossing into another world, where the familiar rules no longer applied...",
            "To continue this scene, you might consider:\n\nHaving your character notice something unexpected, introduce a new character, or reveal important information that changes everything. The tension you've built is perfect for a major revelation or plot twist.",
        ],
        'rewrite': [
            "Here's a rewritten version with improved flow:\n\n[Your original text would be revised here with better sentence structure, clearer descriptions, and enhanced dialogue while maintaining your unique voice and style.]",
            "I've rewritten this section to be more concise and impactful:\n\n[The rewritten version would focus on stronger verbs, clearer imagery, and better pacing while preserving the essence of your original writing.]",
        ],
        'grammar': [
            "Grammar and style check complete:\n\n• Fixed several comma splices\n• Corrected subject-verb agreement in paragraph 2\n• Suggested alternatives for repetitive word usage\n• Overall, your writing is clear and well-structured!\n• Consider breaking up some longer sentences",
            "Grammar review:\n\n✓ Sentence structure is generally good\n• Watch for run-on sentences in longer paragraphs\n• Consider breaking up some complex sentences\n• Punctuation is mostly correct\n• Strong vocabulary choices throughout",
        ],
        'style': [
            "Style improvements:\n\n• Vary your sentence beginnings for better rhythm\n• Consider using more active voice\n• Your descriptive language is engaging\n• Look for opportunities to eliminate redundant words\n• Add more specific, concrete details",
            "To enhance your writing style:\n\n• Strong character voice comes through clearly\n• Consider adding more sensory details\n• Good use of dialogue to advance the plot\n• Pacing works well for this genre\n• Consider the emotional arc of your scenes",
        ]
    }
    
    return random.choice(responses.get(assistance_type, ["I'm here to help! Please provide more specific guidance for your request."]))


@csrf_exempt
@login_required
def auto_save(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        document_id = data.get('document_id')
        chapter_id = data.get('chapter_id')
        content = data.get('content')
        title = data.get('title', 'Untitled')
        
        if chapter_id:
            # Auto-save chapter
            chapter = get_object_or_404(Chapter, id=chapter_id)
            # Check permissions
            if not (chapter.project.author == request.user or 
                   chapter.project.collaborators.filter(id=request.user.id).exists()):
                return JsonResponse({'status': 'error', 'message': 'Permission denied'})
            
            chapter.content = content
            chapter.title = title
            chapter.last_edited_by = request.user
            chapter.save()
            
            return JsonResponse({
                'status': 'success',
                'chapter_id': chapter.id,
                'word_count': chapter.word_count
            })
        elif document_id:
            # Auto-save document
            document = get_object_or_404(Document, id=document_id, author=request.user)
            document.content = content
            document.title = title
            document.save()
            return JsonResponse({
                'status': 'success',
                'document_id': document.id,
                'word_count': document.word_count
            })
        else:
            # Create new document
            document = Document.objects.create(
                title=title,
                content=content,
                author=request.user
            )
            return JsonResponse({
                'status': 'success',
                'document_id': document.id,
                'word_count': document.word_count
            })
    
    return JsonResponse({'status': 'error'})
