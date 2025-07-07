# Prayer Slides - JavaScript Error Fix Guide

## 🚨 JavaScript Error in Packaged App

If you're getting a JavaScript error when launching the packaged Prayer Slides.exe, here's how to fix it:

## 🔍 **Step 1: Debug the Issue**

### Option A: Use Debug Package
```bash
npm run debug-package
```

This creates a debug version with detailed logging:
1. Navigate to `debug-packaged/Prayer Slides Debug-win32-x64/`
2. Run `debug-launch.bat`
3. Check the console output for specific errors

### Option B: Manual Debug
```bash
# Run the current packaged app with debug flags
cd "packaged/Prayer Slides-win32-x64"
"Prayer Slides.exe" --enable-logging --log-level=0 --disable-web-security
```

## 🛠️ **Common JavaScript Errors & Fixes**

### **Error 1: "Cannot find module"**
**Cause:** Missing dependencies in packaged app
**Fix:** Rebuild with improved packaging

```bash
# Clean and rebuild
npm run clean-build
npm run package-win
```

### **Error 2: "Failed to load resource"**
**Cause:** Path resolution issues
**Fix:** The main.js has been updated with better path handling

### **Error 3: "zipUtils is not defined"**
**Cause:** Missing zipUtils module
**Fix:** Ensure adm-zip is included in packaging

### **Error 4: "Cannot read property of undefined"**
**Cause:** Missing data files or initialization issues
**Fix:** Check if prayer-slides-data.zip exists

## 🔧 **Automated Fix Process**

### Step 1: Clean Rebuild
```bash
# Remove old packages
npm run force-clean

# Rebuild everything
npm run build-simple
```

### Step 2: Create Fixed Package
```bash
# Create new package with fixes
npm run package-win
```

### Step 3: Test the Package
```bash
# Navigate to package and test
cd "packaged/Prayer Slides-win32-x64"
"Prayer Slides.exe"
```

## 📋 **Manual Fixes**

### Fix 1: Update Electron Main Process
The main.js file has been updated with:
- ✅ Better error handling for zipUtils
- ✅ Improved path resolution for packaged apps
- ✅ Fallback mechanisms for missing files
- ✅ Enhanced logging for debugging

### Fix 2: Include Required Dependencies
The packaging script now includes:
- ✅ electron (runtime)
- ✅ adm-zip (for zip handling)
- ✅ All required Node modules

### Fix 3: Ensure Data Files
The package includes:
- ✅ prayer-slides-data.zip (initial data)
- ✅ out/ directory (built Next.js app)
- ✅ electron/ directory (main process files)

## 🎯 **Specific Error Solutions**

### "ReferenceError: require is not defined"
**Solution:** Context isolation issue
```javascript
// Fixed in preload.js with proper IPC setup
```

### "Cannot access 'zipUtils' before initialization"
**Solution:** Added try-catch in main.js
```javascript
let zipUtils;
try {
  zipUtils = require('./zipUtils');
} catch (error) {
  // Fallback implementation
}
```

### "Failed to load index.html"
**Solution:** Multiple path fallbacks in main.js
```javascript
const fallbackPaths = [
  path.join(__dirname, '../out/index.html'),
  path.join(process.resourcesPath, 'app/out/index.html'),
  // ... more fallbacks
];
```

## 🚀 **Alternative: Use Electron-Builder**

If packaging continues to fail, try electron-builder:

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Build with electron-builder
npm run dist
```

## 🔄 **Complete Rebuild Process**

If all else fails, complete rebuild:

```bash
# 1. Clean everything
rm -rf node_modules packaged dist release .next out

# 2. Fresh install
npm install

# 3. Build from scratch
npm run build-simple

# 4. Package
npm run package-win

# 5. Test
cd "packaged/Prayer Slides-win32-x64"
"Prayer Slides.exe"
```

## 📞 **Still Having Issues?**

### Check These Common Causes:

1. **Node.js Version:** Ensure compatible Node.js version
2. **Antivirus:** Temporarily disable antivirus during packaging
3. **Permissions:** Run as Administrator on Windows
4. **File Locks:** Restart computer to clear file locks
5. **Disk Space:** Ensure sufficient disk space

### Get Detailed Error Info:

```bash
# Run with maximum debugging
npm run debug-package
```

Then check the console output in the debug launcher for specific error messages.

## ✅ **Success Indicators**

When the fix works, you should see:
- ✅ App launches without JavaScript errors
- ✅ UI loads properly
- ✅ Import/Export buttons are visible
- ✅ Data loads from prayer-slides-data.zip
- ✅ No console errors in debug mode

## 🎉 **Final Result**

After applying these fixes, you'll have:
- 📦 Working Prayer Slides.exe file
- 🔧 Proper error handling
- 📁 All required files included
- 🚀 Ready for distribution

The packaged app will work on any Windows computer without requiring Node.js installation!
