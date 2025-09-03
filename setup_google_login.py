#!/usr/bin/env python3
"""
Quick setup script for Google OAuth login
Run this after getting your Google credentials
"""

import os
import sys

def setup_google_login():
    print("🔑 Google OAuth Setup for Writer's Web Dream")
    print("=" * 50)
    
    print("\n1. First, get your Google credentials:")
    print("   - Go to: https://console.cloud.google.com/")
    print("   - Create project: 'Writers Web Dream'")
    print("   - Enable Google+ API")
    print("   - Create OAuth 2.0 credentials")
    print("   - Add redirect URI: http://127.0.0.1:8000/accounts/google/login/callback/")
    
    print("\n2. Enter your Google credentials:")
    client_id = input("Enter Google Client ID: ").strip()
    client_secret = input("Enter Google Client Secret: ").strip()
    
    if not client_id or not client_secret:
        print("❌ Error: Both Client ID and Secret are required!")
        return
    
    # Update settings.py
    settings_file = "atticus_writer/settings.py"
    
    try:
        with open(settings_file, 'r') as f:
            content = f.read()
        
        # Find and replace the Google provider config
        old_config = """        'APP': {
            'client_id': '',  # Add your Google Client ID here
            'secret': '',     # Add your Google Client Secret here
            'key': ''
        }"""
        
        new_config = f"""        'APP': {{
            'client_id': '{client_id}',
            'secret': '{client_secret}',
            'key': ''
        }}"""
        
        if old_config in content:
            content = content.replace(old_config, new_config)
            
            with open(settings_file, 'w') as f:
                f.write(content)
            
            print("✅ Updated settings.py with your Google credentials")
        else:
            print("⚠️  Could not find Google config in settings.py")
            print("   Manually add these to your SOCIALACCOUNT_PROVIDERS:")
            print(f"   client_id: '{client_id}'")
            print(f"   secret: '{client_secret}'")
    
    except FileNotFoundError:
        print("❌ Error: Could not find settings.py file")
        return
    
    # Update signup template
    template_file = "templates/registration/signup.html"
    
    try:
        with open(template_file, 'r') as f:
            content = f.read()
        
        # Enable Google login button
        if 'Continue with Google' in content and '{% comment %}' in content:
            # Remove comment tags around Google button
            content = content.replace('{% comment %}', '<!-- Uncommented by setup script')
            content = content.replace('{% endcomment %}', 'End uncommented section -->')
            
            with open(template_file, 'w') as f:
                f.write(content)
            
            print("✅ Enabled Google login button in signup template")
    
    except FileNotFoundError:
        print("⚠️  Could not find signup template")
    
    print("\n🚀 Setup Complete!")
    print("=" * 50)
    print("Next steps:")
    print("1. Restart your Django server: python manage.py runserver")
    print("2. Go to: http://127.0.0.1:8000/writer/signup/")
    print("3. Click 'Continue with Google'")
    print("4. Test the OAuth flow!")
    print("\nIf you encounter issues:")
    print("- Check that redirect URI matches exactly in Google Console")
    print("- Make sure Google+ API is enabled")
    print("- Verify no extra spaces in client ID/secret")

if __name__ == "__main__":
    setup_google_login()