# 🔒 Zabezpečenie API Kľúčov

## ⚠️ DÔLEŽITÉ: API kľúče NIKDY neukladajte do Git!

### ✅ Čo je zabezpečené:

1. **Environment súbory** - `src/environments/environment.ts` a `environment.prod.ts` sú v `.gitignore`
2. **PHP config** - `src/proxy/config.php` je v `.gitignore`
3. **Deploy scripts** - používajú `$OPENAI_API_KEY` environment variable
4. **Vercel functions** - používajú `process.env.OPENAI_API_KEY`

### ❌ Čo treba opraviť:

**API kľúče sú už v Git histórii!** Musíte ich odstrániť:

```bash
# 1. Odstrániť z aktuálneho commit
git rm --cached src/environments/environment.ts
git rm --cached src/environments/environment.prod.ts
git rm --cached src/proxy/config.php

# 2. Odstrániť z Git histórie (vyžaduje force push)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/environments/environment.ts src/environments/environment.prod.ts src/proxy/config.php" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (POZOR: zmení históriu!)
git push origin --force --all
```

**ALEBO** použite BFG Repo-Cleaner (bezpečnejšie):
```bash
# Inštalácia
brew install bfg

# Odstránenie kľúčov
bfg --replace-text passwords.txt

# Force push
git push origin --force --all
```

---

## 🔐 Nastavenie API Kľúčov

### Pre lokálny vývoj:

```bash
# Vytvorte .env.local
cp .env.example .env.local

# Upravte .env.local a pridajte kľúče
nano .env.local
```

### Pre Vercel:

```bash
# Nastavte environment variable
vercel env add OPENAI_API_KEY
# Zadajte: sk-...
```

### Pre VPS (Forpsi):

```bash
# Pred deployom nastavte
export OPENAI_API_KEY='sk-...'

# Alebo pridajte do ~/.bashrc
echo "export OPENAI_API_KEY='sk-...'" >> ~/.bashrc
```

---

## 📝 Súbory s kľúčmi (NIKDY do Git):

- ❌ `src/environments/environment.ts`
- ❌ `src/environments/environment.prod.ts`
- ❌ `src/proxy/config.php`
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ `deploy-*.sh` (ak obsahujú kľúče)

---

## ✅ Bezpečné súbory (môžu byť v Git):

- ✅ `src/environments/environment.example.ts`
- ✅ `src/proxy/config.example.php`
- ✅ `.env.example`
- ✅ `docs/SECURITY.md`

---

## 🚨 Ak ste už pushli kľúče do Git:

1. **Okamžite zmeňte kľúče** na OpenAI platforme
2. Odstráňte z Git histórie (pozri vyššie)
3. Force push (POZOR: zmení históriu!)
4. Informujte tím, že treba pullnúť novú históriu

---

## 📋 Checklist pred commitom:

- [ ] `git status` - skontrolujte, či nie sú environment súbory
- [ ] `git diff` - skontrolujte, či nie sú kľúče v zmenách
- [ ] `grep -r "sk-" . --exclude-dir=node_modules` - vyhľadajte kľúče v kóde

