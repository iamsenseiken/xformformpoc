#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Load transformation config
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Initialize OpenAI client with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to transform JSX to target framework using OpenAI
async function transformJsx(filePath, destPath, transformType) {
  try {
    // Get transformation config
    const transformConfig = config.transformations[transformType];
    if (!transformConfig) {
      throw new Error(`Unknown transformation type: ${transformType}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    let transformedCode;
    
    try {
      // Replace {{fileContent}} placeholder in the prompt with actual content
      const prompt = transformConfig.prompt.replace('{{fileContent}}', fileContent);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      transformedCode = response.choices[0].message.content;
    } catch (apiError) {
      console.error(`API Error for ${filePath}:`, apiError.message || apiError);
      throw apiError;
    }
    
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, transformedCode);
    console.log(`Transformed (${transformType}): ${filePath} -> ${destPath}`);
  } catch (error) {
    console.error(`Error transforming ${filePath}:`, error);
  }
}

// Function to process files recursively
function processFiles(srcDir, transformType) {
  const transformConfig = config.transformations[transformType];
  if (!transformConfig) {
    console.error(`Unknown transformation type: ${transformType}`);
    process.exit(1);
  }

  const destDir = path.join(process.cwd(), transformConfig.outputFolder);

  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory does not exist: ${srcDir}`);
    process.exit(1);
  }

  const processDir = (src, dest) => {
    fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(
        dest, 
        entry.name.replace(/\.jsx$/, `.${transformConfig.destinationExtension}`)
      );
      
      if (entry.isDirectory()) {
        processDir(srcPath, destPath);
      } else if (entry.name.endsWith('.jsx')) {
        transformJsx(srcPath, destPath, transformType);
      }
    });
  };

  processDir(srcDir, destDir);
}

// Function to process a single file
async function processSingleFile(filePath, srcBasePath, transformType) {
  const transformConfig = config.transformations[transformType];
  if (!transformConfig) {
    console.error(`Unknown transformation type: ${transformType}`);
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File does not exist: ${filePath}`);
    process.exit(1);
  }
  
  if (!filePath.endsWith('.jsx')) {
    console.error(`File is not a JSX file: ${filePath}`);
    process.exit(1);
  }
  
  // Determine the relative path from srcBasePath to the file
  const relativePath = path.relative(srcBasePath, filePath);
  
  // Create the destination path
  const destDir = path.join(process.cwd(), transformConfig.outputFolder);
  const destPath = path.join(
    destDir, 
    relativePath.replace(/\.jsx$/, `.${transformConfig.destinationExtension}`)
  );
  
  await transformJsx(filePath, destPath, transformType);
}

// Main execution
if (process.argv.length < 4) {
  console.error('Usage: node transform.js <src-base-path> <jsx-file-path> <transform-type>');
  console.error('   or: node transform.js <src-base-path> <transform-type>');
  process.exit(1);
}

const srcBasePath = process.argv[2];

// Check if we're processing a single file or a directory
if (process.argv.length > 4) {
  // Process single file: node transform.js <src-base-path> <jsx-file-path> <transform-type>
  const jsxFilePath = process.argv[3];
  const transformType = process.argv[4];
  processSingleFile(jsxFilePath, srcBasePath, transformType);
} else {
  // Process all files: node transform.js <src-base-path> <transform-type>
  const transformType = process.argv[3];
  processFiles(srcBasePath, transformType);
}
