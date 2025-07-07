# Prayer Slides - Build and Distribution Guide

This guide explains how to build exe and dmg files for Windows and Mac distribution.

## 🚨 Known Issue: File Locking on Windows

There's a known issue with electron-builder on Windows where `app.asar` files get locked by the system, preventing builds. This is a common Windows problem with electron-builder.

## 🛠️ Build Methods

### Method 1: Standard Build (Recommended for Mac/Linux)

```bash
# Build for current platform
npm run dist

# Build for all platforms (requires setup)
npm run dist-all
```

### Method 2: Manual/Portable Distribution (Windows Workaround)

```bash
# Create portable version that works around file locking
npm run manual-dist
```

### Method 3: Platform-Specific Commands

```bash
# Development build (always works)
npm run build-simple
npm run electron

# Clean build directories
npm run clean-build

# Create distribution zip for churches
npm run create-distribution
```

## 📦 Available Build Scripts

| Command | Description |
|---------|-------------|
| `npm run build-simple` | Basic development build |
| `npm run clean-build` | Clean all build directories |
| `npm run dist` | Build distributable packages |
| `npm run dist-all` | Build for all platforms |
| `npm run manual-dist` | Create portable version |
| `npm run create-distribution` | Create update zip for churches |

## 🪟 Windows Distribution

### Option A: Standard Build (if working)
```bash
npm run dist
```
**Output:** `dist/Prayer Slides-{version}-win-x64.exe`

### Option B: Portable Version (recommended)
```bash
npm run manual-dist
```
**Output:** `manual-dist/Prayer-Slides-Portable.zip`

**Advantages of Portable Version:**
- ✅ Works around file locking issues
- ✅ No installation required
- ✅ Can be run from USB drives
- ✅ Includes all dependencies
- ⚠️ Requires Node.js on target system

## 🍎 Mac Distribution

### Standard Build
```bash
npm run dist
```
**Output:** `dist/Prayer Slides-{version}-mac-x64.dmg`

### Cross-Platform Build (from Windows)
```bash
npm run dist-all
```
**Note:** Cross-platform building may require additional setup.

## 🐧 Linux Distribution

### Standard Build
```bash
npm run dist
```
**Output:** `dist/Prayer Slides-{version}-linux-x64.AppImage`

## 🔧 Troubleshooting Windows Build Issues

### File Locking Error
```
⨯ remove app.asar: The process cannot access the file because it is being used by another process
```

**Solutions:**
1. **Use Portable Build:** `npm run manual-dist`
2. **Restart Computer:** Clears all file locks
3. **Run as Administrator:** May help with permissions
4. **Kill All Processes:** Close all Electron apps and Node processes
5. **Manual Cleanup:** Delete `dist` and `release` folders manually

### Force Cleanup (if needed)
```bash
# Kill all processes and clean directories
node scripts/force-clean.js

# Manual directory removal
rmdir /s /q dist
rmdir /s /q release
```

## 📋 Distribution Workflow

### For Churches (End Users)

1. **Standard Installer:**
   - Download `.exe` (Windows) or `.dmg` (Mac)
   - Run installer and follow prompts
   - App installs to system

2. **Portable Version:**
   - Download `Prayer-Slides-Portable.zip`
   - Extract to desired location
   - Run `start.bat` (Windows) or `start.sh` (Mac/Linux)
   - Requires Node.js installed

### For Updates

1. **App Updates:**
   - Build new version using same method
   - Distribute new installer/portable package

2. **Data Updates:**
   - Use `npm run create-distribution` to create update zip
   - Churches import via Import button in app
   - Automatic backup of previous data

## 🔄 Complete Build Process

### Development to Distribution

```bash
# 1. Development
npm run build-simple
npm run electron

# 2. Create data package
npm run create-distribution

# 3. Build for distribution
npm run dist  # or npm run manual-dist for Windows

# 4. Test on target systems
# 5. Distribute to churches
```

## 📁 Output Files

### Standard Build
```
dist/
├── Prayer Slides-1.0.0-win-x64.exe      # Windows installer
├── Prayer Slides-1.0.0-mac-x64.dmg      # Mac disk image
└── Prayer Slides-1.0.0-linux-x64.AppImage # Linux app image
```

### Portable Build
```
manual-dist/
├── Prayer Slides/                        # Portable app folder
│   ├── start.bat                        # Windows launcher
│   ├── start.sh                         # Unix launcher
│   ├── README.md                        # Instructions
│   └── [app files]
└── Prayer-Slides-Portable.zip           # Distribution package
```

## 🎯 Recommended Approach

1. **For Development:** Use `npm run build-simple`
2. **For Windows Distribution:** Use `npm run manual-dist` (avoids file locking)
3. **For Mac Distribution:** Use `npm run dist`
4. **For Data Updates:** Use `npm run create-distribution`

## 📞 Support

If builds continue to fail:
1. Check Node.js and npm versions
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and run `npm install`
4. Try building on a different machine
5. Use the portable distribution method as a reliable fallback

The portable version is a robust alternative that works around Windows file locking issues while providing the same functionality.
