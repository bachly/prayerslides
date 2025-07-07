# Prayer Slides - Mac Distribution from Windows

## 🍎 **Creating Mac .dmg from Windows**

There are several methods to create Mac distributions from Windows. Here are your options, ranked by ease and reliability:

## **Method 1: GitHub Actions** (Recommended ⭐)

### Setup (One-time)
1. **Push your code to GitHub** (if not already there)
2. **Enable GitHub Actions** in your repository
3. **The workflow is already created** at `.github/workflows/build-mac.yml`

### Build Mac DMG
```bash
# Option A: Manual trigger
# Go to GitHub → Actions → "Build Mac DMG" → "Run workflow"

# Option B: Create a version tag
git tag v1.0.0
git push origin v1.0.0
# This automatically triggers the Mac build
```

### Download Results
1. Go to GitHub → Actions → Select the completed workflow
2. Download the `prayer-slides-mac` artifact
3. Extract to get your Mac .app and .dmg files

**✅ Advantages:**
- ✅ Free (GitHub Actions)
- ✅ Real Mac environment
- ✅ Automatic builds
- ✅ Proper code signing support
- ✅ Creates both .app and .dmg

## **Method 2: Cross-Platform Build** (Limited)

### Try Cross-Compilation
```bash
npm run build-mac
```

**⚠️ Limitations:**
- May not work due to native dependencies
- No code signing
- Limited compatibility

### If It Works:
You'll get a .dmg file in the `dist/` directory.

### If It Fails:
The script will show alternative methods.

## **Method 3: Portable Mac Package**

### Create Portable Structure
```bash
npm run build-mac-portable
```

This creates a `mac-portable/` folder with:
- ✅ Proper Mac .app structure
- ✅ All your app files
- ✅ Instructions for Mac users
- ✅ Ready to transfer to Mac

### Complete on Mac:
1. Copy `mac-portable/` to a Mac computer
2. Install Node.js on the Mac
3. Run the completion commands

## **Method 4: Cloud Build Services**

### Option A: CircleCI
- Free tier includes Mac builds
- Configure `.circleci/config.yml`
- Similar to GitHub Actions

### Option B: Travis CI
- Supports Mac builds
- Configure `.travis.yml`

### Option C: AppVeyor
- Paid Mac builds
- Good Windows integration

## **Method 5: Virtual Machine**

### Setup Mac VM on Windows:
1. **Install VMware/VirtualBox**
2. **Create macOS VM** (check Apple's license terms)
3. **Install Xcode and Node.js**
4. **Build normally** with `npm run package-mac`

**⚠️ Legal Note:** Check Apple's software license agreement for VM usage.

## **Method 6: Mac Computer Access**

### Use a Mac Computer:
1. **Transfer your project** to a Mac
2. **Install dependencies:** `npm install`
3. **Build:** `npm run package-mac`
4. **Create DMG:** Use built-in tools or `create-dmg`

## 🚀 **Recommended Workflow**

### For Regular Builds:
```bash
# 1. Build Windows version
npm run production-package

# 2. Build Mac version via GitHub Actions
git tag v1.0.1
git push origin v1.0.1

# 3. Download Mac build from GitHub Actions
# 4. Distribute both versions
```

### For Quick Testing:
```bash
# Try cross-platform build first
npm run build-mac

# If it fails, use portable method
npm run build-mac-portable
# Then complete on a Mac
```

## 📦 **Distribution Strategy**

### Multi-Platform Distribution:
1. **Windows:** Use `production-packaged/Prayer Slides-win32-x64/Prayer Slides.exe`
2. **Mac:** Use GitHub Actions to create `.dmg` file
3. **Updates:** Use your zip-based update system for both platforms

### File Structure:
```
releases/
├── windows/
│   └── Prayer-Slides-Setup.exe
├── mac/
│   └── Prayer-Slides-Installer.dmg
└── updates/
    └── prayer-slides-data-v1.1.zip
```

## 🔧 **GitHub Actions Setup**

### Enable Automatic Builds:
1. **Push to GitHub:** Ensure your code is on GitHub
2. **Workflow is ready:** `.github/workflows/build-mac.yml` is included
3. **Trigger builds:** Create version tags or manual trigger

### Manual Trigger:
1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Build Mac DMG" workflow
4. Click "Run workflow"
5. Wait for completion (~10-15 minutes)
6. Download artifacts

### Automatic Trigger:
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0

# GitHub automatically builds Mac version
# Check Actions tab for progress
```

## ✅ **Success Indicators**

When successful, you'll have:
- 📦 **Windows:** `Prayer Slides.exe` (150MB)
- 🍎 **Mac:** `Prayer Slides.app` and `Prayer-Slides-Installer.dmg`
- 🔄 **Updates:** Zip-based update system for both platforms
- 🚀 **Distribution:** Ready for churches and users

## 💡 **Pro Tips**

1. **Use GitHub Actions** for the most reliable Mac builds
2. **Test on real Macs** before distributing
3. **Consider code signing** for professional distribution
4. **Keep the zip update system** - it works on both platforms
5. **Version your releases** with git tags for easy tracking

## 🎯 **Next Steps**

1. **Choose your method** (GitHub Actions recommended)
2. **Build your Mac version**
3. **Test on a real Mac**
4. **Distribute to users**
5. **Use zip updates** for ongoing maintenance

The GitHub Actions method is the most reliable way to create proper Mac distributions from Windows! 🎉
