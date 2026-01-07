# 🔒 ZAMKNUTÉ VERZIE - NEMEŇ BEZ ROZMYSLU

**Posledná aktualizácia:** 2026-01-07
**Stabilná verzia projektu:** 2.0.0

---

## ⚠️ VAROVANIE

Tento projekt má **zamknuté verzie balíkov**. 
**NEROB `pnpm update` ani `pnpm upgrade`** bez dôkladného testovania!

---

## Aktuálne verzie

| Technológia | Verzia | Poznámka |
|-------------|--------|----------|
| **Node.js** | 20.x LTS | Použiť túto verziu! |
| **Angular** | 20.3.15 | Stabilná, otestovaná |
| **TypeScript** | 5.8.3 | Kompatibilná s Angular 20 |
| **Tailwind CSS** | 3.4.19 | ⚠️ v4 má breaking changes |
| **RxJS** | 7.8.2 | Stabilná |

---

## 🚫 NEAKTUALIZUJ na

- **Angular 21+** - Major zmeny, vyžaduje migráciu
- **Tailwind 4+** - Kompletne nová konfigurácia
- **TypeScript 5.9+** - Overiť kompatibilitu

---

## Ako bezpečne aktualizovať

1. Vytvor novú vetvu: `git checkout -b upgrade/angular-21`
2. Zálohuj `pnpm-lock.yaml`
3. Spusti upgrade
4. Otestuj: `pnpm run build && pnpm run test:e2e`
5. Ak všetko funguje, merge do main

---

**Ak si AI asistent:** NEROB automatické upgrady bez explicitného súhlasu užívateľa!
