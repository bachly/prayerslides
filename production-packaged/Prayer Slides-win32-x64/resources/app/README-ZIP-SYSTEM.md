# Prayer Slides Zip-Based Distribution System

This document explains the new zip-based system for distributing Prayer Slides data to churches.

## Overview

The Prayer Slides app now uses a zip-based system for data management and distribution. This provides several benefits:

- **Easy Updates**: Churches can import new data by simply importing a zip file
- **Version Management**: Automatic backup of the last 3 versions with restore capability
- **Consistent Distribution**: Single zip file contains all necessary data and images
- **Offline Operation**: No need for internet connectivity to update data

## How It Works

### For Churches (End Users)

1. **Initial Setup**: The app comes with initial data pre-loaded
2. **Importing Updates**: Use the Import button to load new data from zip files
3. **Exporting Data**: Use the Export button to backup current data
4. **Version Management**: Access previous versions through the Backups button

### For Administrators (Data Distributors)

1. **Create Distribution**: Use `npm run create-distribution` to create zip files
2. **Distribute**: Send the zip file to churches
3. **Churches Import**: Churches use the Import button to load the new data

## User Interface

### Import/Export Controls

Located in the top-right corner of the app:

- **Import Button** (Blue): Import new data from a zip file
- **Export Button** (Green): Export current data to a zip file
- **Backups Button** (Purple): View and restore from previous versions

### Import Process

1. Click the **Import** button
2. Select a valid Prayer Slides zip file
3. The app validates the zip file structure
4. Current data is automatically backed up
5. New data is imported and ready to use
6. Restart the app to see changes

### Export Process

1. Click the **Export** button
2. Choose where to save the zip file
3. The app creates a complete backup of current data
4. The zip file can be shared or used as a backup

### Version Management

1. Click the **Backups** button
2. View list of available backups (last 3 versions)
3. Click **Restore** on any backup to revert to that version
4. Current data is backed up before restoring

## Technical Details

### Zip File Structure

A valid Prayer Slides zip file must contain:

```
├── files/
│   └── couples.json          # Couples data
├── img/
│   ├── flags/               # Country flag images
│   │   ├── Australia.png
│   │   ├── China.png
│   │   └── ...
│   ├── CoupleImage1.png     # Couple background images
│   ├── CoupleImage2.png
│   └── ...
├── icon.png                 # App icon
└── icon.svg                 # App icon (SVG)
```

### Data Storage Locations

- **User Data**: `%APPDATA%/prayer-slides/prayer-slides-data.zip` (Windows)
- **Backups**: `%APPDATA%/prayer-slides/backups/` (Windows)
- **Temp Files**: `%APPDATA%/prayer-slides/temp/` (Windows)

### Backup Management

- Automatic backup creation when importing new data
- Maximum of 3 backups kept (oldest automatically deleted)
- Backups named with timestamp: `prayer-slides-backup-YYYY-MM-DDTHH-MM-SS.zip`

## Development Commands

### Create Distribution Zip

```bash
npm run create-distribution
```

Creates `prayer-slides-update-sample.zip` for distribution to churches.

### Build App with Zip System

```bash
npm run build-simple
npm run electron
```

Builds and runs the app with the new zip-based system.

## Migration from Old System

The app automatically handles migration:

1. **First Run**: If no zip data exists, creates initial zip from bundled data
2. **Fallback**: If zip loading fails, falls back to original file loading
3. **Seamless**: Users don't need to do anything special

## Error Handling

### Invalid Zip Files

- App validates zip structure before importing
- Shows clear error messages for missing required files
- No data is lost if import fails

### Backup Failures

- Import continues even if backup creation fails
- User is notified of backup status
- Manual export can be used as backup alternative

### Restore Failures

- Current data is backed up before restore attempt
- Clear error messages if restore fails
- No data loss during failed restore operations

## Best Practices

### For Administrators

1. **Test First**: Always test zip files before distribution
2. **Version Control**: Keep track of distributed versions
3. **Documentation**: Include release notes with distributions
4. **Validation**: Use the app to validate zip files before sending

### For Churches

1. **Regular Backups**: Use Export button to create regular backups
2. **Test Imports**: Test new imports on a backup copy first
3. **Keep Previous**: Don't delete zip files until confirmed working
4. **Report Issues**: Contact support if import/export fails

## Troubleshooting

### Import Not Working

1. Check zip file structure matches requirements
2. Ensure all required files are present
3. Try exporting current data first to see working format
4. Check app console for detailed error messages

### Export Not Working

1. Check disk space availability
2. Ensure write permissions to selected location
3. Try different export location
4. Restart app and try again

### Backups Not Showing

1. Check if any imports have been performed
2. Backups are only created during import operations
3. Use Export to create manual backups
4. Check user data directory for backup files

## File Locations by Platform

### Windows
- User Data: `%APPDATA%\prayer-slides\`
- Backups: `%APPDATA%\prayer-slides\backups\`

### macOS
- User Data: `~/Library/Application Support/prayer-slides/`
- Backups: `~/Library/Application Support/prayer-slides/backups/`

### Linux
- User Data: `~/.config/prayer-slides/`
- Backups: `~/.config/prayer-slides/backups/`

## Support

For technical support or questions about the zip system:

1. Check this documentation first
2. Look for error messages in the app
3. Try the troubleshooting steps above
4. Contact the development team with specific error details
