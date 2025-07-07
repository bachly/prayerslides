#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing paths for Electron...');

function fixPathsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/href="\/_next\//g, 'href="./_next/');
  content = content.replace(/src="\/_next\//g, 'src="./_next/');
  content = content.replace(/href="\/files\//g, 'href="./files/');
  content = content.replace(/src="\/files\//g, 'src="./files/');
  content = content.replace(/href="\/img\//g, 'href="./img/');
  content = content.replace(/src="\/img\//g, 'src="./img/');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed paths in ${filePath}`);
}

function fixPathsInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixPathsInDirectory(fullPath);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
      fixPathsInFile(fullPath);
    }
  });
}

// Fix paths in the out directory
const outDir = path.join(process.cwd(), 'out');
fixPathsInDirectory(outDir);

console.log('🎉 Path fixing completed!');
