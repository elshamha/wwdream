# Atticus Bookshelf Mobile App

A beautiful mobile app for editing your bookshelf projects from the Atticus Writer web application on the go.

## Features

🎨 **Beautiful Design**
- Gradient themes matching the web app
- Card-based project layout
- Smooth animations and transitions

📚 **Bookshelf Integration**
- View only projects marked for bookshelf display
- Seamless sync with web application
- Real-time statistics

✍️ **Mobile Writing Experience**
- Full-featured text editor
- Auto-save functionality
- Word count and reading time
- Chapter management

🔐 **Secure Authentication**
- Token-based authentication
- Secure session management
- Automatic token refresh

## Setup Instructions

### Prerequisites

- Node.js (14 or higher)
- Expo CLI: `npm install -g @expo/cli`
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

### Installation

1. **Install Dependencies**
   ```bash
   cd bookshelf-mobile
   npm install
   ```

2. **Configure API Endpoint**
   
   Update the `apiUrl` in `app.json` to point to your Django server:
   ```json
   {
     "expo": {
       "extra": {
         "apiUrl": "http://your-server-ip:8000"
       }
     }
   }
   ```

3. **Start the Development Server**
   ```bash
   npm start
   ```

4. **Run on Device/Emulator**
   - For Android: `npm run android`
   - For iOS: `npm run ios`
   - Or scan the QR code with Expo Go app

### Backend Setup

Ensure your Django server has the following:

1. **Token Authentication Enabled**
   
   Add to `INSTALLED_APPS` in `settings.py`:
   ```python
   INSTALLED_APPS = [
       # ... other apps
       'rest_framework',
       'rest_framework.authtoken',
   ]
   ```

2. **CORS Configuration**
   
   Install and configure django-cors-headers:
   ```bash
   pip install django-cors-headers
   ```
   
   Add to `MIDDLEWARE`:
   ```python
   MIDDLEWARE = [
       'corsheaders.middleware.CorsMiddleware',
       # ... other middleware
   ]
   
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:19006",  # Expo web
       # Add your mobile app origins
   ]
   ```

3. **Run Migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

## App Structure

```
bookshelf-mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js          # Authentication
│   │   ├── BookshelfScreen.js      # Main bookshelf view
│   │   ├── ChapterListScreen.js    # Project chapters
│   │   └── EditorScreen.js         # Text editor
│   ├── services/
│   │   └── api.js                  # API service
│   ├── context/
│   │   └── AuthContext.js          # Authentication state
│   └── theme/
│       └── theme.js                # UI theme
├── App.js                          # Main app component
└── app.json                        # Expo configuration
```

## Usage

1. **Login**
   - Use your web app credentials
   - App automatically stores authentication token

2. **View Bookshelf**
   - Only projects marked for bookshelf display appear
   - Tap any project to view chapters

3. **Edit Chapters**
   - Tap any chapter to open the editor
   - Auto-save keeps your work safe
   - View writing statistics anytime

4. **Create New Chapters**
   - Use the "+" button to add new chapters
   - Immediately start writing

## Features in Detail

### Auto-Save
- Automatically saves every 2 seconds after stopping typing
- Visual indicators show save status
- Manual save option available

### Statistics
- Real-time word count
- Character count
- Estimated reading time
- Paragraph count

### Responsive Design
- Adapts to different screen sizes
- Optimized for both phones and tablets
- Smooth keyboard handling

## Troubleshooting

### Common Issues

1. **"Network Error" when logging in**
   - Check that Django server is running
   - Verify API URL in app.json
   - Ensure CORS is properly configured

2. **"Failed to load projects"**
   - Make sure you have projects marked for bookshelf display
   - Check Django logs for API errors

3. **App crashes on start**
   - Clear Expo cache: `expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Development Tips

- Use Expo DevTools for debugging
- Check Django server logs for API issues
- Use React Native Debugger for advanced debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both platforms
5. Submit a pull request

## License

This project is part of the Atticus Writer application.