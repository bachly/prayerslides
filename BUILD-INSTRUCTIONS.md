# Prayer Slides - Build Instructions

## 📋 **Prerequisites**

Before building, ensure you have:
- **Node.js 16+** installed
- **npm** package manager
- **Git** (for GitHub Actions Mac builds)

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Development mode
npm run electron-dev

# Build for production
npm run build-app
npm run electron
```

## 🔧 **Available Build Commands**

### **Development**
```bash
npm run dev              # Start Next.js dev server
npm run electron-dev     # Start app in development mode
npm run electron         # Run Electron with built files
```

### **Production Builds**
```bash
npm run build-app        # Build Next.js app for Electron
npm run package-win      # Create Windows executable
npm run package-mac      # Create Mac app bundle (Mac only)
npm run dist             # Create installers (electron-builder)
npm run dist-win         # Create Windows installer
npm run dist-mac         # Create Mac DMG
```

### **Utilities**
```bash
npm run fix-paths        # Fix paths for Electron
npm run create-initial-zip    # Create initial data zip
npm run create-distribution  # Create update zip for churches
```

## 🪟 **Building Windows .exe**

### **Method 1: Electron Packager** (Recommended)
```bash
# Step 1: Build the app
npm run build-app

# Step 2: Create Windows package
npm run package-win

# Result: packaged/Prayer Slides-win32-x64/Prayer Slides.exe
```

### **Method 2: Electron Builder**
```bash
# Build Windows installer
npm run dist-win

# Result: dist/Prayer Slides-Setup-1.0.0.exe
```

### **Troubleshooting Windows Builds**
If you encounter file locking issues:
1. **Close all Electron apps**
2. **Restart your computer**
3. **Run as Administrator**
4. **Use Method 1** (more reliable)

## 🍎 **Building Mac .dmg**

### **Method 1: GitHub Actions** (Recommended for Windows users)

1. **Push code to GitHub**
2. **Go to Actions tab** in your repository
3. **Run "Build Mac DMG" workflow**
4. **Download the artifacts**

The workflow file is already included: `.github/workflows/build-mac.yml`

### **Method 2: On Mac Computer**
```bash
# Build the app
npm run build-app

# Create Mac package
npm run package-mac

# Create DMG (requires create-dmg)
npm install -g create-dmg
create-dmg 'packaged/Prayer Slides-darwin-x64/Prayer Slides.app' dist/
```

### **Method 3: Cross-Platform Build** (Limited)
```bash
# Try cross-platform build (may fail)
npm run build-mac

# If successful: dist/Prayer Slides-1.0.0-mac-x64.dmg
```

## 📦 **File Structure After Build**

### **Windows Package**
```
packaged/Prayer Slides-win32-x64/
├── Prayer Slides.exe          # Main executable
├── resources/
│   └── app/
│       ├── out/              # Built Next.js app
│       ├── electron/         # Electron main process
│       └── prayer-slides-data.zip
└── [other Electron files]
```

### **Mac Package**
```
packaged/Prayer Slides-darwin-x64/
└── Prayer Slides.app/         # Mac app bundle
    └── Contents/
        ├── MacOS/
        └── Resources/
            └── app/
                ├── out/
                ├── electron/
                └── prayer-slides-data.zip
```

## 🔄 **Complete Build Process**

### **For Distribution**
```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Build the app
npm run build-app

# 3. Create packages
npm run package-win    # Windows
npm run package-mac    # Mac (if on Mac)

# 4. Create installers (optional)
npm run dist-win       # Windows installer
npm run dist-mac       # Mac DMG
```

### **For Development**
```bash
# Quick development cycle
npm run electron-dev   # Live reload development
```

## 📋 **Build Scripts Explained**

| Script | Purpose | Output |
|--------|---------|---------|
| `build-app` | Builds Next.js app for Electron | `out/` directory |
| `package-win` | Creates Windows executable | `packaged/` directory |
| `package-mac` | Creates Mac app bundle | `packaged/` directory |
| `dist-win` | Creates Windows installer | `dist/` directory |
| `dist-mac` | Creates Mac DMG | `dist/` directory |
| `fix-paths` | Fixes relative paths for Electron | Modifies `out/` files |
| `create-distribution` | Creates update zip | Root directory |

## 🎯 **Distribution Strategy**

### **Windows Users**
1. **Build:** `npm run package-win`
2. **Distribute:** Share the entire `packaged/Prayer Slides-win32-x64/` folder
3. **Users run:** `Prayer Slides.exe`

### **Mac Users**
1. **Build:** Use GitHub Actions or Mac computer
2. **Distribute:** Share the `.dmg` file or `.app` bundle
3. **Users:** Drag to Applications folder

### **Updates**
1. **Create update zip:** `npm run create-distribution`
2. **Distribute zip:** Churches import via app's Import button
3. **No reinstall needed:** App updates data automatically

## 🔧 **Customization**

### **App Configuration**
Edit `package.json` build section:
- **App name:** Change `productName`
- **App ID:** Change `appId`
- **Icons:** Update icon paths
- **Installer options:** Modify `nsis` section

### **Build Options**
Edit `electron-builder` configuration in `package.json`:
- **Target platforms:** Modify `target` arrays
- **File inclusion:** Update `files` array
- **Extra resources:** Modify `extraResources`

## 🆘 **Troubleshooting**

### **Common Issues**

1. **"Cannot find module"**
   - Run: `npm install`
   - Check: Node.js version (requires 16+)

2. **"Build failed"**
   - Clean: `rm -rf node_modules && npm install`
   - Try: `npm run build-app` first

3. **"File locking error" (Windows)**
   - Close all Electron apps
   - Restart computer
   - Use `package-win` instead of `dist-win`

4. **"Mac build failed"**
   - Use GitHub Actions for cross-platform builds
   - Or build on actual Mac computer

### **Getting Help**
1. Check the console output for specific errors
2. Ensure all prerequisites are installed
3. Try the alternative build methods
4. Use GitHub Actions for Mac builds from Windows

## ✅ **Success Indicators**

When builds succeed, you should have:
- ✅ **Windows:** `Prayer Slides.exe` (150MB+)
- ✅ **Mac:** `Prayer Slides.app` or `.dmg` file
- ✅ **Functional app** with all features working
- ✅ **Import/Export** functionality intact
- ✅ **No JavaScript errors** when running

## 🎉 **Ready for Distribution!**

After successful builds, you can distribute:
- **Windows executable** or installer
- **Mac app bundle** or DMG
- **Update packages** via zip files

The app includes a complete zip-based update system, so users can receive new content without reinstalling the application.
