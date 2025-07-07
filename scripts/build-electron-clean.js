const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { cleanBuild } = require('./clean-build');

/**
 * Enhanced Electron build script with cleanup
 */

async function buildElectronClean() {
    try {
        console.log('🚀 Building Prayer Slides Electron App (with cleanup)...');
        
        // Step 1: Clean up processes and files
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
        
        // Step 6: Build Electron application
        console.log('\n6. Building Electron application...');
        execSync('npx electron-builder --dir', { stdio: 'inherit' });
        console.log('✅ Electron build completed');
        
        console.log('\n🎉 Build completed successfully!');
        console.log('\nTo run the Electron app:');
        console.log('  npm run electron');
        console.log('\nTo create a distributable package:');
        console.log('  npx electron-builder');
        console.log('\n✨ Ready to run!');
        
    } catch (error) {
        console.error('❌ Electron build failed:', error.message);
        process.exit(1);
    }
}

// Run the build if this script is executed directly
if (require.main === module) {
    buildElectronClean();
}

module.exports = { buildElectronClean };
