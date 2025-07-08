const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Cross-platform build script for creating Mac DMG from Windows
 */

async function buildForMac() {
    try {
        console.log('🍎 Building Prayer Slides for Mac from Windows...');
        console.log('⚠️  Note: This requires additional setup for cross-compilation\n');
        
        // Step 1: Build the app
        console.log('1. Building application...');
        execSync('npm run build-app', { stdio: 'inherit' });
        
        // Step 2: Try electron-builder cross-compilation
        console.log('\n2. Attempting cross-platform build...');
        
        try {
            // Build for Mac using electron-builder
            execSync('npx electron-builder --mac --publish=never', { 
                stdio: 'inherit',
                env: { 
                    ...process.env, 
                    DEBUG: 'electron-builder',
                    CSC_IDENTITY_AUTO_DISCOVERY: 'false' // Disable code signing
                }
            });
            
            console.log('\n✅ Mac DMG created successfully!');
            
            // Show results
            const distDir = path.join(process.cwd(), 'dist');
            if (fs.existsSync(distDir)) {
                const files = fs.readdirSync(distDir);
                const dmgFiles = files.filter(file => file.endsWith('.dmg'));
                
                if (dmgFiles.length > 0) {
                    console.log('\n📁 Mac DMG files created:');
                    dmgFiles.forEach(file => {
                        const filePath = path.join(distDir, file);
                        const stats = fs.statSync(filePath);
                        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
                        console.log(`   🍎 ${file} (${sizeInMB} MB)`);
                    });
                } else {
                    console.log('⚠️  No DMG files found in dist directory');
                }
            }
            
        } catch (error) {
            console.error('❌ Cross-platform build failed:', error.message);
            console.log('\n💡 This is expected - cross-compilation has limitations');
            throw error;
        }
        
    } catch (error) {
        console.log('\n🔄 Cross-platform build failed. Here are alternative solutions:\n');
        
        console.log('📋 Alternative Methods:');
        console.log('   1. Use GitHub Actions for Mac builds');
        console.log('   2. Use a Mac computer or VM');
        console.log('   3. Create a portable Mac package');
        console.log('   4. Use cloud build services');
        
        console.log('\n🚀 Recommended: Use GitHub Actions (see instructions below)');
    }
}

async function createPortableMacPackage() {
    try {
        console.log('📦 Creating portable Mac package...');
        
        // Build the app first
        execSync('npm run build-app', { stdio: 'inherit' });
        
        // Create a Mac-compatible package structure
        const macDir = path.join(process.cwd(), 'mac-portable');
        const appDir = path.join(macDir, 'Prayer Slides.app');
        const contentsDir = path.join(appDir, 'Contents');
        const macOSDir = path.join(contentsDir, 'MacOS');
        const resourcesDir = path.join(contentsDir, 'Resources');
        
        // Create directory structure
        fs.mkdirSync(macOSDir, { recursive: true });
        fs.mkdirSync(resourcesDir, { recursive: true });
        
        // Copy app files
        const filesToCopy = [
            { src: 'out', dest: path.join(resourcesDir, 'app', 'out') },
            { src: 'electron', dest: path.join(resourcesDir, 'app', 'electron') },
            { src: 'package.json', dest: path.join(resourcesDir, 'app', 'package.json') },
            { src: 'prayer-slides-data.zip', dest: path.join(resourcesDir, 'app', 'prayer-slides-data.zip') }
        ];
        
        for (const file of filesToCopy) {
            const srcPath = path.join(process.cwd(), file.src);
            if (fs.existsSync(srcPath)) {
                if (fs.statSync(srcPath).isDirectory()) {
                    fs.cpSync(srcPath, file.dest, { recursive: true });
                } else {
                    fs.mkdirSync(path.dirname(file.dest), { recursive: true });
                    fs.copyFileSync(srcPath, file.dest);
                }
                console.log(`✅ Copied ${file.src}`);
            }
        }
        
        // Create Info.plist
        const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Prayer Slides</string>
    <key>CFBundleExecutable</key>
    <string>Prayer Slides</string>
    <key>CFBundleIdentifier</key>
    <string>com.prayerslides.app</string>
    <key>CFBundleName</key>
    <string>Prayer Slides</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>`;
        
        fs.writeFileSync(path.join(contentsDir, 'Info.plist'), infoPlist);
        
        // Create launcher script (this would need to be replaced with actual Electron binary on Mac)
        const launcher = `#!/bin/bash
# This is a placeholder - actual Mac build requires Electron binary
echo "This package needs to be completed on a Mac system"
echo "Copy this structure to a Mac and run: npm run package-mac"`;
        
        fs.writeFileSync(path.join(macOSDir, 'Prayer Slides'), launcher);
        
        // Create README for Mac users
        const macReadme = `# Prayer Slides - Mac Package

This is a portable Mac package structure created on Windows.

## To complete the Mac build:

1. Copy this entire folder to a Mac computer
2. Install Node.js and npm on the Mac
3. Run: npm install
4. Run: npm run package-mac

This will create a proper .app bundle and .dmg file.

## Alternative: Use the provided GitHub Actions workflow

See the .github/workflows/build-mac.yml file for automated Mac builds.
`;
        
        fs.writeFileSync(path.join(macDir, 'README-MAC.md'), macReadme);
        
        console.log('\n✅ Portable Mac package structure created!');
        console.log(`📁 Location: ${macDir}`);
        console.log('\n📋 Next steps:');
        console.log('   1. Copy the mac-portable folder to a Mac computer');
        console.log('   2. Follow the README-MAC.md instructions');
        console.log('   3. Or use GitHub Actions for automated builds');
        
        return macDir;
        
    } catch (error) {
        console.error('❌ Portable Mac package creation failed:', error.message);
        throw error;
    }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (require.main === module) {
    if (command === 'portable') {
        createPortableMacPackage();
    } else {
        buildForMac();
    }
}

module.exports = { buildForMac, createPortableMacPackage };
