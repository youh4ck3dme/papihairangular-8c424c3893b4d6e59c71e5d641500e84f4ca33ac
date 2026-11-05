// Vytvorí src/environments/environment*.ts, ak chýbajú (sú v .gitignore).
// Hodnoty berie z premenných prostredia (Vercel → Settings → Environment Variables).
// Existujúce lokálne súbory nikdy neprepíše.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const dir = 'src/environments';
mkdirSync(dir, { recursive: true });

const body = (production) => `export const environment = {
  production: ${production},
  geminiApiKey: ${JSON.stringify(process.env.GEMINI_API_KEY ?? '')},
  openaiApiKey: ${JSON.stringify(process.env.OPENAI_API_KEY ?? '')},
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
