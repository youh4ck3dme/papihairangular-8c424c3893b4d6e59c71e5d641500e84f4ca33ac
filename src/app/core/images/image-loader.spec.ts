import { papiImageLoader } from './image-loader';

describe('papiImageLoader', () => {
  it('vyberie najbližší variant pre blog/lookbook', () => {
    expect(papiImageLoader({ src: 'assets/images/blog/a.webp', width: 300 })).toBe('/assets/images/blog/a-400.webp');
    expect(papiImageLoader({ src: '/assets/images/lookbook/b.webp', width: 800 })).toBe('/assets/images/lookbook/b-800.webp');
    expect(papiImageLoader({ src: 'assets/images/blog/a.webp', width: 1024 })).toBe('/assets/images/blog/a.webp');
  });
  it('ostatné cesty nemení', () => {
    expect(papiImageLoader({ src: '/images/papi.webp', width: 400 })).toBe('/images/papi.webp');
    expect(papiImageLoader({ src: 'assets/images/blog/a.webp' })).toBe('/assets/images/blog/a.webp');
  });
});
