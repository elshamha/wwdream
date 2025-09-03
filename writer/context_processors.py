from .models import UserProfile

def user_profile(request):
    """Add user profile to template context"""
    context = {}
    
    if request.user.is_authenticated:
        try:
            profile = UserProfile.get_or_create_for_user(request.user)
            context['user_profile'] = profile
        except:
            context['user_profile'] = None
    
    return context