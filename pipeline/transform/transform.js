#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Simple transformation script placeholder
 * Usage: node transform.js <filename>
 */

// Define source and destination directories
const srcDir = path.join(__dirname, '../../src/components');
const destDir = path.join(__dirname, '../../transformed/components');

// Function to copy files while preserving folder structure
function copyFiles(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    process.exit(1);
  }

  fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFiles(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  });
}

// Execute the copy operation
copyFiles(srcDir, destDir);
