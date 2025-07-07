const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Clean installer build script that avoids file locking issues
 */

async function buildInstaller() {
    try {
        console.log('🚀 Building Prayer Slides Installer...');
        console.log('📦 This will create proper .exe and .dmg files\n');
        
        // Step 1: Aggressive cleanup
        console.log('1. Performing aggressive cleanup...');
        await aggressiveCleanup();
        
        // Step 2: Build the application
        console.log('\n2. Building application...');
        execSync('npm run build', { stdio: 'inherit' });
        execSync('npm run export', { stdio: 'inherit' });
        execSync('node scripts/fix-paths.js', { stdio: 'inherit' });
        
        // Step 3: Ensure data zip exists
        const dataZipPath = path.join(process.cwd(), 'prayer-slides-data.zip');
        if (!fs.existsSync(dataZipPath)) {
            console.log('Creating initial data zip...');
            execSync('node scripts/create-initial-zip.js', { stdio: 'inherit' });
        }
        
        // Step 4: Wait for file system to settle
        console.log('\n3. Waiting for file system to settle...');
        await wait(3000);
        
        // Step 5: Build installer with specific platform
        console.log('\n4. Building installer...');
        
        if (process.platform === 'win32') {
            console.log('🪟 Building Windows installer (.exe)...');
            
            // Try NSIS installer first
            try {
                execSync('npx electron-builder --win nsis', { 
                    stdio: 'inherit',
                    env: { ...process.env, DEBUG: 'electron-builder' }
                });
                console.log('✅ Windows NSIS installer created successfully');
            } catch (error) {
                console.log('⚠️  NSIS build failed, trying portable...');
                
                // Fallback to portable
                execSync('npx electron-builder --win portable', { 
                    stdio: 'inherit',
                    env: { ...process.env, DEBUG: 'electron-builder' }
                });
                console.log('✅ Windows portable executable created successfully');
            }
            
        } else if (process.platform === 'darwin') {
            console.log('🍎 Building Mac installer (.dmg)...');
            execSync('npx electron-builder --mac dmg', { 
                stdio: 'inherit',
                env: { ...process.env, DEBUG: 'electron-builder' }
            });
            console.log('✅ Mac DMG created successfully');
            
        } else {
            console.log('🐧 Building Linux installer (.AppImage)...');
            execSync('npx electron-builder --linux AppImage', { 
                stdio: 'inherit',
                env: { ...process.env, DEBUG: 'electron-builder' }
            });
            console.log('✅ Linux AppImage created successfully');
        }
        
        // Step 6: Show results
        console.log('\n🎉 Installer build completed successfully!');
        showBuildResults();
        
    } catch (error) {
        console.error('❌ Installer build failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Restart your computer to clear all file locks');
        console.log('   2. Run as Administrator (Windows)');
        console.log('   3. Close all Electron apps and Node processes');
        console.log('   4. Try: npm run force-clean && npm run build-installer');
        process.exit(1);
    }
}

async function aggressiveCleanup() {
    try {
        // Kill all processes
        if (process.platform === 'win32') {
            const processesToKill = [
                'electron.exe',
                'node.exe',
                'app-builder.exe',
                'Prayer Slides.exe'
            ];
            
            for (const proc of processesToKill) {
                try {
                    execSync(`taskkill /F /IM "${proc}" /T`, { stdio: 'ignore' });
                } catch (e) { /* ignore */ }
            }
        } else {
            try {
                execSync('pkill -f electron', { stdio: 'ignore' });
                execSync('pkill -f "Prayer Slides"', { stdio: 'ignore' });
            } catch (e) { /* ignore */ }
        }
        
        // Wait for processes to die
        await wait(2000);
        
        // Remove build directories
        const dirsToRemove = ['dist', 'release'];
        for (const dir of dirsToRemove) {
            const dirPath = path.join(process.cwd(), dir);
            if (fs.existsSync(dirPath)) {
                try {
                    if (process.platform === 'win32') {
                        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
                    } else {
                        execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
                    }
                    console.log(`✅ Removed ${dir} directory`);
                } catch (error) {
                    console.log(`⚠️  Could not remove ${dir}: ${error.message}`);
                }
            }
        }
        
        console.log('✅ Cleanup completed');
        
    } catch (error) {
        console.log('⚠️  Cleanup had issues:', error.message);
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showBuildResults() {
    console.log('\n📁 Build Results:');
    
    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        
        files.forEach(file => {
            const filePath = path.join(distDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isFile()) {
                const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
                
                if (file.endsWith('.exe')) {
                    console.log(`   🪟 ${file} (${sizeInMB} MB) - Windows Installer`);
                } else if (file.endsWith('.dmg')) {
                    console.log(`   🍎 ${file} (${sizeInMB} MB) - Mac Disk Image`);
                } else if (file.endsWith('.AppImage')) {
                    console.log(`   🐧 ${file} (${sizeInMB} MB) - Linux AppImage`);
                } else if (stats.size > 1024 * 1024) {
                    console.log(`   📦 ${file} (${sizeInMB} MB)`);
                }
            }
        });
    }
    
    console.log('\n✨ Ready for distribution!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Test the installer on a clean system');
    console.log('   2. Distribute to users');
    console.log('   3. Create update packages with: npm run create-distribution');
}

// Build for specific platform
async function buildForPlatform(platform) {
    try {
        await aggressiveCleanup();
        
        // Build app
        execSync('npm run build', { stdio: 'inherit' });
        execSync('npm run export', { stdio: 'inherit' });
        execSync('node scripts/fix-paths.js', { stdio: 'inherit' });
        
        // Ensure data zip
        const dataZipPath = path.join(process.cwd(), 'prayer-slides-data.zip');
        if (!fs.existsSync(dataZipPath)) {
            execSync('node scripts/create-initial-zip.js', { stdio: 'inherit' });
        }
        
        await wait(3000);
        
        // Build for specific platform
        const platformMap = {
            'win': '--win',
            'mac': '--mac',
            'linux': '--linux'
        };
        
        const buildCmd = `npx electron-builder ${platformMap[platform]}`;
        console.log(`Building for ${platform}...`);
        execSync(buildCmd, { stdio: 'inherit' });
        
        showBuildResults();
        
    } catch (error) {
        console.error(`❌ Build failed for ${platform}:`, error.message);
        process.exit(1);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
const platform = args.find(arg => ['win', 'mac', 'linux'].includes(arg));

if (require.main === module) {
    if (platform) {
        buildForPlatform(platform);
    } else {
        buildInstaller();
    }
}

module.exports = { buildInstaller, buildForPlatform };
