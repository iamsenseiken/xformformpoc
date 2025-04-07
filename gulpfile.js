const gulp = require('gulp');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Task to process .jsx files in src/components for React
gulp.task('transform-jsx-react', (done) => {
  const componentsDir = path.join(__dirname, 'src', 'components');
  
  // Recursively find all .jsx files
  const findJsxFiles = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findJsxFiles(fullPath);
      } else if (file.endsWith('.jsx')) {
        // Execute transform.js on the file for React
        try {
          const result = execSync(`node pipeline/transform/transform.js "${componentsDir}" "${fullPath}" "react"`, { encoding: 'utf8' });
          console.log(`Processed ${fullPath} (React): ${result}`);
        } catch (error) {
          console.error(`Error processing ${fullPath} (React):`, error.message);
        }
      }
    });
  };
  findJsxFiles(componentsDir);
  done();
});

// Task to process .jsx files in src/components for Vue
gulp.task('transform-jsx-vue', (done) => {
  const componentsDir = path.join(__dirname, 'src', 'components');
  
  // Recursively find all .jsx files
  const findJsxFiles = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findJsxFiles(fullPath);
      } else if (file.endsWith('.jsx')) {
        // Execute transform.js on the file for Vue
        try {
          const result = execSync(`node pipeline/transform/transform.js "${componentsDir}" "${fullPath}" "vue2"`, { encoding: 'utf8' });
          console.log(`Processed ${fullPath} (Vue): ${result}`);
        } catch (error) {
          console.error(`Error processing ${fullPath} (Vue):`, error.message);
        }
      }
    });
  };
  findJsxFiles(componentsDir);
  done();
});

// Task to process .jsx files in src/components for Vanilla JS
gulp.task('transform-jsx-vanilla', (done) => {
  const componentsDir = path.join(__dirname, 'src', 'components');
  
  // Recursively find all .jsx files
  const findJsxFiles = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findJsxFiles(fullPath);
      } else if (file.endsWith('.jsx')) {
        // Execute transform.js on the file for Vanilla JS
        try {
          const result = execSync(`node pipeline/transform/transform.js "${componentsDir}" "${fullPath}" "vanilla"`, { encoding: 'utf8' });
          console.log(`Processed ${fullPath} (Vanilla): ${result}`);
        } catch (error) {
          console.error(`Error processing ${fullPath} (Vanilla):`, error.message);
        }
      }
    });
  };
  findJsxFiles(componentsDir);
  done();
});

// Task to copy non-JSX files to both React and Vue destination folders
gulp.task('copy-non-jsx', (done) => {
  const componentsDir = path.join(__dirname, 'src', 'components');
  const reactDestDir = path.join(__dirname, 'transformed', 'react', 'components');
  const vueDestDir = path.join(__dirname, 'transformed', 'vue', 'components');
  const vanillaDestDir = path.join(__dirname, 'transformed', 'vanilla', 'components');
  
  // Recursively find and copy all non-JSX files
  const copyNonJsxFiles = (src, reactDest, vueDest, vanillaDest) => {
    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const srcPath = path.join(src, file);
      const relativePath = path.relative(componentsDir, srcPath);
      
      // Construct the correct destination paths without duplicating directories
      const reactDestPath = path.join(reactDestDir, relativePath);
      const vueDestPath = path.join(vueDestDir, relativePath);
      const vanillaDestPath = path.join(vanillaDestDir, relativePath);
      
      if (fs.statSync(srcPath).isDirectory()) {
        // Create the directories if they don't exist
        if (!fs.existsSync(reactDestPath)) {
          fs.mkdirSync(reactDestPath, { recursive: true });
        }
        if (!fs.existsSync(vueDestPath)) {
          fs.mkdirSync(vueDestPath, { recursive: true });
        }
        if (!fs.existsSync(vanillaDestPath)) {
          fs.mkdirSync(vanillaDestPath, { recursive: true });
        }
        copyNonJsxFiles(srcPath, reactDest, vueDest, vanillaDest);
      } else if (!file.endsWith('.jsx')) {
        // Copy non-JSX files directly to their correct destinations
        const reactDestDir = path.dirname(reactDestPath);
        if (!fs.existsSync(reactDestDir)) {
          fs.mkdirSync(reactDestDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, reactDestPath);
        console.log(`Copied: ${srcPath} -> ${reactDestPath}`);
        
        const vueDestDir = path.dirname(vueDestPath);
        if (!fs.existsSync(vueDestDir)) {
          fs.mkdirSync(vueDestDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, vueDestPath);
        console.log(`Copied: ${srcPath} -> ${vueDestPath}`);
        
        const vanillaDestDir = path.dirname(vanillaDestPath);
        if (!fs.existsSync(vanillaDestDir)) {
          fs.mkdirSync(vanillaDestDir, { recursive: true });
        }
        fs.copyFileSync(srcPath, vanillaDestPath);
        console.log(`Copied: ${srcPath} -> ${vanillaDestPath}`);
      }
    });
  };
  
  copyNonJsxFiles(componentsDir, reactDestDir, vueDestDir, vanillaDestDir);
  done();
});

// Task to transform all JSX files to both React and Vue
gulp.task('transform-all', gulp.series('transform-jsx-react', 'transform-jsx-vue', 'transform-jsx-vanilla', 'copy-non-jsx'));

// Default task
gulp.task('default', gulp.series('transform-all'));