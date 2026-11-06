// Responzívne varianty LCP obrázka na home: src/assets/hero/salon-interior-{768,1170}.{avif,webp}
// Spustenie ručne pri zmene fotky: node scripts/gen-hero.mjs
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';

const src = 'src/assets/salon-interior.webp';
const outDir = 'src/assets/hero';
mkdirSync(outDir, { recursive: true });
const { width: srcW } = await sharp(src).metadata();

for (const w of [768, 1170]) {
  const width = Math.min(w, srcW);
  const base = sharp(src).resize({ width, withoutEnlargement: true });
  await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${outDir}/salon-interior-${w}.avif`);
  await base.clone().webp({ quality: 72 }).toFile(`${outDir}/salon-interior-${w}.webp`);
  const kb = f => Math.round(statSync(f).size / 1024);
  console.log(`[hero] ${w}: avif ${kb(`${outDir}/salon-interior-${w}.avif`)} kB, webp ${kb(`${outDir}/salon-interior-${w}.webp`)} kB`);
}
