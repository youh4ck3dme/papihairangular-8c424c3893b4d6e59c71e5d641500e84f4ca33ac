// Vytvorí src/environments/environment*.ts, ak chýbajú (sú v .gitignore).
// Existujúce lokálne súbory nikdy neprepíše.
//
// BEZPEČNOSŤ: environment.ts sa kompiluje do VEREJNÉHO JS bundlu – nikdy sem
// nedávaj tajné kľúče. Z env sa berie len VAPID_PUBLIC_KEY (verejný z princípu).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const dir = 'src/environments';
mkdirSync(dir, { recursive: true });

const body = (production) => `export const environment = {
  production: ${production},
  vapidPublicKey: ${JSON.stringify(process.env.VAPID_PUBLIC_KEY ?? '')},
};
`;

for (const [file, prod] of [['environment.ts', false], ['environment.prod.ts', true]]) {
  const path = `${dir}/${file}`;
  if (existsSync(path)) {
    console.log(`[ensure-env] ${path} existuje – ponechávam`);
  } else {
    writeFileSync(path, body(prod));
    console.log(`[ensure-env] vytvorený ${path}`);
  }
}
