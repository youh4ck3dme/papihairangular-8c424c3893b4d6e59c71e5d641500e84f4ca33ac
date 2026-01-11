
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.resolve(__dirname, '../src/assets');

async function cleanImages(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.resolve(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            await cleanImages(filePath);
        } else {
            if (/\.(jpg|jpeg|png)$/i.test(file)) {
                // Check if webp version exists
                const ext = path.extname(file);
                const webpPath = filePath.replace(ext, '.webp');
                if (fs.existsSync(webpPath)) {
                    console.log(`Deleting redundant file: ${path.relative(process.cwd(), filePath)}`);
                    fs.unlinkSync(filePath);
                }
            }
        }
    }
}

console.log("Cleaning up redundant JPG/PNG images...");
cleanImages(ASSETS_DIR);
console.log("Cleanup complete.");
