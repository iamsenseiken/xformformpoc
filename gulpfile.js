const { series, parallel, src, dest } = require('gulp');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const minimist = require('minimist');

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
  string: ['base', 'out', 'target'],
  default: {
    base: 'src/components',
    out: 'intermediate',
    target: 'react,vue,vanilla'
  }
});

// Function to find all folders containing TSX/JSX files recursively
function findReactFolders(basePath) {
  const results = [];
  
  function scanDir(dir, relPath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    // Check if this directory contains any TSX or JSX files
    const hasReactFiles = entries.some(entry => 
      !entry.isDirectory() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))
    );
    
    if (hasReactFiles) {
      results.push(relPath);
    }
    
    // Process subdirectories
    entries.forEach(entry => {
      if (entry.isDirectory()) {
        scanDir(path.join(dir, entry.name), path.join(relPath, entry.name));
      }
    });
  }
  
  scanDir(basePath);
  return results;
}

// Function to execute transform.js for a specific folder and target
function transformFolder(baseFolder, srcFolder, outFolder, target) {
  return new Promise((resolve, reject) => {
    const transformScript = path.join(__dirname, 'pipeline/transform/transform.js');
    
    console.log(`Transforming ${srcFolder} to ${target}...`);
    
    const process = spawn('node', [
      transformScript,
      '--base', baseFolder,
      '--src', srcFolder,
      '--out', outFolder,
      '--target', target
    ]);
    
    process.stdout.on('data', (data) => {
      console.log(`[${target}] ${data.toString().trim()}`);
    });
    
    process.stderr.on('data', (data) => {
      console.error(`[${target}] Error: ${data.toString().trim()}`);
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`transform.js exited with code ${code} for ${srcFolder} (${target})`));
      }
    });
  });
}

// Main task
function transform(cb) {
  const baseFolder = argv.base;
  const outFolder = argv.out;
  const targets = argv.target.split(',');
  
  // Check if base folder exists
  if (!fs.existsSync(baseFolder)) {
    console.error(`Base folder does not exist: ${baseFolder}`);
    return cb(new Error(`Base folder does not exist: ${baseFolder}`));
  }
  
  // Find all folders containing TSX/JSX files
  const reactFolders = findReactFolders(baseFolder);
  
  if (reactFolders.length === 0) {
    console.log(`No TSX or JSX files found in ${baseFolder}`);
    return cb();
  }
  
  console.log(`Found ${reactFolders.length} folder(s) with TSX/JSX files`);
  
  // Create array of promises for all transformations
  const transformations = [];
  
  reactFolders.forEach(folder => {
    targets.forEach(target => {
      transformations.push(transformFolder(baseFolder, folder, outFolder, target));
    });
  });
  
  // Execute all transformations
  Promise.all(transformations)
    .then(() => {
      console.log('All transformations completed successfully');
      cb();
    })
    .catch(err => {
      console.error('Error during transformation:', err);
      cb(err);
    });
}

// Export the tasks
exports.default = transform;