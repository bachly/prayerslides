# Prayer Slides - Electron Desktop App

This is the desktop version of the Prayer Slides generator, converted from a Next.js web application to an Electron desktop application.

## Features

- **Desktop Application**: Runs as a native desktop app on Windows, macOS, and Linux
- **Offline Capable**: Works without internet connection once installed
- **Enhanced Security**: Sandboxed environment with secure preload scripts
- **Native Menus**: Platform-specific application menus
- **Auto-updater Ready**: Infrastructure for future auto-update functionality

## Development Setup

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd c:\PrayerSlides\prayerslides
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Development Commands

- **Start development mode** (runs Next.js + Electron):
  ```bash
  npm run electron-dev
  ```

- **Run web version only**:
  ```bash
  npm run dev
  ```

- **Run Electron only** (requires web server running):
  ```bash
  npm run electron
  ```

## Building for Production

### Build Static Files

```bash
npm run build
```

### Create Desktop Installers

- **Build for current platform**:
  ```bash
  npm run dist
  ```

- **Build for all platforms** (requires additional setup):
  ```bash
  npm run build-electron
  ```

### Output Files

Built applications will be in the `dist/` directory:
- **Windows**: `.exe` installer and portable app
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` portable application

## Project Structure

```
├── electron/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script for security
├── pages/               # Next.js pages
├── components/          # React components
├── public/              # Static assets
├── out/                 # Built static files (production)
├── dist/                # Built Electron apps
└── package.json         # Dependencies and scripts
```

## Key Differences from Web Version

### Enhanced Features
- **Native file dialogs** for saving slides
- **System notifications** for download completion
- **Keyboard shortcuts** for common actions
- **Window state persistence** (size, position)
- **System tray integration** (optional)

### Security Improvements
- **Context isolation** enabled
- **Node integration** disabled in renderer
- **Secure preload scripts** for controlled API access
- **External link protection** (opens in default browser)

## Configuration

### Electron Builder Settings

The build configuration is in `package.json` under the `build` section:

```json
{
  "build": {
    "appId": "com.pottershouse.prayerslides",
    "productName": "Prayer Slides",
    "directories": {
      "output": "dist"
    },
    "files": [
      "out/**/*",
      "electron/**/*",
      "node_modules/**/*",
      "package.json"
    ]
  }
}
```

### Window Configuration

Main window settings in `electron/main.js`:
- **Size**: 1400x1000 (minimum 1200x800)
- **Security**: Context isolation enabled
- **DevTools**: Available in development mode

## Troubleshooting

### Common Issues

1. **Canvas rendering issues**: The app works without the native canvas dependency
2. **File paths**: Uses relative paths for static assets in production
3. **Hot reload**: Changes to Electron files require restart

### Development Tips

- Use `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac) to open DevTools
- Check the console for any renderer process errors
- Main process errors appear in the terminal

## Future Enhancements

### Planned Features
- **Auto-updater** for seamless updates
- **System tray** for quick access
- **Keyboard shortcuts** for slide navigation
- **Export presets** for different formats
- **Backup/restore** of couple data
- **Print functionality** for physical slides

### Technical Improvements
- **Code signing** for trusted installation
- **Crash reporting** for better debugging
- **Performance monitoring** for optimization
- **Accessibility** improvements for screen readers

## Contributing

When making changes:
1. Test both web and Electron versions
2. Ensure security best practices are followed
3. Update this README if adding new features
4. Test builds on target platforms before release

## License

Same as the original Prayer Slides project - UNLICENSED for The Potter's House use.
