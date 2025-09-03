# 🔑 Complete Guide: Getting API Keys for Social Login

This guide will walk you through getting API keys from each provider step-by-step.

---

## 🟦 **1. Google OAuth Setup** (Easiest - Start Here!)

### **Step 1: Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### **Step 2: Create or Select Project**
1. Click the project dropdown at the top
2. Click "New Project" 
3. Enter project name: "Writers Web Dream" 
4. Click "Create"

### **Step 3: Enable Google+ API**
1. Go to "APIs & Services" > "Library" (left sidebar)
2. Search for "Google+ API"
3. Click on it and click "Enable"

### **Step 4: Create OAuth Credentials**
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If prompted, configure OAuth consent screen:
   - Choose "External" user type
   - Fill in app name: "Writer's Web Dream"
   - Add your email as developer contact
   - Click "Save and Continue" through all steps
4. Select "Web application"
5. Name it: "Writers Web Dream Login"
6. **Add Authorized Redirect URIs**:
   ```
   http://127.0.0.1:8000/accounts/google/login/callback/
   http://localhost:8000/accounts/google/login/callback/
   ```
7. Click "Create"

### **Step 5: Copy Your Credentials**
- **Client ID**: Copy this (starts with numbers, ends with .googleusercontent.com)
- **Client Secret**: Copy this (random string)

**✅ You now have Google OAuth credentials!**

---

## 🔵 **2. Facebook Login Setup**

### **Step 1: Go to Facebook Developers**
1. Visit: https://developers.facebook.com/
2. Sign in with your Facebook account
3. Click "My Apps" > "Create App"

### **Step 2: Create New App**
1. Select "Consumer" as app type
2. Click "Next"
3. Fill in:
   - App name: "Writer's Web Dream"
   - Contact email: your email
   - Category: "Business"
4. Click "Create App"

### **Step 3: Add Facebook Login**
1. On the app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Enter your site URL: `http://127.0.0.1:8000`
5. Click "Save" and "Continue"

### **Step 4: Configure OAuth Redirect URIs**
1. In left sidebar, go to "Facebook Login" > "Settings"
2. Add these Valid OAuth Redirect URIs:
   ```
   http://127.0.0.1:8000/accounts/facebook/login/callback/
   http://localhost:8000/accounts/facebook/login/callback/
   ```
3. Click "Save Changes"

### **Step 5: Get Your Credentials**
1. Go to "Settings" > "Basic" (left sidebar)
2. **App ID**: Copy this number
3. **App Secret**: Click "Show", copy this string

**✅ You now have Facebook credentials!**

---

## ⚫ **3. Apple Sign In Setup** (More Complex)

### **Step 1: Join Apple Developer Program**
1. Visit: https://developer.apple.com/programs/
2. You need to pay $99/year for Apple Developer Program
3. **Alternative**: Skip Apple for now, implement later

### **Step 2: Create App ID (If you have developer account)**
1. Go to Apple Developer Console
2. Certificates, Identifiers & Profiles
3. Create new App ID with Sign In with Apple capability
4. Create Service ID
5. Configure return URLs
6. Generate private key

**⚠️ Apple is most complex and requires paid developer account**

---

## 🔷 **4. Microsoft OAuth Setup**

### **Step 1: Go to Azure Portal**
1. Visit: https://portal.azure.com/
2. Sign in with Microsoft account
3. If you don't have Azure account, create free one

### **Step 2: Register Application**
1. Search for "Azure Active Directory" in top search
2. Go to "App registrations"
3. Click "New registration"
4. Fill in:
   - Name: "Writer's Web Dream"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: 
     - Type: Web
     - URI: `http://127.0.0.1:8000/accounts/microsoft/login/callback/`
5. Click "Register"

### **Step 3: Generate Client Secret**
1. In your app page, go to "Certificates & secrets"
2. Click "New client secret"
3. Add description: "Writers Web Dream Secret"
4. Choose expiration: 24 months
5. Click "Add"
6. **IMMEDIATELY COPY THE SECRET VALUE** (you won't see it again!)

### **Step 4: Get Your Credentials**
- **Application (client) ID**: On the Overview page
- **Client Secret**: The value you just copied

**✅ You now have Microsoft credentials!**

---

## 🚀 **Quick Start: Enable Google Login First**

Since Google is easiest, start with just Google:

### **1. Get Google credentials (follow steps above)**

### **2. Add to your settings.py:**
```python
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'APP': {
            'client_id': 'YOUR_GOOGLE_CLIENT_ID_HERE',
            'secret': 'YOUR_GOOGLE_CLIENT_SECRET_HERE',
            'key': ''
        }
    },
    # Comment out other providers for now
}
```

### **3. Update signup.html:**
Uncomment just the Google button:
```html
<a href="/accounts/google/login/" class="social-btn google">
    <i class="fab fa-google"></i>
    Continue with Google
</a>
```

### **4. Test it:**
1. Restart your Django server
2. Go to http://127.0.0.1:8000/writer/signup/
3. Click "Continue with Google"
4. Complete OAuth flow

---

## 💡 **Pro Tips**

### **Free Options (No Cost)**
- ✅ **Google**: Completely free
- ✅ **Facebook**: Free for basic usage
- ✅ **Microsoft**: Free with basic Azure account
- ❌ **Apple**: Requires $99/year developer program

### **Recommended Order**
1. **Start with Google** (easiest, most users)
2. **Add Facebook** (second most popular)
3. **Add Microsoft** (business users)
4. **Add Apple later** (if you get developer account)

### **Security Notes**
- Never commit API keys to Git
- Use environment variables in production
- Keep secrets secure
- Regular key rotation

### **Testing Domains**
For development, these domains work:
- `http://127.0.0.1:8000`
- `http://localhost:8000`

For production, you'll need:
- Your actual domain (e.g., `https://writerswebdream.com`)

---

## 🆘 **Need Help?**

If you get stuck on any provider:

1. **Check the exact redirect URIs** (common issue)
2. **Make sure APIs are enabled** (Google)
3. **Verify app is in development mode** (Facebook)
4. **Double-check client IDs/secrets** (no extra spaces)

**Start with Google - it's the most straightforward!**

Once you have Google working, adding other providers follows similar patterns.