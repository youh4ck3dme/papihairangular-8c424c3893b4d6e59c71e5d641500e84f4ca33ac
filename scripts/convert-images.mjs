
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');

async function findImages(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.resolve(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(await findImages(filePath));
        } else {
            if (/\.(jpg|jpeg|png)$/i.test(file)) {
                results.push(filePath);
            }
        }
    }
    return results;
}

async function convertImages() {
    try {
        const images = await findImages(ASSETS_DIR);
        console.log(`Found ${images.length} images to convert.`);

        for (const imagePath of images) {
            const ext = path.extname(imagePath);
            const newPath = imagePath.replace(ext, '.webp');

            const originalSize = fs.statSync(imagePath).size;

            console.log(`Converting: ${path.relative(process.cwd(), imagePath)}`);

            await sharp(imagePath)
                .webp({ quality: 50, effort: 6 }) // Aggressive compression for 8x goal
                .toFile(newPath);

            const newSize = fs.statSync(newPath).size;
            const reduction = (originalSize / newSize).toFixed(1);

            console.log(`  -> ${path.relative(process.cwd(), newPath)}`);
            console.log(`  Size: ${(originalSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB (${reduction}x smaller)`);
        }
        console.log("Conversion complete!");
    } catch (error) {
        console.error("Error converting images:", error);
    }
}

convertImages();
