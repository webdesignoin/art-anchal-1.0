const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = 'src/assets/images/collections';

const files = [
  { in: 'loom_collection.png', out: 'local_loom.webp' },
  { in: 'missilinious_collection.png', out: 'mix_collection.webp' }
];

async function process() {
  for (const file of files) {
    const inputPath = path.join(dir, file.in);
    const outputPath = path.join(dir, file.out);
    
    if (fs.existsSync(inputPath)) {
      console.log(`Processing ${file.in}...`);
      await sharp(inputPath)
        .resize({ width: 800, height: 1067, fit: 'cover' }) // 3:4 aspect ratio
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Saved as ${file.out}`);
      
      // Remove original png to save space
      fs.unlinkSync(inputPath);
    } else {
      console.log(`File ${file.in} not found.`);
    }
  }
}

process().catch(console.error);
