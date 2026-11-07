import { Provider } from '@angular/core';
import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

/** Šírky generované skriptom scripts/gen-images.mjs (<meno>-<w>.webp); originál má 1024 px. */
const VARIANT_WIDTHS = [400, 800];
const VARIANT_RE = /^\/?(assets\/images\/(?:blog|lookbook)\/[\w-]+)\.webp$/;

/**
 * Loader pre NgOptimizedImage: pre obrázky blogu a lookbooku vráti najbližší menší variant,
 * ostatné cesty nechá bez zmeny. Výsledok je srcset 400w/800w/1024w – mobil stiahne 400 px namiesto 1024 px.
 */
export function papiImageLoader({ src, width }: ImageLoaderConfig): string {
  const abs = src.startsWith('/') ? src : `/${src}`;
  const m = VARIANT_RE.exec(src);
  if (!m || !width) return abs;
  const w = VARIANT_WIDTHS.find((v) => width <= v);
  return w ? `/${m[1]}-${w}.webp` : abs;
}

export const IMAGE_PROVIDERS: Provider[] = [
  { provide: IMAGE_LOADER, useValue: papiImageLoader },
  // len šírky, ktoré reálne existujú – žiadne duplicitné položky v srcset
  { provide: IMAGE_CONFIG, useValue: { breakpoints: [...VARIANT_WIDTHS, 1024], disableImageSizeWarning: true } },
];
