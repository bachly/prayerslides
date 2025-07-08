const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

/**
 * Script to create initial zip file from the current public folder
 */

function createInitialZip() {
    try {
        const publicDir = path.join(__dirname, '../public');
        const outputZip = path.join(__dirname, '../prayer-slides-data.zip');
        
        console.log('🚀 Creating initial Prayer Slides data zip...');
        console.log(`Source: ${publicDir}`);
        console.log(`Output: ${outputZip}`);
        
        // Check if public directory exists
        if (!fs.existsSync(publicDir)) {
            console.error('❌ Public directory not found!');
            process.exit(1);
        }
        
        // Create zip file
        const zip = new AdmZip();
        
        // Add only essential files (not large images)
        const essentialFiles = ['files', 'icon.png', 'icon.svg'];

        essentialFiles.forEach(item => {
            const itemPath = path.join(publicDir, item);
            if (fs.existsSync(itemPath)) {
                if (fs.statSync(itemPath).isDirectory()) {
                    zip.addLocalFolder(itemPath, item);
                } else {
                    zip.addLocalFile(itemPath, '', item);
                }
            }
        });
        
        // Write zip file
        zip.writeZip(outputZip);
        
        console.log('✅ Successfully created prayer-slides-data.zip');
        console.log('📁 Contents:');
        
        // List contents
        const entries = zip.getEntries();
        entries.forEach(entry => {
            console.log(`   ${entry.entryName}`);
        });
        
        console.log('\n🎉 Initial zip file created successfully!');
        console.log('📝 Next steps:');
        console.log('   1. This zip file can be distributed to churches');
        console.log('   2. Churches can import it using the Import button');
        console.log('   3. The app will automatically use the zipped data');
        
    } catch (error) {
        console.error('❌ Error creating initial zip:', error);
        process.exit(1);
    }
}

// Run the script
createInitialZip();
