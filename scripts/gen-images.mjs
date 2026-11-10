// Generovanie responzívnych variantov obrázkov (spúšťa sa ručne pri zmene fotky): npm run gen:images
// - hero (LCP na home): AVIF q50 + WebP, šírky 768/1170 z scripts/source/salon-interior.webp
// - blog + lookbook: WebP q75 v šírkach 400/800 vedľa originálu (<meno>-<w>.webp);
//   URL skladá IMAGE_LOADER v src/app/core/images/image-loader.ts
// - screenshoty do manifestu: PNG → WebP
// Nikdy nezväčšuje (withoutEnlargement) a hlási súbory nad limitom (hero 120 kB, ostatné 200 kB).
import sharp from 'sharp';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const kb = (f) => Math.round(statSync(f).size / 1024);
const over = [];
const check = (f, limit) => { if (kb(f) > limit) over.push(`${f} ${kb(f)} kB > ${limit} kB`); };

// 1) Hero
const heroSrc = 'scripts/source/salon-interior.webp';
const heroOut = 'src/assets/hero';
mkdirSync(heroOut, { recursive: true });
for (const w of [768, 1170]) {
  const base = sharp(heroSrc).resize({ width: w, withoutEnlargement: true });
  const avif = `${heroOut}/salon-interior-${w}.avif`;
  const webp = `${heroOut}/salon-interior-${w}.webp`;
  await base.clone().avif({ quality: 50, effort: 6 }).toFile(avif);
  await base.clone().webp({ quality: w > 800 ? 45 : 70, effort: 6 }).toFile(webp);
  check(avif, 120); check(webp, 120);
  console.log(`[hero] ${w}: avif ${kb(avif)} kB, webp ${kb(webp)} kB`);
}

// 2) Blog + lookbook – varianty 400/800 (originál 1024 zostáva ako najväčšia šírka)
export const WIDTHS = [400, 800];
for (const dir of ['src/assets/images/blog', 'src/assets/images/lookbook']) {
  for (const f of readdirSync(dir)) {
    if (!/\.webp$/.test(f) || new RegExp(`-(${WIDTHS.join("|")})\\.webp$`).test(f)) continue;
    const src = join(dir, f);
    const { width } = await sharp(src).metadata();
    for (const w of WIDTHS) {
      const out = join(dir, f.replace(/\.webp$/, `-${w}.webp`));
      if (w >= width) { if (existsSync(out)) unlinkSync(out); continue; }
      await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 75, effort: 6 }).toFile(out);
      check(out, 200);
    }
    check(src, 200);
    console.log(`[img] ${src}: ${WIDTHS.map((w) => `${w}w`).join(', ')} + ${width}w`);
  }
}

// 3) Screenshoty do manifestu
const shots = 'src/assets/screenshots';
for (const f of readdirSync(shots).filter((f) => f.endsWith('.png'))) {
  const out = join(shots, f.replace(/\.png$/, '.webp'));
  await sharp(join(shots, f)).webp({ quality: 75, effort: 6 }).toFile(out);
  const { width, height } = await sharp(out).metadata();
  check(out, 200);
  console.log(`[shot] ${out}: ${width}x${height}, ${kb(out)} kB`);
}

if (over.length) { console.error('Nad limitom:\n' + over.join('\n')); process.exitCode = 1; }
