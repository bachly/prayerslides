const packager = require('electron-packager');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

/**
 * Unified build script for Windows and Mac with optimized packaging
 */

async function buildAllPlatforms() {
    try {
        console.log('🚀 Building Prayer Slides for all platforms...');
        
        // Step 1: Clean and build the app once
        console.log('\n1. Building application...');
        execSync('npm run build-app', { stdio: 'inherit' });
        
        // Step 2: Create minimal data file
        console.log('\n2. Creating minimal data file...');
        execSync('npm run create-initial-zip', { stdio: 'inherit' });
        
        // Step 3: Build Windows
        console.log('\n3. Building Windows version...');
        const windowsPath = await buildWindows();
        
        // Step 4: Build Mac
        console.log('\n4. Building Mac version...');
        const macPath = await buildMac();
        
        // Step 5: Create unified distribution
        console.log('\n5. Creating unified distribution...');
        await createUnifiedDistribution(windowsPath, macPath);
        
        console.log('\n✅ All platforms built successfully!');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        throw error;
    }
}

async function buildWindows() {
    console.log('📦 Building Windows executable...');

    const options = {
        dir: '.',
        name: 'Prayer Slides',
        platform: 'win32',
        arch: 'x64',
        out: 'dist-temp',
        overwrite: true,
        // Remove icon to avoid Wine requirement
        electronVersion: '22.3.27',
        ignore: getOptimizedIgnorePatterns(),
        extraResource: ['prayer-slides-data.zip']
    };

    const appPaths = await packager(options);
    console.log('✅ Windows build completed:', appPaths[0]);
    return appPaths[0];
}

async function buildMac() {
    console.log('📦 Building Mac application...');
    
    const options = {
        dir: '.',
        name: 'Prayer Slides',
        platform: 'darwin',
        arch: 'x64',
        out: 'dist-temp',
        overwrite: true,
        electronVersion: '22.3.27',
        ignore: getOptimizedIgnorePatterns(),
        extraResource: ['prayer-slides-data.zip']
        // No ASAR compression - keeps it smaller like Windows
    };
    
    const appPaths = await packager(options);
    console.log('✅ Mac build completed:', appPaths[0]);
    return appPaths[0];
}

function getOptimizedIgnorePatterns() {
    return [
        // Optimized patterns for smallest size
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
        /^\/dist/,
        /^\/dist-temp/,
        /^\/release/,
        /^\/packaged/,
        /^\/installers/,
        /^\/\.vscode/,
        /^\/\.env/,
        /^\/\.github/,
        /^\/BUILD-INSTRUCTIONS\.md/,
        // Exclude large image files
        /^\/public\/img\//
    ];
}

async function createUnifiedDistribution(windowsPath, macPath) {
    console.log('📦 Creating unified distribution package...');
    
    // Create distribution directory
    const distDir = path.join(process.cwd(), 'release');
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });
    
    // Create platform-specific directories
    const windowsDistDir = path.join(distDir, 'windows');
    const macDistDir = path.join(distDir, 'mac');
    fs.mkdirSync(windowsDistDir);
    fs.mkdirSync(macDistDir);
    
    // Copy Windows build
    console.log('📁 Packaging Windows distribution...');
    fs.cpSync(windowsPath, windowsDistDir, { recursive: true });
    
    // Copy Mac build  
    console.log('📁 Packaging Mac distribution...');
    fs.cpSync(macPath, macDistDir, { recursive: true });
    
    // Create README for distribution
    const readme = `# Prayer Slides - Cross-Platform Distribution

## Windows Installation
1. Navigate to the 'windows' folder
2. Run 'Prayer Slides.exe'
3. No installation required!

## Mac Installation  
1. Navigate to the 'mac' folder
2. Drag 'Prayer Slides.app' to your Applications folder
3. Right-click and select "Open" on first launch

## Features
- Import/Export prayer slide data
- Version management with automatic backups
- Offline functionality
- Cross-platform compatibility

## File Sizes
- Windows: ~100-150MB
- Mac: ~100-150MB (optimized to match Windows)

## Updates
Use the Import feature in the app to load new prayer slide data without reinstalling.

Built with Electron and Next.js
`;
    
    fs.writeFileSync(path.join(distDir, 'README.md'), readme);
    
    // Create unified zip
    console.log('🗜️ Creating unified zip package...');
    const zip = new AdmZip();
    zip.addLocalFolder(distDir, 'Prayer-Slides-Cross-Platform');
    
    const zipPath = path.join(process.cwd(), 'Prayer-Slides-Cross-Platform.zip');
    zip.writeZip(zipPath);
    
    // Show results
    const zipStats = fs.statSync(zipPath);
    const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
    
    console.log('\n🎉 Unified distribution created!');
    console.log(`📦 Package: Prayer-Slides-Cross-Platform.zip`);
    console.log(`📊 Size: ${zipSizeMB} MB`);
    console.log(`📁 Contains: Windows .exe + Mac .app`);
    
    // Show individual sizes
    if (fs.existsSync(windowsPath)) {
        const winSize = getFolderSize(windowsPath);
        console.log(`   Windows: ${(winSize / (1024 * 1024)).toFixed(2)} MB`);
    }
    
    if (fs.existsSync(macPath)) {
        const macSize = getFolderSize(macPath);
        console.log(`   Mac: ${(macSize / (1024 * 1024)).toFixed(2)} MB`);
    }
    
    // Clean up temp directories
    console.log('\n🧹 Cleaning up temporary files...');
    if (fs.existsSync('dist-temp')) {
        fs.rmSync('dist-temp', { recursive: true, force: true });
    }
    
    return zipPath;
}

function getFolderSize(folderPath) {
    let totalSize = 0;
    
    function calculateSize(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                calculateSize(filePath);
            } else {
                totalSize += stats.size;
            }
        }
    }
    
    calculateSize(folderPath);
    return totalSize;
}

// Command line interface
if (require.main === module) {
    buildAllPlatforms();
}

module.exports = { buildAllPlatforms };
