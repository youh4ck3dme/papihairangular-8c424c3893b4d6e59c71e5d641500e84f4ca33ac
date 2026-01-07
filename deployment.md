# Automatické nasadenie Angular aplikácie na VPS

Tento dokument popisuje kompletný automatizovaný proces nasadenia Angular aplikácie papihairdesign.sk na VPS server.

## Predpoklady

- Lokálny počítač s nainštalovaným Node.js, npm a Angular CLI
- VPS server s Ubuntu/Debian (IP: 57.129.4.22)
- SSH prístup na VPS ako ubuntu (bez hesla, pomocou SSH kľúčov)
- Doména papihairdesign.sk nasmerovaná na VPS IP

## Súbory

### full-deploy.sh

Hlavný automatizačný skript, ktorý vykoná všetky kroky:

- Zostavenie Angular aplikácie
- Kopírovanie buildu na VPS
- Nastavenie nginx na serveri

### deploy.sh

Skript len na lokálny build a kopírovanie (bez server setup)

### setup-ssh.sh

Skript na automatické nastavenie SSH kľúčov pre bezheslový prístup na VPS server.

## Použitie

### Jednorazové nastavenie

1. Spustite setup-ssh.sh pre automatické nastavenie SSH kľúčov:

   ```bash
   chmod +x setup-ssh.sh
   ./setup-ssh.sh
   ```

   Poznámka: Pri prvom spustení bude potrebné zadať heslo na VPS (aktuálne: Poklop123###).

2. Uistite sa, že doména papihairdesign.sk smeruje na 57.129.4.22

### Spustenie deploy

```bash
chmod +x full-deploy.sh
./full-deploy.sh
```

## Čo skript robí

1. **Lokálny build**: `ng build --configuration=production`
2. **Kopírovanie na VPS**: `scp -r dist/* ubuntu@57.129.4.22:/var/www/papihairdesign.sk`
3. **Server setup**:
   - Aktualizácia balíčkov
   - Inštalácia nginx (ak potrebné)
   - Vytvorenie adresára `/var/www/papihairdesign.sk`
   - Konfigurácia nginx vhost pre papihairdesign.sk
   - Aktivácia konfigurácie a reštart nginx

## Konfigurácia nginx

Skript vytvorí konfiguráciu s:

- SPA routing (`try_files $uri $uri/ /index.html`)
- Cache pre statické súbory (JS, CSS, obrázky)
- Základné bezpečnostné hlavičky
- Skrytie nginx verzie

## HTTPS cez Cloudflare (CRITICAL)

64:
65: Po úspešnom deploy je **CRITICAL** nastaviť nasledovné, inak nastane **Redirect Loop**:
66: 1. Nastavte v Cloudflare (Dashboard > SSL/TLS):
67:     - **SSL/TLS Režim**: **Full (Strict)** (alebo aspoň **Full**).
68:     - **NEPOUŽÍVAJTE** "Flexible" (spôsobí nekonečnú slučku, lebo server vynucuje HTTPS).
69:
70: 2. Nastavte v Cloudflare (Dashboard > DNS):
71:     - **A záznam** `@` -> `57.129.4.22` (Proxied / Orange Cloud)
72:     - **A záznam** `www` -> `57.129.4.22` (Proxied / Orange Cloud)

## Riešenie problémov

### SSH odmietnuté

- Skontrolujte firewall na VPS: `ufw allow ssh`
- Overte SSH daemon: `systemctl status ssh`
- Skontrolujte SSH kľúče

### Nginx chyba

- Skontrolujte konfiguráciu: `nginx -t`
- Pozrite logy: `tail -f /var/log/nginx/error.log`

### Aplikácia sa nezobrazuje

- Overte DNS propagáciu
- Skontrolujte nginx konfiguráciu
- Overte, či sú súbory skopírované: `ls -la /var/www/papihairdesign.sk`

## Bezpečnosť

Skript obsahuje základné bezpečnostné opatrenia:

- `set -euo pipefail` pre zastavenie pri chybách
- Nginx konfigurácia s bezpečnostnými hlavičkami
- Skrytie server verzie

Pre produkčné prostredie zvážte:

- Fail2ban pre SSH
- Let's Encrypt certifikáty
- Nginx rate limiting
- Monitoring a logy

## Aktualizácie

Pri ďalších deployoch stačí spustiť `./full-deploy.sh` - skript automaticky prepíše súbory a reštartuje nginx.
