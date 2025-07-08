const packager = require('electron-packager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Simple electron packager script that avoids file locking issues
 */

async function packageApp() {
    try {
        console.log('📦 Packaging Prayer Slides with electron-packager...');
        
        // Step 1: Build the app
        console.log('\n1. Building application...');
        execSync('npm run build-app', { stdio: 'inherit' });
        
        // Step 2: Package with electron-packager
        console.log('\n2. Packaging application...');
        
        const options = {
            dir: '.',
            name: 'Prayer Slides',
            platform: process.platform,
            arch: 'x64',
            out: 'packaged',
            overwrite: true,
            icon: 'public/icon.png',
            electronVersion: undefined, // Use latest like debug version
            ignore: [
                // Match debug version ignore patterns
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
                /^\/\.vscode/,
                /^\/\.env/
            ],
            extraResource: [
                'prayer-slides-data.zip'
            ]
        };
        
        console.log('Packaging options:', {
            platform: options.platform,
            arch: options.arch,
            name: options.name,
            out: options.out
        });
        
        const appPaths = await packager(options);
        
        console.log('\n✅ Packaging completed successfully!');
        console.log('📁 Packaged app location:', appPaths[0]);
        
        // Step 3: Show results
        const packagedDir = appPaths[0];
        if (fs.existsSync(packagedDir)) {
            const stats = fs.statSync(packagedDir);
            console.log('📊 Package created at:', packagedDir);
            
            // List contents
            const contents = fs.readdirSync(packagedDir);
            console.log('📋 Package contents:');
            contents.forEach(item => {
                console.log(`   - ${item}`);
            });
        }
        
        console.log('\n🎉 Ready for distribution!');
        console.log('\n📋 To create an installer:');
        console.log('   Windows: Use Inno Setup or NSIS with the packaged folder');
        console.log('   Mac: Create a DMG with the .app bundle');
        console.log('   Linux: Create an AppImage or deb package');
        
        return appPaths[0];
        
    } catch (error) {
        console.error('❌ Packaging failed:', error.message);
        console.log('\n💡 This method avoids electron-builder file locking issues');
        console.log('   The packaged app can be distributed as-is or wrapped in an installer');
        process.exit(1);
    }
}

async function packageForPlatform(platform, arch = 'x64') {
    try {
        console.log(`📦 Packaging for ${platform}-${arch}...`);
        
        // Build first
        execSync('npm run build-app', { stdio: 'inherit' });
        
        const options = {
            dir: '.',
            name: 'Prayer Slides',
            platform: platform,
            arch: arch,
            out: 'packaged',
            overwrite: true,
            // Skip icon for Mac to avoid format issues
            ...(platform === 'win32' ? { icon: 'public/icon.png' } : {}),
            ignore: [
                /node_modules\/(?!electron)/,
                /\.next/,
                /src/,
                /pages/,
                /components/,
                /styles/,
                /scripts/,
                /\.git/,
                /README\.md/,
                /\.gitignore/,
                /next\.config\.js/,
                /tailwind\.config\.js/,
                /postcss\.config\.js/,
                /package-lock\.json/,
                /manual-dist/,
                /dist/,
                /release/
            ],
            extraResource: [
                'prayer-slides-data.zip'
            ]
        };
        
        const appPaths = await packager(options);
        console.log(`✅ ${platform} package created:`, appPaths[0]);
        
        return appPaths[0];
        
    } catch (error) {
        console.error(`❌ Packaging failed for ${platform}:`, error.message);
        throw error;
    }
}

// Command line interface
const args = process.argv.slice(2);
const platform = args[0];
const arch = args[1] || 'x64';

if (require.main === module) {
    if (platform && ['win32', 'darwin', 'linux'].includes(platform)) {
        packageForPlatform(platform, arch);
    } else {
        packageApp();
    }
}

module.exports = { packageApp, packageForPlatform };
