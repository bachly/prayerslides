const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

/**
 * Manual distribution script for when electron-builder has file locking issues
 */

async function createManualDistribution() {
    try {
        console.log('📦 Creating Manual Distribution Package...');
        console.log('This creates a portable version that works around file locking issues\n');
        
        // Step 1: Build the app
        console.log('1. Building the application...');
        execSync('npm run build-simple', { stdio: 'inherit' });
        console.log('✅ Application built successfully');
        
        // Step 2: Create distribution directory
        const distDir = path.join(process.cwd(), 'manual-dist');
        const appDir = path.join(distDir, 'Prayer Slides');
        
        if (fs.existsSync(distDir)) {
            fs.rmSync(distDir, { recursive: true, force: true });
        }
        fs.mkdirSync(appDir, { recursive: true });
        
        console.log('\n2. Creating distribution structure...');
        
        // Step 3: Copy necessary files
        const filesToCopy = [
            { src: 'out', dest: path.join(appDir, 'out') },
            { src: 'electron', dest: path.join(appDir, 'electron') },
            { src: 'package.json', dest: path.join(appDir, 'package.json') },
            { src: 'prayer-slides-data.zip', dest: path.join(appDir, 'prayer-slides-data.zip') }
        ];
        
        for (const file of filesToCopy) {
            const srcPath = path.join(process.cwd(), file.src);
            if (fs.existsSync(srcPath)) {
                if (fs.statSync(srcPath).isDirectory()) {
                    fs.cpSync(srcPath, file.dest, { recursive: true });
                } else {
                    fs.copyFileSync(srcPath, file.dest);
                }
                console.log(`✅ Copied ${file.src}`);
            }
        }
        
        // Step 4: Install production dependencies
        console.log('\n3. Installing production dependencies...');
        process.chdir(appDir);
        execSync('npm install --production --no-optional', { stdio: 'inherit' });
        process.chdir(process.cwd().replace(path.sep + 'Prayer Slides', ''));
        
        // Step 5: Create startup scripts
        console.log('\n4. Creating startup scripts...');
        
        // Windows batch file
        const windowsScript = `@echo off
title Prayer Slides
echo Starting Prayer Slides...
npx electron .
pause`;
        fs.writeFileSync(path.join(appDir, 'start.bat'), windowsScript);
        
        // PowerShell script
        const powershellScript = `# Prayer Slides Launcher
Write-Host "Starting Prayer Slides..." -ForegroundColor Green
npx electron .
Read-Host "Press Enter to exit"`;
        fs.writeFileSync(path.join(appDir, 'start.ps1'), powershellScript);
        
        // Unix shell script
        const unixScript = `#!/bin/bash
echo "Starting Prayer Slides..."
npx electron .`;
        fs.writeFileSync(path.join(appDir, 'start.sh'), unixScript);
        
        // Make shell script executable
        if (process.platform !== 'win32') {
            try {
                execSync(`chmod +x "${path.join(appDir, 'start.sh')}"`, { stdio: 'ignore' });
            } catch (error) {
                // Ignore on Windows
            }
        }
        
        // Step 6: Create README
        const readme = `# Prayer Slides - Portable Version

## How to Run

### Windows:
- Double-click "start.bat" to launch the application
- Or run "start.ps1" in PowerShell

### Mac/Linux:
- Run "./start.sh" in terminal
- Or run "npm start" in this directory

## Requirements
- Node.js must be installed on the target system
- All dependencies are included in the node_modules folder

## Features
- Import/Export functionality with zip files
- Version management (last 3 backups)
- Automatic data loading from prayer-slides-data.zip

## Troubleshooting
- If the app doesn't start, make sure Node.js is installed
- On Windows, you may need to allow the script to run
- Check that all files are present in this directory

## Distribution
This is a portable version that can be copied to any computer with Node.js installed.
`;
        fs.writeFileSync(path.join(appDir, 'README.md'), readme);
        
        console.log('✅ Created startup scripts and documentation');
        
        // Step 7: Create zip package
        console.log('\n5. Creating zip package...');
        const zip = new AdmZip();
        zip.addLocalFolder(appDir, 'Prayer Slides');
        
        const zipPath = path.join(distDir, 'Prayer-Slides-Portable.zip');
        zip.writeZip(zipPath);
        
        // Step 8: Show results
        console.log('\n🎉 Manual distribution created successfully!');
        console.log('\n📁 Distribution files:');
        console.log(`   📦 Portable App: ${appDir}`);
        console.log(`   📦 Zip Package: ${zipPath}`);
        
        const zipStats = fs.statSync(zipPath);
        const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
        console.log(`   📊 Package Size: ${zipSizeMB} MB`);
        
        console.log('\n📋 Distribution Instructions:');
        console.log('   1. Share the "Prayer-Slides-Portable.zip" file');
        console.log('   2. Users extract the zip file');
        console.log('   3. Users run "start.bat" (Windows) or "start.sh" (Mac/Linux)');
        console.log('   4. Node.js must be installed on target systems');
        
        console.log('\n✨ Ready for distribution!');
        
    } catch (error) {
        console.error('❌ Manual distribution creation failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    createManualDistribution();
}

module.exports = { createManualDistribution };
