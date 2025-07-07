const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

/**
 * Script to create a distribution zip file for churches
 * This creates a sample update that churches can import
 */

function createDistributionZip() {
    try {
        const publicDir = path.join(__dirname, '../public');
        const outputZip = path.join(__dirname, '../prayer-slides-update-sample.zip');
        
        console.log('🚀 Creating Prayer Slides distribution zip...');
        console.log(`Source: ${publicDir}`);
        console.log(`Output: ${outputZip}`);
        
        // Check if public directory exists
        if (!fs.existsSync(publicDir)) {
            console.error('❌ Public directory not found!');
            process.exit(1);
        }
        
        // Create zip file
        const zip = new AdmZip();
        
        // Add all files from public directory
        zip.addLocalFolder(publicDir, '');
        
        // Write zip file
        zip.writeZip(outputZip);
        
        console.log('✅ Successfully created prayer-slides-update-sample.zip');
        console.log('📁 Contents:');
        
        // List contents
        const entries = zip.getEntries();
        entries.forEach(entry => {
            console.log(`   ${entry.entryName}`);
        });
        
        console.log('\n🎉 Distribution zip file created successfully!');
        console.log('📝 Instructions for churches:');
        console.log('   1. Download this zip file');
        console.log('   2. Open Prayer Slides app');
        console.log('   3. Click the "Import" button in the top right');
        console.log('   4. Select this zip file');
        console.log('   5. Restart the app to see the new data');
        console.log('   6. Previous data is automatically backed up');
        
    } catch (error) {
        console.error('❌ Error creating distribution zip:', error);
        process.exit(1);
    }
}

// Run the script
createDistributionZip();
