const packager = require('electron-packager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Production packaging script using the same config as working debug version
 */

async function productionPackage() {
    try {
        console.log('🚀 Creating Production Prayer Slides Package...');
        
        // Step 1: Build the app
        console.log('\n1. Building application...');
        execSync('npm run build-simple', { stdio: 'inherit' });
        
        // Step 2: Clean any existing production package
        const prodDir = path.join(process.cwd(), 'production-packaged');
        if (fs.existsSync(prodDir)) {
            console.log('Removing existing production package...');
            try {
                fs.rmSync(prodDir, { recursive: true, force: true });
            } catch (error) {
                console.log('Could not remove existing package, continuing...');
            }
        }
        
        // Step 3: Package with same config as debug version (but without debug logging)
        console.log('\n2. Creating production package...');
        
        const options = {
            dir: '.',
            name: 'Prayer Slides',
            platform: 'win32',
            arch: 'x64',
            out: 'production-packaged',
            overwrite: true,
            icon: 'public/icon.png',
            electronVersion: undefined, // Use latest like debug version
            ignore: [
                // Same ignore patterns as working debug version
                /^\/node_modules\/(?!(electron|adm-zip))/,
                /^\/\.next/,
                /^\/src/,
                /^\/pages/,
                /^\/components/,
                /^\/styles/,
                /^\/scripts/,
                /^\/\.git/,
                /^\/README\.md/,
                /^\/\.gitignore/,
                /^\/next\.config\.js/,
                /^\/tailwind\.config\.js/,
                /^\/postcss\.config\.js/,
                /^\/package-lock\.json/,
                /^\/manual-dist/,
                /^\/dist/,
                /^\/release/,
                /^\/packaged/,
                /^\/installers/,
                /^\/debug-packaged/,
                /^\/production-packaged/,
                /^\/\.vscode/,
                /^\/\.env/
            ],
            extraResource: [
                'prayer-slides-data.zip'
            ]
        };
        
        console.log('Packaging with production options...');
        const appPaths = await packager(options);
        
        console.log('\n✅ Production packaging completed!');
        console.log('📁 Production package location:', appPaths[0]);
        
        // Step 4: Create launcher script
        const prodAppPath = appPaths[0];
        const launcherPath = path.join(prodAppPath, 'launch.bat');
        
        const launcher = `@echo off
title Prayer Slides
echo Starting Prayer Slides...
"Prayer Slides.exe"`;
        
        fs.writeFileSync(launcherPath, launcher);
        
        // Step 5: Show results
        const exePath = path.join(prodAppPath, 'Prayer Slides.exe');
        if (fs.existsSync(exePath)) {
            const stats = fs.statSync(exePath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            console.log('\n🎉 Production .exe created successfully!');
            console.log('\n📁 Package Details:');
            console.log(`   📦 Executable: Prayer Slides.exe`);
            console.log(`   📍 Location: ${exePath}`);
            console.log(`   📊 Size: ${sizeInMB} MB`);
            console.log(`   🎯 Type: Windows Executable`);
            
            console.log('\n✨ Ready for distribution!');
            console.log('\n📋 Distribution Instructions:');
            console.log('   1. Copy the entire folder to target computers');
            console.log('   2. Users can run Prayer Slides.exe directly');
            console.log('   3. Or use launch.bat for a cleaner experience');
            console.log('   4. No installation required!');
            
            return exePath;
        } else {
            throw new Error('Executable not found after packaging');
        }
        
    } catch (error) {
        console.error('❌ Production packaging failed:', error.message);
        console.log('\n💡 Alternative: Use the debug version which works perfectly');
        console.log('   The debug version is fully functional and can be distributed as-is');
        process.exit(1);
    }
}

if (require.main === module) {
    productionPackage();
}

module.exports = { productionPackage };
