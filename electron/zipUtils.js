const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

/**
 * Utility functions for handling zip operations in the Prayer Slides app
 */

/**
 * Create a zip file from a directory
 * @param {string} sourceDir - Directory to zip
 * @param {string} outputPath - Output zip file path
 * @returns {Promise<boolean>} - Success status
 */
async function createZipFromDirectory(sourceDir, outputPath) {
    try {
        const zip = new AdmZip();
        
        // Add directory contents to zip
        zip.addLocalFolder(sourceDir, '');
        
        // Write zip file
        zip.writeZip(outputPath);
        
        console.log(`Created zip file: ${outputPath}`);
        return true;
    } catch (error) {
        console.error('Error creating zip file:', error);
        return false;
    }
}

/**
 * Extract a zip file to a directory
 * @param {string} zipPath - Path to zip file
 * @param {string} extractDir - Directory to extract to
 * @returns {Promise<boolean>} - Success status
 */
async function extractZipToDirectory(zipPath, extractDir) {
    try {
        const zip = new AdmZip(zipPath);
        
        // Ensure extract directory exists
        if (!fs.existsSync(extractDir)) {
            fs.mkdirSync(extractDir, { recursive: true });
        }
        
        // Extract all files
        zip.extractAllTo(extractDir, true);
        
        console.log(`Extracted zip to: ${extractDir}`);
        return true;
    } catch (error) {
        console.error('Error extracting zip file:', error);
        return false;
    }
}

/**
 * Read a file from within a zip archive
 * @param {string} zipPath - Path to zip file
 * @param {string} filePath - Path of file within zip
 * @returns {Promise<string|null>} - File content or null if error
 */
async function readFileFromZip(zipPath, filePath) {
    try {
        const zip = new AdmZip(zipPath);
        const entry = zip.getEntry(filePath);
        
        if (entry) {
            return entry.getData().toString('utf8');
        } else {
            console.error(`File not found in zip: ${filePath}`);
            return null;
        }
    } catch (error) {
        console.error('Error reading file from zip:', error);
        return null;
    }
}

/**
 * List all files in a zip archive
 * @param {string} zipPath - Path to zip file
 * @returns {Promise<string[]>} - Array of file paths
 */
async function listFilesInZip(zipPath) {
    try {
        const zip = new AdmZip(zipPath);
        const entries = zip.getEntries();
        
        return entries.map(entry => entry.entryName);
    } catch (error) {
        console.error('Error listing files in zip:', error);
        return [];
    }
}

/**
 * Check if a zip file contains required files for Prayer Slides
 * @param {string} zipPath - Path to zip file
 * @returns {Promise<{valid: boolean, missing: string[]}>} - Validation result
 */
async function validatePrayerSlidesZip(zipPath) {
    try {
        const requiredFiles = [
            'files/couples.json',
            'icon.png',
            'icon.svg'
        ];
        
        const files = await listFilesInZip(zipPath);
        const missing = [];
        
        for (const required of requiredFiles) {
            if (!files.includes(required)) {
                missing.push(required);
            }
        }
        
        return {
            valid: missing.length === 0,
            missing: missing
        };
    } catch (error) {
        console.error('Error validating zip file:', error);
        return {
            valid: false,
            missing: ['Error reading zip file']
        };
    }
}

/**
 * Create a backup of current data with timestamp
 * @param {string} sourceZipPath - Current data zip path
 * @param {string} backupDir - Directory to store backups
 * @returns {Promise<string|null>} - Backup file path or null if error
 */
async function createBackup(sourceZipPath, backupDir) {
    try {
        if (!fs.existsSync(sourceZipPath)) {
            console.error('Source zip file does not exist');
            return null;
        }
        
        // Ensure backup directory exists
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Create backup filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `prayer-slides-backup-${timestamp}.zip`;
        const backupPath = path.join(backupDir, backupFileName);
        
        // Copy file
        fs.copyFileSync(sourceZipPath, backupPath);
        
        console.log(`Created backup: ${backupPath}`);
        return backupPath;
    } catch (error) {
        console.error('Error creating backup:', error);
        return null;
    }
}

/**
 * Clean up old backups, keeping only the specified number
 * @param {string} backupDir - Directory containing backups
 * @param {number} keepCount - Number of backups to keep (default: 3)
 * @returns {Promise<boolean>} - Success status
 */
async function cleanupOldBackups(backupDir, keepCount = 3) {
    try {
        if (!fs.existsSync(backupDir)) {
            return true;
        }
        
        const files = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('prayer-slides-backup-') && file.endsWith('.zip'))
            .map(file => ({
                name: file,
                path: path.join(backupDir, file),
                stats: fs.statSync(path.join(backupDir, file))
            }))
            .sort((a, b) => b.stats.mtime - a.stats.mtime); // Sort by modification time, newest first
        
        // Remove old backups
        if (files.length > keepCount) {
            const filesToDelete = files.slice(keepCount);
            for (const file of filesToDelete) {
                fs.unlinkSync(file.path);
                console.log(`Deleted old backup: ${file.name}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error cleaning up old backups:', error);
        return false;
    }
}

/**
 * Get list of available backups
 * @param {string} backupDir - Directory containing backups
 * @returns {Promise<Array>} - Array of backup info objects
 */
async function getAvailableBackups(backupDir) {
    try {
        if (!fs.existsSync(backupDir)) {
            return [];
        }
        
        const files = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('prayer-slides-backup-') && file.endsWith('.zip'))
            .map(file => {
                const filePath = path.join(backupDir, file);
                const stats = fs.statSync(filePath);
                
                // Extract timestamp from filename
                const timestampMatch = file.match(/prayer-slides-backup-(.+)\.zip$/);
                const timestamp = timestampMatch ? timestampMatch[1].replace(/-/g, ':') : '';
                
                return {
                    name: file,
                    path: filePath,
                    timestamp: timestamp,
                    date: stats.mtime,
                    size: stats.size
                };
            })
            .sort((a, b) => b.date - a.date); // Sort by date, newest first
        
        return files;
    } catch (error) {
        console.error('Error getting available backups:', error);
        return [];
    }
}

module.exports = {
    createZipFromDirectory,
    extractZipToDirectory,
    readFileFromZip,
    listFilesInZip,
    validatePrayerSlidesZip,
    createBackup,
    cleanupOldBackups,
    getAvailableBackups
};
