# Průvodce nasazením nových souborů přes Visual Studio Code

Tento průvodce poskytuje podrobné instrukce pro nasazení nových souborů vaší aplikace přes Visual Studio Code (VS Code), včetně nastavení SSH, instalace Remote SSH extension a kroků pro aktualizaci aplikace na vzdáleném serveru.

## Předpoklady

- Visual Studio Code nainstalovaný na vašem počítači
- Přístup k vzdálenému serveru (VPS, hosting) s SSH
- Základní znalost příkazového řádku
- Vaše aplikace je připravena k nasazení (např. Angular aplikace sestavená přes `ng build --prod`)

## Krok 1: Nastavení SSH klíčů

SSH klíče umožňují bezpečnější připojení k serveru bez zadávání hesla pokaždé.

### Generování SSH klíče (pokud nemáte)

1. Otevřete terminál ve VS Code (View > Terminal)
2. Spusťte příkaz pro generování klíče:
   ```
   ssh-keygen -t rsa -b 4096 -C "vas-email@example.com"
   ```
3. Stiskněte Enter pro výchozí umístění (`~/.ssh/id_rsa`)
4. Nastavte heslo pro klíč (volitelné, ale doporučené)

### Kopírování veřejného klíče na server

1. Zobrazte veřejný klíč:
   ```
   cat ~/.ssh/id_rsa.pub
   ```
2. Zkopírujte výstup (začíná `ssh-rsa`)
3. Připojte se k serveru přes SSH (s heslem):
   ```
   ssh uzivatel@vas-server-ip
   ```
4. Na serveru přidejte klíč do `~/.ssh/authorized_keys`:
   ```
   echo "vas-zkopirovany-klic" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   chmod 700 ~/.ssh
   ```
5. Otestujte připojení bez hesla:
   ```
   ssh uzivatel@vas-server-ip
   ```

## Krok 2: Instalace Remote SSH extension

1. Otevřete VS Code
2. Klikněte na ikonu Extensions (čtverec s čtyřmi čtverečky) v levém panelu
3. Vyhledejte "Remote SSH"
4. Nainstalujte extension od Microsoftu
5. Po instalaci se zobrazí zelená ikona v levém dolním rohu VS Code

## Krok 3: Připojení k vzdálenému serveru

1. Klikněte na zelenou ikonu v levém dolním rohu VS Code
2. Vyberte "Connect to Host..."
3. Vyberte "Add New SSH Host..."
4. Zadejte SSH příkaz:
   ```
   ssh uzivatel@vas-server-ip
   ```
5. Vyberte konfigurační soubor (obvykle `~/.ssh/config`)
6. VS Code se restartuje a otevře se vzdálené prostředí

## Krok 4: Nasazení nových souborů

### Příprava souborů k nasazení

1. Ujistěte se, že máte nejnovější změny v lokálním repozitáři:
   ```
   git pull origin main
   ```
2. Sestavte aplikaci pro produkci (pro Angular):
   ```
   ng build --prod
   ```
   Soubory budou ve složce `dist/`

### Nahrání souborů na server

1. Ve VS Code s otevřeným vzdáleným připojením otevřete Explorer (Ctrl+Shift+E)
2. Přejděte do složky s vašimi soubory (např. `dist/`)
3. Klikněte pravým tlačítkem na soubory/složky, které chcete nahrát
4. Vyberte "Upload..." nebo použijte drag & drop
5. Vyberte cílovou složku na serveru (např. `/var/www/html/` nebo `/home/uzivatel/app/`)

Alternativně použijte SCP přes terminál:
```
scp -r dist/* uzivatel@vas-server-ip:/cesta/k/aplikaci/
```

## Krok 5: Aktualizace aplikace

### Restartování služeb

Pokud vaše aplikace běží jako služba (např. přes systemd nebo Docker):

1. Připojte se k serveru přes SSH ve VS Code
2. Restartujte webový server:
   ```
   sudo systemctl restart nginx
   # nebo
   sudo systemctl restart apache2
   ```
3. Pokud používáte Docker:
   ```
   docker-compose down
   docker-compose up -d
   ```

### Aktualizace závislostí (pokud potřeba)

1. Přejděte do složky aplikace na serveru
2. Aktualizujte závislosti:
   ```
   npm install --production
   # nebo pro Python
   pip install -r requirements.txt
   ```

### Kontrola funkčnosti

1. Otevřete prohlížeč a navštivte URL vaší aplikace
2. Zkontrolujte konzoli prohlížeče na chyby
3. Otestujte základní funkcionality

## Krok 6: Automatizace nasazení

Pro častější nasazení vytvořte skript `deploy.sh`:

```bash
#!/bin/bash
set -euo pipefail

echo "Sestavování aplikace..."
ng build --prod

echo "Nahrávání souborů na server..."
scp -r dist/* uzivatel@vas-server-ip:/cesta/k/aplikaci/

echo "Restartování služeb..."
ssh uzivatel@vas-server-ip "sudo systemctl restart nginx"

echo "Nasazení dokončeno!"
```

Spusťte skript:
```
chmod +x deploy.sh
./deploy.sh
```

## Řešení problémů

### Problémy s SSH připojením

- Zkontrolujte, zda je SSH služba spuštěna na serveru: `sudo systemctl status ssh`
- Ověřte oprávnění souborů: `chmod 600 ~/.ssh/id_rsa`
- Zkontrolujte firewall: `sudo ufw status`

### Problémy s Remote SSH extension

- Zkuste restartovat VS Code
- Zkontrolujte verzi extension
- Vymažte cache: `rm -rf ~/.vscode-server`

### Problémy s nasazením

- Zkontrolujte dostupné místo na disku: `df -h`
- Ověřte oprávnění složek: `ls -la /cesta/k/aplikaci/`
- Zkontrolujte logy serveru: `sudo journalctl -u nginx`

## Bezpečnostní doporučení

- Používejte silné heslo pro SSH klíče
- Zakážte root přihlášení přes SSH: `PermitRootLogin no` v `/etc/ssh/sshd_config`
- Používejte firewall (ufw nebo firewalld)
- Pravidelně aktualizujte systém: `sudo apt update && sudo apt upgrade`

## Další zdroje

- [Oficiální dokumentace Remote SSH](https://code.visualstudio.com/docs/remote/ssh)
- [SSH klíče na GitHub](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh)
- [Angular deployment guide](https://angular.io/guide/deployment)