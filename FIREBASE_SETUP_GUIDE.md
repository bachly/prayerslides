# Firebase Setup Guide for Prayer Slides

This guide will walk you through setting up Firebase for the Prayer Slides application with authentication, database, and storage.

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project"
   - Project name: `prayer-slides` (or your preferred name)
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In the Firebase console, click "Authentication" in the left sidebar
   - Click "Get started"

2. **Enable Email/Password Authentication**
   - Go to "Sign-in method" tab
   - Click on "Email/Password"
   - Enable "Email/Password"
   - Click "Save"

3. **Create Admin User**
   - Go to "Users" tab
   - Click "Add user"
   - Email: `admin@pottershouse.com.au` (or your preferred admin email)
   - Password: Create a secure password
   - Click "Add user"

## Step 3: Set Up Firestore Database

1. **Create Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" (we'll secure it later)
   - Select your preferred location
   - Click "Done"

2. **Create Collections**
   - Create collection: `couples`
   - Create collection: `metadata`

3. **Set Up Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read access to all users for couples data
       match /couples/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       
       // Allow read access to metadata for version checking
       match /metadata/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Step 4: Set Up Storage

1. **Create Storage Bucket**
   - Click "Storage" in the left sidebar
   - Click "Get started"
   - Choose "Start in test mode"
   - Select your preferred location
   - Click "Done"

2. **Set Up Storage Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /couples/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## Step 5: Get Firebase Configuration

1. **Add Web App**
   - In Project Overview, click the web icon `</>`
   - App nickname: `prayer-slides-web`
   - Don't check "Set up Firebase Hosting"
   - Click "Register app"

2. **Copy Configuration**
   - Copy the `firebaseConfig` object
   - It should look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "prayer-slides-12345.firebaseapp.com",
     projectId: "prayer-slides-12345",
     storageBucket: "prayer-slides-12345.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456789"
   };
   ```

## Step 6: Configure Environment Variables

1. **Create Environment File**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=prayer-slides-12345.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=prayer-slides-12345
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=prayer-slides-12345.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
   ```

2. **Add to .gitignore**
   - Ensure `.env.local` is in your `.gitignore` file
   - Never commit your Firebase credentials to version control

## Step 7: Initial Data Migration

1. **Run the Application**
   ```bash
   npm run build-simple
   npm run electron
   ```

2. **Login as Admin**
   - Click the settings icon (⚙️) in the top right
   - Login with your admin credentials
   - The admin panel will open

3. **Migrate Existing Data** (Optional)
   - If you have existing couples data, you can use the migration function
   - Open browser DevTools (F12)
   - Run in console:
   ```javascript
   // This will migrate local data to Firebase
   migrateLocalDataToFirebase(couples)
   ```

## Step 8: Test the System

1. **Test Sync Functionality**
   - Click the sync button (🔄) to manually sync
   - Check that data loads from Firebase

2. **Test Admin Functions**
   - Add a new couple through the admin panel
   - Edit existing couple information
   - Delete a couple (be careful!)

3. **Test Offline Functionality**
   - Disconnect from internet
   - App should still work with cached data
   - Reconnect and sync should update data

## Security Best Practices

1. **Secure Firestore Rules**
   - After testing, update rules to be more restrictive
   - Consider adding role-based access control

2. **Admin Account Security**
   - Use a strong password for admin account
   - Consider enabling 2FA in Firebase console
   - Regularly rotate admin credentials

3. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different Firebase projects for development/production

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure admin user is authenticated

2. **Images not loading**
   - Check Storage security rules
   - Verify image URLs are correct

3. **Sync not working**
   - Check internet connection
   - Verify Firebase configuration
   - Check browser console for errors

### Debug Mode

To enable debug mode, add to your `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

This will show additional logging in the browser console.

## Production Deployment

1. **Update Security Rules**
   - Make Firestore and Storage rules more restrictive
   - Test thoroughly before deploying

2. **Environment Variables**
   - Set up production environment variables
   - Use Firebase project for production

3. **Monitoring**
   - Set up Firebase monitoring and alerts
   - Monitor usage and costs

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase configuration
3. Test with a fresh browser session
4. Check Firebase console for any service issues
