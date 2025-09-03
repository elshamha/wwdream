# Social Authentication Setup Guide

This guide explains how to set up social login (Google, Facebook, Apple, Microsoft) for your Writer's Web Dream application.

## Prerequisites

✅ **Django-allauth is already installed and configured**
✅ **User registration system is working**
✅ **Social login templates are ready**

## Step 1: Set up Google OAuth

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable Google+ API** (APIs & Services > Library > Google+ API)
4. **Create OAuth 2.0 credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://127.0.0.1:8000/accounts/google/login/callback/`
     - `https://yourdomain.com/accounts/google/login/callback/` (for production)
5. **Copy the Client ID and Client Secret**
6. **Update settings.py**:
   ```python
   SOCIALACCOUNT_PROVIDERS = {
       'google': {
           'APP': {
               'client_id': 'your-google-client-id-here',
               'secret': 'your-google-client-secret-here',
               'key': ''
           }
       }
   }
   ```

## Step 2: Set up Facebook Login

1. **Go to [Facebook Developers](https://developers.facebook.com/)**
2. **Create a new app** for your website
3. **Add Facebook Login** product to your app
4. **Configure OAuth redirect URIs**:
   - `http://127.0.0.1:8000/accounts/facebook/login/callback/`
   - `https://yourdomain.com/accounts/facebook/login/callback/` (for production)
5. **Copy App ID and App Secret**
6. **Update settings.py**:
   ```python
   'facebook': {
       'APP': {
           'client_id': 'your-facebook-app-id-here',
           'secret': 'your-facebook-app-secret-here',
           'key': ''
       }
   }
   ```

## Step 3: Set up Apple Sign In

1. **Go to [Apple Developer Console](https://developer.apple.com/)**
2. **Create a new Service ID**
3. **Enable Sign in with Apple**
4. **Configure domains and redirect URLs**:
   - Primary App Domain: `yourdomain.com`
   - Return URLs: `https://yourdomain.com/accounts/apple/login/callback/`
5. **Create and download private key**
6. **Update settings.py**:
   ```python
   'apple': {
       'APP': {
           'client_id': 'your.service.id',
           'secret': 'your-private-key-content',
           'key': 'your-key-id'
       }
   }
   ```

## Step 4: Set up Microsoft OAuth

1. **Go to [Azure Portal](https://portal.azure.com/)**
2. **Register a new application** in Azure AD
3. **Add redirect URIs**:
   - `http://127.0.0.1:8000/accounts/microsoft/login/callback/`
   - `https://yourdomain.com/accounts/microsoft/login/callback/`
4. **Generate client secret**
5. **Update settings.py**:
   ```python
   'microsoft': {
       'APP': {
           'client_id': 'your-microsoft-application-id',
           'secret': 'your-microsoft-client-secret',
           'key': ''
       }
   }
   ```

## Step 5: Enable Social Login Buttons

Once you have configured at least one provider:

1. **Open `templates/registration/signup.html`**
2. **Uncomment the social login section**:
   ```html
   <!-- Remove the {% comment %} and {% endcomment %} tags around social buttons -->
   <a href="/accounts/google/login/" class="social-btn google">
       <i class="fab fa-google"></i>
       Continue with Google
   </a>
   <!-- etc. -->
   ```
3. **Remove or comment out the placeholder text**

## Step 6: Test Your Setup

1. **Restart your Django server**
2. **Visit `/writer/signup/`**
3. **Click on social login buttons**
4. **Complete OAuth flow**

## Security Notes

⚠️ **Never commit secrets to version control**
⚠️ **Use environment variables for production**
⚠️ **Enable HTTPS for production**
⚠️ **Verify redirect URIs match exactly**

## Environment Variables (Recommended)

Create a `.env` file:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
# etc.
```

Then load them in settings.py:
```python
import os
from dotenv import load_dotenv
load_dotenv()

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
            'key': ''
        }
    }
}
```

## Troubleshooting

- **"Invalid redirect URI"**: Make sure URLs match exactly
- **"App not approved"**: Some providers require app review
- **"Invalid client"**: Check client ID/secret are correct
- **"Scope errors"**: Verify requested permissions are available

## Current Status

✅ User registration with email/password works
✅ Social authentication is configured
✅ Templates are ready with social login buttons
⏳ **You need to add your API keys from each provider**
⏳ **Uncomment social login buttons once keys are added**