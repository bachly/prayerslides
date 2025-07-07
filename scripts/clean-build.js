const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script to clean up processes and files before building
 */

function killElectronProcesses() {
    try {
        console.log('🔍 Checking for running Electron processes...');

        // Kill any running Electron processes
        if (process.platform === 'win32') {
            try {
                // Kill electron processes
                execSync('taskkill /F /IM electron.exe /T', { stdio: 'ignore' });
                console.log('✅ Killed running Electron processes');
            } catch (error) {
                // No processes to kill, which is fine
                console.log('ℹ️  No Electron processes found');
            }

            try {
                // Also kill any node processes that might be holding files
                execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq *electron*" /T', { stdio: 'ignore' });
            } catch (error) {
                // Ignore errors
            }

            try {
                // Kill any app-builder processes
                execSync('taskkill /F /IM app-builder.exe /T', { stdio: 'ignore' });
            } catch (error) {
                // Ignore errors
            }
        } else {
            try {
                execSync('pkill -f electron', { stdio: 'ignore' });
                console.log('✅ Killed running Electron processes');
            } catch (error) {
                // No processes to kill, which is fine
                console.log('ℹ️  No Electron processes found');
            }
        }
    } catch (error) {
        console.log('⚠️  Could not check/kill Electron processes:', error.message);
    }
}

function cleanDistDirectory() {
    try {
        console.log('🧹 Cleaning build directories...');

        const distPath = path.join(process.cwd(), 'dist');
        const releasePath = path.join(process.cwd(), 'release');
        
        // Clean both dist and release directories
        const directories = [
            { path: distPath, name: 'dist' },
            { path: releasePath, name: 'release' }
        ];

        for (const dir of directories) {
            if (fs.existsSync(dir.path)) {
                // Try to remove the directory
                if (process.platform === 'win32') {
                    try {
                        execSync(`rmdir /s /q "${dir.path}"`, { stdio: 'ignore' });
                        console.log(`✅ Cleaned ${dir.name} directory`);
                    } catch (error) {
                        console.log(`⚠️  Could not remove ${dir.name} directory completely, trying alternative method...`);

                        // Try PowerShell method
                        try {
                            execSync(`powershell "Remove-Item -Path '${dir.path}' -Recurse -Force"`, { stdio: 'ignore' });
                            console.log(`✅ Cleaned ${dir.name} directory with PowerShell`);
                        } catch (psError) {
                            console.log(`⚠️  Could not clean ${dir.name} directory:`, psError.message);
                            console.log(`💡 You may need to manually delete the ${dir.name} folder`);
                        }
                    }
                } else {
                    try {
                        execSync(`rm -rf "${dir.path}"`, { stdio: 'ignore' });
                        console.log(`✅ Cleaned ${dir.name} directory`);
                    } catch (error) {
                        console.log(`⚠️  Could not clean ${dir.name} directory:`, error.message);
                    }
                }
            } else {
                console.log(`ℹ️  ${dir.name} directory does not exist`);
            }
        }
    } catch (error) {
        console.log('⚠️  Error cleaning dist directory:', error.message);
    }
}

function waitForFileRelease() {
    console.log('⏳ Waiting for file handles to be released...');
    return new Promise(resolve => {
        setTimeout(resolve, 2000); // Wait 2 seconds
    });
}

async function cleanBuild() {
    console.log('🚀 Starting clean build process...');
    
    // Step 1: Kill any running Electron processes
    killElectronProcesses();
    
    // Step 2: Wait for processes to fully terminate
    await waitForFileRelease();
    
    // Step 3: Clean the dist directory
    cleanDistDirectory();
    
    // Step 4: Wait a bit more to ensure everything is cleaned up
    await waitForFileRelease();
    
    console.log('✅ Clean build preparation completed');
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
    cleanBuild().catch(error => {
        console.error('❌ Clean build failed:', error);
        process.exit(1);
    });
}

module.exports = { cleanBuild, killElectronProcesses, cleanDistDirectory };
