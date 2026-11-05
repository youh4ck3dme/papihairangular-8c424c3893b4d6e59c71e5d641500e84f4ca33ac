// Vygeneruje public/images/og-default.jpg (1200×630) – obrázok pre zdieľanie na sociálnych sieťach.
// Spúšťa sa ručne pri zmene loga/fotky: node scripts/gen-og.mjs
import sharp from 'sharp';

const W = 1200, H = 630;
const bg = await sharp('src/assets/salon-interior.webp').resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
const logo = await sharp('public/images/logo-white.png').resize({ width: 560 }).toBuffer();
const { height: lh } = await sharp(logo).metadata();

const overlay = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity=".85"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="${H / 2 + lh / 2 + 70}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif"
    font-size="34" font-weight="700" letter-spacing="6" fill="#d4af37">KADERNÍCTVO &amp; BARBER · KOŠICE</text>
</svg>`);

await sharp(bg)
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: Math.round(H / 2 - lh / 2 - 30), left: Math.round((W - 560) / 2) },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/images/og-default.jpg');
console.log('[og] public/images/og-default.jpg');
