
import sharp from 'sharp';

async function transform() {
    await sharp('src/apple-touch-icon.png')
        .webp({ quality: 90 })
        .toFile('src/assets/logo-icon.webp');
    console.log('Converted src/apple-touch-icon.png to src/assets/logo-icon.webp');
}

transform();
