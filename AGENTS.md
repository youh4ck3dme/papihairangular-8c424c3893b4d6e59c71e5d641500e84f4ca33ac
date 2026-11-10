# Pravidlá pre AI agentov a automatizáciu (Claude, Codex, Copilot, v0, …)

## ⛔ ZÁKAZ PRODUKČNÉHO DEPLOYU BEZ SÚHLASU MAJITEĽA

Ostrá doména **papihairdesign.sk** (a www.papihairdesign.sk) sa **nikdy** nesmie prepnúť na inú verziu
bez výslovného súhlasu majiteľa (Erik) v danej konverzácii. Platí to bez výnimky:

- žiadny `vercel --prod`, `vercel promote`, `vercel alias`, žiadny deploy s `target: production`;
- žiadna zmena domén, aliasov, DNS ani nastavení projektu na Verceli či v Cloudflare;
- žiadny merge do `main` (vetva `main` je produkcia) a žiadny push do `main`;
- žiadne spúšťanie `scripts/deploy-*.sh`, `full-deploy.sh` ani iného nasadenia na VPS (FORPSI);
- preview deploy (vlastná `*.vercel.app` URL) len keď o to majiteľ požiada.

Ak úloha vyzerá, že vyžaduje produkčný deploy: **zastav sa a opýtaj sa.** Pripravená práca končí commitom
a pushom do pracovnej vetvy + odkazom na PR.

Poistka: `vercel.json` má `git.deploymentEnabled.main = false`, takže ani merge do `main` sám nič nenasadí.

## Ďalšie trvalé pravidlá
- Žiadna AI funkcionalita na webe (bola úplne odstránená, nevracať).
- Žiadne tajné kľúče v `src/environments/*` ani v bundli – len verejné hodnoty (pozri `scripts/ensure-env.mjs`).
- Vzhľad sa nemení bez požiadavky; testy (`pnpm run test:site`, `pnpm run test:unit`, ESLint) musia zostať zelené.
- Komentáre v kóde po slovensky.
