const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Aggressive cleanup script for Windows file locking issues
 */

function forceCleanup() {
    try {
        console.log('🧹 Force cleaning all processes and files...');
        
        if (process.platform === 'win32') {
            // Kill all possible processes
            const processesToKill = [
                'electron.exe',
                'node.exe',
                'app-builder.exe',
                'Prayer Slides.exe'
            ];
            
            for (const processName of processesToKill) {
                try {
                    execSync(`taskkill /F /IM "${processName}" /T`, { stdio: 'ignore' });
                    console.log(`✅ Killed ${processName} processes`);
                } catch (error) {
                    // Process not found, which is fine
                }
            }
            
            // Wait for processes to fully terminate
            console.log('⏳ Waiting for processes to terminate...');
            setTimeout(() => {}, 3000);
            
            // Force remove directories
            const dirsToRemove = ['dist', 'release', '.next'];
            for (const dir of dirsToRemove) {
                try {
                    const dirPath = path.join(process.cwd(), dir);
                    if (fs.existsSync(dirPath)) {
                        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'ignore' });
                        console.log(`✅ Removed ${dir} directory`);
                    }
                } catch (error) {
                    console.log(`⚠️  Could not remove ${dir}:`, error.message);
                }
            }
            
            // Clear npm cache
            try {
                execSync('npm cache clean --force', { stdio: 'ignore' });
                console.log('✅ Cleared npm cache');
            } catch (error) {
                console.log('⚠️  Could not clear npm cache');
            }
            
        } else {
            // Unix-like systems
            try {
                execSync('pkill -f electron', { stdio: 'ignore' });
                execSync('pkill -f node', { stdio: 'ignore' });
            } catch (error) {
                // Ignore errors
            }
            
            const dirsToRemove = ['dist', 'release', '.next'];
            for (const dir of dirsToRemove) {
                try {
                    execSync(`rm -rf ${dir}`, { stdio: 'ignore' });
                } catch (error) {
                    // Ignore errors
                }
            }
        }
        
        console.log('✅ Force cleanup completed');
        
    } catch (error) {
        console.error('❌ Force cleanup failed:', error.message);
    }
}

// Wait function
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function forceCleanupAsync() {
    forceCleanup();
    await wait(5000); // Wait 5 seconds for file handles to be released
    console.log('✅ Cleanup wait period completed');
}

if (require.main === module) {
    forceCleanupAsync();
}

module.exports = { forceCleanup, forceCleanupAsync };
