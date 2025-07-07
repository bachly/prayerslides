#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Prayer Slides Electron App...\n');

// Step 1: Clean previous builds
console.log('1. Cleaning previous builds...');
try {
  if (fs.existsSync('out')) {
    fs.rmSync('out', { recursive: true, force: true });
  }
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  console.log('✅ Cleaned previous builds\n');
} catch (error) {
  console.log('⚠️  Warning: Could not clean all previous builds\n');
}

// Step 2: Build Next.js static export
console.log('2. Building Next.js static export...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed\n');
} catch (error) {
  console.error('❌ Next.js build failed');
  process.exit(1);
}

// Step 3: Verify out directory exists
console.log('3. Verifying static export...');
if (!fs.existsSync('out') || !fs.existsSync('out/index.html')) {
  console.error('❌ Static export failed - out/index.html not found');
  process.exit(1);
}
console.log('✅ Static export verified\n');

// Step 4: Build Electron app
console.log('4. Building Electron application...');
try {
  execSync('npx electron-builder', { stdio: 'inherit' });
  console.log('✅ Electron build completed\n');
} catch (error) {
  console.error('❌ Electron build failed');
  process.exit(1);
}

// Step 5: Show results
console.log('🎉 Build completed successfully!');
console.log('\nBuilt files are in the dist/ directory:');
try {
  const distFiles = fs.readdirSync('dist');
  distFiles.forEach(file => {
    const filePath = path.join('dist', file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  📦 ${file} (${size} MB)`);
  });
} catch (error) {
  console.log('  📁 Check the dist/ directory for built files');
}

console.log('\n✨ Ready to distribute!');
