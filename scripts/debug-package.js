const packager = require('electron-packager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Debug packaging script with detailed logging
 */

async function debugPackage() {
    try {
        console.log('🔍 Debug Packaging Prayer Slides...');
        
        // Step 1: Build the app
        console.log('\n1. Building application...');
        execSync('npm run build-simple', { stdio: 'inherit' });
        
        // Step 2: Create debug main.js
        console.log('\n2. Creating debug main.js...');
        const debugMainPath = path.join(__dirname, '../electron/main-debug.js');
        const originalMainPath = path.join(__dirname, '../electron/main.js');
        
        // Read original main.js and add debug logging
        let mainContent = fs.readFileSync(originalMainPath, 'utf8');
        
        // Add debug logging at the top
        const debugPrefix = `
// DEBUG VERSION - Enhanced logging
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  originalConsoleLog('[MAIN]', ...args);
};

console.error = (...args) => {
  originalConsoleError('[MAIN ERROR]', ...args);
};

console.log('🔍 Debug main.js starting...');
console.log('Process platform:', process.platform);
console.log('App path:', __dirname);
console.log('Process cwd:', process.cwd());
console.log('Process argv:', process.argv);

`;
        
        // Write debug version
        fs.writeFileSync(debugMainPath, debugPrefix + mainContent);
        
        // Step 3: Package with debug main
        console.log('\n3. Packaging with debug main...');
        
        const options = {
            dir: '.',
            name: 'Prayer Slides Debug',
            platform: process.platform,
            arch: 'x64',
            out: 'debug-packaged',
            overwrite: true,
            icon: 'public/icon.png',
            electronVersion: undefined, // Use latest
            ignore: [
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
        
        // Temporarily update package.json to use debug main
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const originalMain = packageJson.main;
        packageJson.main = 'electron/main-debug.js';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        
        try {
            const appPaths = await packager(options);
            console.log('\n✅ Debug packaging completed!');
            console.log('📁 Debug package location:', appPaths[0]);
            
            // Step 4: Create debug launcher
            const debugAppPath = appPaths[0];
            const debugLauncherPath = path.join(debugAppPath, 'debug-launch.bat');
            
            const debugLauncher = `@echo off
title Prayer Slides Debug
echo Starting Prayer Slides in debug mode...
echo.
echo This will show detailed console output to help diagnose issues.
echo.
"Prayer Slides Debug.exe" --enable-logging --log-level=0 --disable-web-security --remote-debugging-port=9222
echo.
echo App closed. Press any key to exit.
pause`;
            
            fs.writeFileSync(debugLauncherPath, debugLauncher);
            
            console.log('\n🔧 Debug tools created:');
            console.log(`   📦 Debug app: ${debugAppPath}`);
            console.log(`   🚀 Debug launcher: debug-launch.bat`);
            console.log('\n📋 To debug:');
            console.log('   1. Run debug-launch.bat in the debug package folder');
            console.log('   2. Check console output for errors');
            console.log('   3. Open Chrome and go to chrome://inspect for remote debugging');
            
            return debugAppPath;
            
        } finally {
            // Restore original package.json
            packageJson.main = originalMain;
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            
            // Clean up debug main file
            if (fs.existsSync(debugMainPath)) {
                fs.unlinkSync(debugMainPath);
            }
        }
        
    } catch (error) {
        console.error('❌ Debug packaging failed:', error.message);
        console.log('\n💡 This debug version provides detailed logging to help identify issues');
        process.exit(1);
    }
}

if (require.main === module) {
    debugPackage();
}

module.exports = { debugPackage };
