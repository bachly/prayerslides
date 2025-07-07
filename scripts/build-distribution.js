const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { cleanBuild } = require('./clean-build');

/**
 * Script to build distributable packages for Windows and Mac
 */

async function buildDistribution() {
    try {
        console.log('🚀 Building Prayer Slides Distribution Packages...');
        console.log('📦 This will create exe files for Windows and dmg files for Mac\n');
        
        // Step 1: Clean up processes and files
        console.log('1. Cleaning up processes and files...');
        await cleanBuild();
        
        // Step 2: Build Next.js application
        console.log('\n2. Building Next.js application...');
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Next.js build completed');
        
        // Step 3: Export static files
        console.log('\n3. Exporting static files...');
        execSync('npm run export', { stdio: 'inherit' });
        console.log('✅ Static export completed');
        
        // Step 4: Verify static export
        console.log('\n4. Verifying static export...');
        const outDir = path.join(process.cwd(), 'out');
        if (!fs.existsSync(outDir)) {
            throw new Error('Static export failed - out directory not found');
        }
        console.log('✅ Static export verified');
        
        // Step 5: Fix paths for Electron
        console.log('\n5. Fixing paths for Electron...');
        execSync('node scripts/fix-paths.js', { stdio: 'inherit' });
        console.log('✅ Paths fixed for Electron');
        
        // Step 6: Ensure initial data zip exists
        console.log('\n6. Ensuring initial data zip exists...');
        const dataZipPath = path.join(process.cwd(), 'prayer-slides-data.zip');
        if (!fs.existsSync(dataZipPath)) {
            console.log('Creating initial data zip...');
            execSync('node scripts/create-initial-zip.js', { stdio: 'inherit' });
        }
        console.log('✅ Initial data zip ready');
        
        // Step 7: Build distribution packages
        console.log('\n7. Building distribution packages...');
        console.log('⏳ This may take several minutes...');
        
        try {
            // Build for current platform first
            if (process.platform === 'win32') {
                console.log('🪟 Building Windows packages...');
                execSync('npx electron-builder --win', { stdio: 'inherit' });
                console.log('✅ Windows packages built successfully');
            } else if (process.platform === 'darwin') {
                console.log('🍎 Building Mac packages...');
                execSync('npx electron-builder --mac', { stdio: 'inherit' });
                console.log('✅ Mac packages built successfully');
            } else {
                console.log('🐧 Building Linux packages...');
                execSync('npx electron-builder --linux', { stdio: 'inherit' });
                console.log('✅ Linux packages built successfully');
            }
        } catch (error) {
            console.error('❌ Distribution build failed:', error.message);
            console.log('\n💡 Troubleshooting tips:');
            console.log('   1. Make sure no Electron apps are running');
            console.log('   2. Try running as Administrator (Windows)');
            console.log('   3. Restart your computer to clear file locks');
            console.log('   4. Use npm run build-simple for development builds');
            throw error;
        }
        
        // Step 8: Show results
        console.log('\n🎉 Distribution build completed successfully!');
        console.log('\n📁 Built packages can be found in the "dist" directory:');
        
        const distDir = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distDir)) {
            const files = fs.readdirSync(distDir);
            files.forEach(file => {
                const filePath = path.join(distDir, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile() && (file.endsWith('.exe') || file.endsWith('.dmg') || file.endsWith('.AppImage'))) {
                    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
                    console.log(`   📦 ${file} (${sizeInMB} MB)`);
                }
            });
        }
        
        console.log('\n✨ Ready for distribution!');
        console.log('\n📋 Next steps:');
        console.log('   1. Test the built packages on target systems');
        console.log('   2. Distribute the exe/dmg files to users');
        console.log('   3. Create update zip files using: npm run create-distribution');
        
    } catch (error) {
        console.error('❌ Distribution build failed:', error.message);
        process.exit(1);
    }
}

async function buildForAllPlatforms() {
    try {
        console.log('🌍 Building for all platforms...');
        
        // Clean first
        await cleanBuild();
        
        // Build Next.js and export
        execSync('npm run build', { stdio: 'inherit' });
        execSync('npm run export', { stdio: 'inherit' });
        execSync('node scripts/fix-paths.js', { stdio: 'inherit' });
        
        // Ensure data zip exists
        const dataZipPath = path.join(process.cwd(), 'prayer-slides-data.zip');
        if (!fs.existsSync(dataZipPath)) {
            execSync('node scripts/create-initial-zip.js', { stdio: 'inherit' });
        }
        
        // Build for all platforms
        console.log('Building for Windows, Mac, and Linux...');
        execSync('npx electron-builder --win --mac --linux', { stdio: 'inherit' });
        
        console.log('🎉 All platform builds completed!');
        
    } catch (error) {
        console.error('❌ Multi-platform build failed:', error.message);
        console.log('💡 Note: Cross-platform building may require additional setup');
        console.log('   Consider building on each target platform separately');
        process.exit(1);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const buildAll = args.includes('--all');

// Run the appropriate build
if (require.main === module) {
    if (buildAll) {
        buildForAllPlatforms();
    } else {
        buildDistribution();
    }
}

module.exports = { buildDistribution, buildForAllPlatforms };
