# 🚀 Netlify Deployment Guide

This repository is now configured for easy deployment on Netlify with Firebase integration.

## 📋 Prerequisites

- A Netlify account
- A GitHub repository with this code
- Firebase project (optional - fallback values are included)

## 🔧 Deployment Steps

### 1. **Connect to Netlify**

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub account
4. Select this repository: `MahmoudSherif/study-partner-mobile`

### 2. **Configure Build Settings**

Netlify will automatically detect the build settings from `netlify.toml`:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: 18

### 3. **Set Environment Variables (Optional)**

For enhanced security, you can override the Firebase configuration:

1. Go to Site Settings → Environment Variables
2. Add the following variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Note**: If you don't set these, the app will use the fallback Firebase configuration that's already included.

### 4. **Deploy**

1. Click "Deploy Site"
2. Wait for the build to complete
3. Your app will be available at `https://[site-name].netlify.app`

## 🔥 Firebase Configuration

This repository includes Firebase configuration with fallback values, so the app will work immediately after deployment. The Firebase project includes:

- **Authentication**: Email/password and Google sign-in
- **Firestore Database**: User data storage
- **Analytics**: Usage tracking (optional)

### Security Note

While fallback values are included for immediate deployment, it's recommended to:
1. Create your own Firebase project
2. Set the environment variables in Netlify
3. Configure your own Firestore security rules

## ✅ What's Included

- ✅ Firebase authentication and database
- ✅ Automatic SPA routing with redirects
- ✅ Security headers
- ✅ Build optimization
- ✅ Environment variable support
- ✅ Analytics integration

## 🚨 Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Ensure Node.js version is set to 18
- Verify all dependencies are in package.json

### App Doesn't Load
- Check browser console for errors
- Verify the site URL is correct
- Check if redirects are working (should redirect to index.html)

### Firebase Errors
- Verify Firebase configuration
- Check Firebase project settings
- Ensure Firestore rules allow authentication

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com/)
- [Firebase Console](https://console.firebase.google.com/)
- [Original StudyPartner Repository](https://github.com/MahmoudSherif/StudyPartner)

## 🆘 Support

If you encounter issues:
1. Check the Netlify build logs
2. Review the Firebase console for errors
3. Ensure all environment variables are correctly set
4. Test the build locally with `npm run build`

---

**Your app is now ready for deployment! 🎉**