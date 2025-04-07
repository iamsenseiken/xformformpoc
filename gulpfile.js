const gulp = require('gulp');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Task to process .jsx files in src/components
gulp.task('transform-jsx', (done) => {
  const componentsDir = path.join(__dirname, 'src', 'components');

  // Recursively find all .jsx files
  const findJsxFiles = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        findJsxFiles(fullPath);
      } else if (file.endsWith('.jsx')) {
        // Execute transform.js on the file
        exec(`node pipeline/transform/transform.js ${fullPath}`, (err, stdout, stderr) => {
          if (err) {
            console.error(`Error processing ${fullPath}:`, stderr);
          } else {
            console.log(`Processed ${fullPath}:`, stdout);
          }
        });
      }
    });
  };

  findJsxFiles(componentsDir);
  done();
});

// Default task
gulp.task('default', gulp.series('transform-jsx'));