
import sharp from 'sharp';
import fs from 'fs';

async function transform() {
    await sharp('public/images/logo.png')
        .webp({ quality: 90 })
        .toFile('src/assets/logo-black.webp');
    console.log('Converted public/images/logo.png to src/assets/logo-black.webp');
}

transform();
