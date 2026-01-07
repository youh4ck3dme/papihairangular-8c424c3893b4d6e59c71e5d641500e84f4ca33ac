# Průvodce zálohováním na GitHub

Tento průvodce obsahuje přesné kroky pro vytvoření nového GitHub repository a nahrání zálohy vašeho projektu. Postupujte krok za krokem.

## Předpoklady
- Máte účet na GitHub.com
- Máte nainstalovaný Git na vašem počítači
- Jste přihlášeni do GitHub přes web nebo SSH klíč

## Krok 1: Vytvoření nového GitHub repository
1. Přejděte na [GitHub.com](https://github.com) a přihlaste se.
2. Klikněte na tlačítko "New repository" (nebo "+" v pravém horním rohu > "New repository").
3. Zadejte název repository (např. `papihairdesign-backup`).
4. Přidejte popis (volitelné).
5. Nastavte repository jako **Public** nebo **Private** podle potřeby.
6. **NEZAŠKRTÁVEJTE** "Add a README file", "Add .gitignore" nebo "Choose a license" (pokud chcete začít s prázdným repo).
7. Klikněte na "Create repository".

## Krok 2: Inicializace Git repository lokálně
Otevřete terminál v adresáři vašeho projektu (`/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace`).

```bash
# Inicializujte Git repository
git init

# Nastavte vaše jméno a email (pokud jste to ještě neudělali)
git config --global user.name "Vaše Jméno"
git config --global user.email "vas.email@example.com"
```

## Krok 3: Přidání souborů do Git
```bash
# Přidejte všechny soubory do staging area
git add .

# Zkontrolujte stav (volitelné)
git status
```

## Krok 4: Commit změn
```bash
# Vytvořte commit s popisem
git commit -m "Initial backup of Papi Hair Design project"
```

## Krok 5: Připojení k GitHub repository
Nahraďte `<username>` vaším GitHub uživatelským jménem a `<repo-name>` názvem repository, které jste vytvořili.

```bash
# Přidejte remote origin (použijte HTTPS nebo SSH podle preference)
# HTTPS:
git remote add origin https://github.com/<username>/<repo-name>.git

# Nebo SSH (pokud máte nastavený SSH klíč):
git remote add origin git@github.com:<username>/<repo-name>.git

# Ověřte remote
git remote -v
```

## Krok 6: Push zálohy na GitHub
```bash
# Nahrajte kód na GitHub (na hlavní větev main)
git push -u origin main

# Pokud používáte starší verzi Git a výchozí větev je master:
# git push -u origin master
```

## Krok 7: Ověření
- Přejděte zpět na GitHub a obnovte stránku repository.
- Měli byste vidět všechny vaše soubory nahrané.

## Poznámky
- Pokud narazíte na chybu "fatal: remote origin already exists", použijte `git remote remove origin` a pak znovu přidejte.
- Pro velké projekty zvažte použití `.gitignore` pro vyloučení nepotřebných souborů (např. `node_modules/`, `.env`).
- Pokud chcete zálohovat pravidelně, použijte `git add . && git commit -m "Backup $(date)" && git push`.

## Řešení problémů
- **Chyba autentizace**: Ujistěte se, že máte správné přihlašovací údaje nebo SSH klíč nastavený.
- **Chyba "main branch does not exist"**: Použijte `git branch -M main` před push.