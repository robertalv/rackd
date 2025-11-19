#!/usr/bin/env node

/**
 * Converts icon.png to Apple App Store requirements:
 * - 1024x1024 pixels
 * - PNG format
 * - No transparency (fills with black background)
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available (install with: npm install sharp --save-dev)
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp package is required. Install it with:');
  console.error('  cd apps/native && pnpm add -D sharp');
  process.exit(1);
}

const iconPath = path.join(__dirname, '../assets/images/icon.png');
const outputPath = path.join(__dirname, '../assets/images/icon-1024.png');

async function convertIcon() {
  try {
    console.log('Converting icon to Apple App Store requirements...');
    
    // Read the original icon
    const image = sharp(iconPath);
    const metadata = await image.metadata();
    
    console.log(`Original size: ${metadata.width}x${metadata.height}`);
    console.log(`Original format: ${metadata.format}`);
    
    // Resize to 1024x1024 and remove transparency by compositing on black background
    await image
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0 } // Black background
      })
      .flatten({ background: { r: 0, g: 0, b: 0 } }) // Remove alpha channel
      .png()
      .toFile(outputPath);
    
    const outputMetadata = await sharp(outputPath).metadata();
    console.log(`\n✅ Created: ${outputPath}`);
    console.log(`   Size: ${outputMetadata.width}x${outputMetadata.height}`);
    console.log(`   Format: ${outputMetadata.format}`);
    console.log(`   Has alpha: ${outputMetadata.hasAlpha}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Review icon-1024.png');
    console.log('   2. If it looks good, replace icon.png with icon-1024.png');
    console.log('   3. Or update app.json to point to icon-1024.png');
    
  } catch (error) {
    console.error('Error converting icon:', error.message);
    process.exit(1);
  }
}

convertIcon();


