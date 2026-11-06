import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Regresia: AI funkcionalita bola odstránená a do verejného bundlu sa nesmú
 * dostať žiadne tajné kľúče ani volania AI API.
 */
const DIST = join(process.cwd(), 'dist/app/browser');
const FORBIDDEN = [
    { name: 'OpenAI kľúč', re: /sk-[A-Za-z0-9_-]{20,}/ },
    { name: 'Google API kľúč', re: /AIza[0-9A-Za-z_-]{30,}/ },
    { name: 'OpenAI endpoint', re: /api\.openai\.com/ },
    { name: 'Gemini endpoint', re: /generativelanguage\.googleapis\.com/ },
    { name: 'gemini', re: /gemini/i },
];

function walk(dir: string): string[] {
    return readdirSync(dir).flatMap(f => {
        const p = join(dir, f);
        // JS, predgenerované HTML aj konfigurácia service workera (ngsw.json)
        return statSync(p).isDirectory() ? walk(p) : /\.(js|mjs|html|json|webmanifest)$/.test(p) ? [p] : [];
    });
}

test('verejný bundle (JS, HTML, ngsw.json) neobsahuje tajné kľúče ani AI endpointy', () => {
    test.skip(!existsSync(DIST), 'najprv spusti ng build --configuration production');
    const files = walk(DIST);
    expect(files.length).toBeGreaterThan(0);
    const hits: string[] = [];
    for (const f of files) {
        const src = readFileSync(f, 'utf8');
        for (const { name, re } of FORBIDDEN) if (re.test(src)) hits.push(`${name} v ${f.replace(DIST, '')}`);
    }
    expect(hits).toEqual([]);
});

test('environment obsahuje len verejné hodnoty', () => {
    for (const f of ['src/environments/environment.ts', 'src/environments/environment.prod.ts']) {
        if (!existsSync(f)) continue;
        const src = readFileSync(f, 'utf8');
        expect(src, f).not.toMatch(/apiKey|openai|gemini|secret/i);
    }
});
