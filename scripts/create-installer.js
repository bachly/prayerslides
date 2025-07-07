const installer = require('electron-installer-windows');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Create Windows installer from packaged app
 */

async function createWindowsInstaller() {
    try {
        console.log('🔧 Creating Windows Installer (.exe)...');
        
        // Step 1: Ensure we have a packaged app
        const packagedPath = path.join(process.cwd(), 'packaged', 'Prayer Slides-win32-x64');
        if (!fs.existsSync(packagedPath)) {
            console.log('📦 Packaged app not found, creating it first...');
            execSync('npm run package-win', { stdio: 'inherit' });
        }
        
        // Step 2: Create installer
        console.log('\n🔧 Building Windows installer...');
        
        const options = {
            src: packagedPath,
            dest: 'installers/',
            name: 'prayer-slides',
            productName: 'Prayer Slides',
            exe: 'Prayer Slides.exe',
            setupExe: 'Prayer-Slides-Setup.exe',
            setupIcon: 'public/icon.ico',
            version: '1.0.0',
            description: 'Prayer Slides - Church Presentation Software',
            authors: 'Prayer Slides Team',
            owners: 'Prayer Slides Team',
            homepage: 'https://github.com/prayerslides',
            licenseUrl: 'https://github.com/prayerslides/LICENSE',
            requireLicenseAcceptance: false,
            tags: 'prayer slides church presentation',
            certificateFile: undefined, // No code signing for now
            certificatePassword: undefined,
            remoteReleases: undefined,
            noMsi: true // Only create .exe, not .msi
        };
        
        console.log('Creating installer with options:', {
            src: options.src,
            dest: options.dest,
            setupExe: options.setupExe,
            productName: options.productName
        });
        
        await installer(options);
        
        console.log('\n✅ Windows installer created successfully!');
        
        // Step 3: Show results
        const installerPath = path.join(process.cwd(), 'installers', options.setupExe);
        if (fs.existsSync(installerPath)) {
            const stats = fs.statSync(installerPath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            console.log('\n📁 Installer Details:');
            console.log(`   📦 File: ${options.setupExe}`);
            console.log(`   📍 Location: ${installerPath}`);
            console.log(`   📊 Size: ${sizeInMB} MB`);
            console.log(`   🎯 Type: Windows Executable Installer`);
        }
        
        console.log('\n🎉 Ready for distribution!');
        console.log('\n📋 Distribution Instructions:');
        console.log('   1. Share the Prayer-Slides-Setup.exe file');
        console.log('   2. Users double-click to install');
        console.log('   3. App will be installed to Program Files');
        console.log('   4. Desktop and Start Menu shortcuts created');
        
        return installerPath;
        
    } catch (error) {
        console.error('❌ Installer creation failed:', error.message);
        console.log('\n💡 Alternative: The packaged app can be distributed as-is');
        console.log('   Users can run "Prayer Slides.exe" directly from the folder');
        process.exit(1);
    }
}

async function createMacInstaller() {
    try {
        console.log('🍎 Creating Mac Installer (.dmg)...');
        
        // For Mac, we'll use a different approach
        console.log('📦 Packaging for Mac first...');
        execSync('npm run package-mac', { stdio: 'inherit' });
        
        // Install create-dmg if not available
        try {
            execSync('which create-dmg', { stdio: 'ignore' });
        } catch (error) {
            console.log('Installing create-dmg...');
            execSync('npm install --save-dev create-dmg', { stdio: 'inherit' });
        }
        
        const packagedPath = path.join(process.cwd(), 'packaged', 'Prayer Slides-darwin-x64');
        const appPath = path.join(packagedPath, 'Prayer Slides.app');
        
        if (!fs.existsSync(appPath)) {
            throw new Error('Mac app bundle not found');
        }
        
        // Create DMG
        const dmgPath = path.join(process.cwd(), 'installers', 'Prayer-Slides-Installer.dmg');
        
        // Ensure installers directory exists
        const installersDir = path.join(process.cwd(), 'installers');
        if (!fs.existsSync(installersDir)) {
            fs.mkdirSync(installersDir, { recursive: true });
        }
        
        console.log('Creating DMG...');
        execSync(`npx create-dmg "${appPath}" "${installersDir}"`, { stdio: 'inherit' });
        
        console.log('\n✅ Mac DMG created successfully!');
        console.log(`📁 Location: ${dmgPath}`);
        
        return dmgPath;
        
    } catch (error) {
        console.error('❌ Mac installer creation failed:', error.message);
        console.log('\n💡 Alternative: Distribute the .app bundle directly');
        process.exit(1);
    }
}

// Command line interface
const args = process.argv.slice(2);
const platform = args[0];

if (require.main === module) {
    if (platform === 'mac') {
        createMacInstaller();
    } else {
        createWindowsInstaller();
    }
}

module.exports = { createWindowsInstaller, createMacInstaller };
