#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Simple Prayer Slides Electron Build...\n');

// Step 1: Clean previous builds
console.log('1. Cleaning previous builds...');
try {
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  console.log('✅ Cleaned previous builds\n');
} catch (error) {
  console.log('⚠️  Warning: Could not clean all previous builds\n');
}

// Step 2: Build Next.js application
console.log('2. Building Next.js application...');
try {
  execSync('npm run build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Next.js build completed\n');
} catch (error) {
  console.error('❌ Next.js build failed');
  process.exit(1);
}

// Step 3: Export static files
console.log('3. Exporting static files...');
try {
  execSync('npm run export', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Static export completed\n');
} catch (error) {
  console.error('❌ Static export failed');
  process.exit(1);
}

// Step 4: Verify out directory exists
console.log('4. Verifying static export...');
if (!fs.existsSync('out') || !fs.existsSync('out/index.html')) {
  console.error('❌ Static export failed - out/index.html not found');
  process.exit(1);
}
console.log('✅ Static export verified\n');

// Step 5: Fix paths for Electron
console.log('5. Fixing paths for Electron...');
try {
  execSync('node scripts/fix-paths.js', { stdio: 'inherit' });
  console.log('✅ Paths fixed for Electron\n');
} catch (error) {
  console.error('❌ Path fixing failed');
  process.exit(1);
}

console.log('🎉 Build completed successfully!');
console.log('\nTo run the Electron app:');
console.log('  npm run electron');
console.log('\nTo create a distributable package:');
console.log('  npx electron-builder --dir');
console.log('\n✨ Ready to run!');
