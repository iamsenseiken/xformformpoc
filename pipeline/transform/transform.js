#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Load transformation config
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Initialize OpenAI client with API key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to transform source files to target framework
async function transformFile(filePath, destPath, transformType) {
  try {
    // Get transformation config
    const transformConfig = config.transformations[transformType];
    if (!transformConfig) {
      console.error(`Unknown transformation type: ${transformType} for file: ${filePath}. Skipping this file.`);
      return; // Skip this file but don't throw error to allow processing to continue
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    let intermediateCode;
    
    // Check if transformation is enabled
    if (transformConfig.transform) {
      try {
        // Replace {{fileContent}} placeholder in the prompt with actual content
        const prompt = transformConfig.prompt.replace('{{fileContent}}', fileContent);
        
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
        });

        intermediateCode = response.choices[0].message.content;
      } catch (apiError) {
        console.error(`API Error for ${filePath}:`, apiError.message || apiError);
        throw apiError;
      }
    } else {
      // If transform is false, pass the code through as-is
      intermediateCode = fileContent;
    }
    
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, intermediateCode);
    console.log(`[${transformType}] Translated: ${filePath} -> ${destPath}`);
  } catch (error) {
    console.error(`Error transforming ${filePath}:`, error);
  }
}

// Function to copy a file verbatim
function copyFile(srcPath, destPath, transformType) {
  try {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`[${transformType}] Copied: ${srcPath} -> ${destPath}`);
  } catch (error) {
    console.error(`Error copying ${srcPath}:`, error);
  }
}

// Function to process folders recursively
function processFolder(basePath, srcPath, outPath, transformType) {
  const transformConfig = config.transformations[transformType];
  if (!transformConfig) {
    console.error(`Unknown transformation type: ${transformType}. Skipping this transformation.`);
    return; // Return without processing but don't terminate the program
  }

  const fullSrcPath = path.join(basePath, srcPath);
  const fullOutPath = path.join(outPath, transformConfig.outFolder, srcPath);

  if (!fs.existsSync(fullSrcPath)) {
    console.error(`Source directory does not exist: ${fullSrcPath}`);
    return; // Return without processing but don't terminate the program
  }

  // Check if it's a directory
  if (!fs.statSync(fullSrcPath).isDirectory()) {
    console.error(`Source path is not a directory: ${fullSrcPath}`);
    return; // Return without processing but don't terminate the program
  }

  const processDir = (src, dest) => {
    fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
      const srcEntryPath = path.join(src, entry.name);
      
      if (entry.isDirectory()) {
        const destDirPath = path.join(dest, entry.name);
        processDir(srcEntryPath, destDirPath);
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
        // Process both TSX and JSX files
        const destEntryPath = path.join(
          dest, 
          entry.name.replace(/\.(tsx|jsx)$/, `.${transformConfig.destinationExtension}`)
        );
        transformFile(srcEntryPath, destEntryPath, transformType);
      } else {
        // Copy all other files verbatim
        const destFilePath = path.join(dest, entry.name);
        copyFile(srcEntryPath, destFilePath, transformType);
      }
    });
  };

  processDir(fullSrcPath, fullOutPath);
}

// Parse command line arguments using yargs
const args = yargs(hideBin(process.argv))
  .usage('Usage: $0 --base <base-folder> --src <folder-to-process> --out <output-folder> --target <transform-type>')
  .option('base', {
    describe: 'The base folder to work from (e.g., "src/components")',
    type: 'string',
    demandOption: true
  })
  .option('src', {
    describe: 'The folder to process, relative to the base (e.g., "atoms/button")',
    type: 'string',
    demandOption: true
  })
  .option('out', {
    describe: 'The path to the output folder (e.g., "intermediate")',
    type: 'string',
    demandOption: true
  })
  .option('target', {
    describe: 'The type of transformation to apply (e.g., "react", "vue", "vanilla")',
    type: 'string',
    demandOption: true
  })
  .help()
  .alias('help', 'h')
  .argv;

// Main execution
const fullSrcPath = path.join(args.base, args.src);

try {
  processFolder(args.base, args.src, args.out, args.target);
} catch (error) {
  console.error(`Error processing directory ${fullSrcPath}: ${error.message}`);
  process.exit(1);
}
