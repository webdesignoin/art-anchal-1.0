const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'src/assets/images/artisans');

async function processImages() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.png')) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, file.replace('.png', '.webp'));
      console.log(`Converting ${file}...`);
      await sharp(inputPath)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      // Delete original png
      fs.unlinkSync(inputPath);
    }
  }
  console.log("Done!");
}

processImages().catch(console.error);
