# A Writer's Web Dream

A Django-based writing application designed for distraction-free writing with a clean, modern interface. Organize your writing projects, manage chapters, and get AI assistance for your creative process.

## Features

### 📚 **Project Management**
- **Writing Projects**: Organize your work into projects with target word counts and progress tracking
- **Chapter Organization**: Structure your projects with organized chapters and automatic ordering
- **Progress Tracking**: Visual progress bars and statistics for each project
- **Genre Categorization**: Tag your projects by genre for better organization

### ✍️ **Advanced Writing Tools**
- **Rich Text Editor**: Powered by CKEditor for enhanced writing experience
- **Auto-save**: Never lose your work with automatic saving functionality
- **Word Counter**: Real-time word count tracking for documents and chapters
- **Distraction-free Interface**: Clean, focused writing environment
- **Chapter Notes**: Private notes for plot development and character tracking

### 🤖 **AI Writing Assistant**
- **Brainstorming**: Get creative ideas for plots, characters, and world-building
- **Editing Assistance**: Improve flow, pacing, and clarity of your writing
- **Grammar & Style**: Get help with grammar, punctuation, and writing style
- **Continue Writing**: Overcome writer's block with AI-generated continuations
- **Rewriting Suggestions**: Alternative ways to express your ideas
- **Interactive Chat**: Real-time conversation with your AI writing assistant

### 👤 **User Experience**
- **User Authentication**: Secure personal document and project management
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dashboard**: Overview of your writing statistics and recent work
- **Quick Actions**: Easy access to create new projects, chapters, and documents

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Virtual environment (recommended)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd "c:\Users\elsha\Atticus Try"
   ```

2. **Activate the virtual environment**:
   ```powershell
   .\myproject_env\Scripts\Activate.ps1
   ```

3. **Install dependencies** (already installed):
   ```bash
   pip install django django-ckeditor pillow
   ```

4. **Run migrations** (already done):
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser** (already created):
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

7. **Access the application**:
   - Open your browser and go to `http://127.0.0.1:8000`
   - Login with your superuser credentials
   - Start writing!

## Usage Guide

### Getting Started

1. **Login**: Use your username and password to access the application
2. **Create a Project**: Start by creating a writing project with a target word count
3. **Add Chapters**: Organize your project into chapters for better structure
4. **Write & Edit**: Use the rich text editor with auto-save functionality
5. **Get AI Help**: Use the AI assistant for brainstorming, editing, and overcoming writer's block

### Project Workflow

1. **Project Creation**: Set up your project with title, description, genre, and target word count
2. **Chapter Planning**: Add chapters in order with titles and private notes
3. **Writing**: Focus on writing with the distraction-free editor
4. **AI Assistance**: Get help with plot development, character creation, and editing
5. **Progress Tracking**: Monitor your word count and progress toward your goals

### AI Assistant Features

- **Brainstorming**: "Help me develop ideas for a fantasy adventure story"
- **Character Development**: "I need help creating a complex villain character"
- **Dialogue**: "How can I improve this dialogue scene?"
- **Plot Development**: "I'm stuck on how to end this chapter dramatically"
- **Grammar & Style**: Submit text for grammar and style improvements
- **Continue Writing**: Get AI suggestions when you're stuck

## Project Structure

```
a_writers_web_dream/
├── manage.py                 # Django management script
├── atticus_writer/          # Main project settings
│   ├── settings.py          # Django settings
│   ├── urls.py             # Main URL configuration
│   └── ...
├── writer/                  # Main application
│   ├── models.py           # Project, Chapter, Document, AI models
│   ├── views.py            # Application views
│   ├── forms.py            # Forms for all models
│   ├── urls.py             # App URL configuration
│   └── admin.py            # Admin configuration
├── templates/              # HTML templates
│   ├── base.html           # Base template
│   ├── writer/             # Writer app templates
│   └── registration/       # Authentication templates
├── static/                 # Static files (CSS, JS)
└── media/                  # User uploads
```

## Models

### Project
- **title**: Project title
- **description**: Project description and notes
- **author**: Project owner (User)
- **target_word_count**: Writing goal
- **genre**: Project genre/category
- **progress tracking**: Automatic calculation

### Chapter
- **title**: Chapter title
- **content**: Rich text chapter content
- **project**: Associated project
- **order**: Chapter sequence
- **notes**: Private chapter notes
- **word_count**: Automatic word count

### Document
- **title**: Document title
- **content**: Rich text content
- **author**: Document owner (User)
- **project**: Optional project association
- **is_published**: Publication status
- **word_count**: Automatic word count

### AI Assistance
- **assistance_type**: Type of help requested
- **content**: Text to get help with
- **prompt**: Additional context
- **response**: AI-generated response

## Technology Stack

- **Backend**: Django 5.2.5
- **Rich Text Editor**: CKEditor 4
- **Frontend**: Bootstrap 5, Font Awesome icons
- **Database**: SQLite (default, can be changed)
- **Image Processing**: Pillow
- **AI Integration**: Mock AI responses (ready for real AI integration)

## AI Integration

The current implementation includes a mock AI assistant. To integrate with real AI services:

1. **OpenAI Integration**: Replace `generate_ai_response()` function with OpenAI API calls
2. **Other AI Services**: Integrate with Anthropic Claude, Google Bard, or other AI services
3. **Custom Models**: Connect to your own trained models
4. **API Keys**: Add API key management in settings

## Security Note

The current CKEditor version has a security warning. For production use, consider upgrading to CKEditor 5 or a more recent LTS version.

## Development

### Adding Features

1. **Models**: Add new models in `writer/models.py`
2. **Views**: Add new views in `writer/views.py`
3. **Templates**: Add templates in `templates/writer/`
4. **URLs**: Update `writer/urls.py`
5. **Migrations**: Run `python manage.py makemigrations` and `python manage.py migrate`

### Customization

- **Styling**: Modify `static/css/style.css`
- **Editor Configuration**: Update CKEditor settings in `settings.py`
- **AI Responses**: Customize `generate_ai_response()` function
- **Templates**: Customize HTML templates in the `templates/` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please check the Django documentation or create an issue in the project repository.

---

**Happy Writing!** ✍️ **Dream Big, Write Bigger!** 🌟
