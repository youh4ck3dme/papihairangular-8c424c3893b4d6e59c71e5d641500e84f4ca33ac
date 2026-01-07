# 🚀 Deploy na Forpsi VPS - Rýchly Návod

## 📋 Pred Deployom

### 1. Upravte konfiguráciu v `deploy-forpsi.sh`:

```bash
VPS_HOST="forpsi.sk"        # alebo IP adresa
VPS_USER="root"             # alebo váš SSH user
DOMAIN="papihairdesign.sk"
OPENAI_API_KEY="sk-..."     # Váš OpenAI API kľúč
```

### 2. Skontrolujte SSH prístup:

```bash
ssh ${VPS_USER}@${VPS_HOST}
```

---

## 🚀 Deploy

### Jednoduchý deploy:

```bash
./deploy-forpsi.sh
```

### Čo script robí:

1. ✅ Build Angular aplikácie (production)
2. ✅ Kopíruje PHP proxy súbory do dist
3. ✅ Vytvorí zálohu na serveri
4. ✅ Nahrá súbory cez rsync
5. ✅ Konfiguruje Nginx + PHP-FPM
6. ✅ Nastaví environment variables
7. ✅ Reštartuje Nginx

---

## 🧪 Test po Deploy

```bash
# Test na produkcii
./test-main-features.sh https://papihairdesign.sk
```

---

## ⚙️ Manuálne Nastavenie (ak script zlyhá)

### 1. Nginx Config

Script vytvorí `/etc/nginx/sites-available/papihairdesign.sk`

### 2. PHP-FPM

Skontroluj verziu:
```bash
ls /var/run/php/php*-fpm.sock
```

### 3. SSL Certifikát

Ak ešte nemáte SSL:
```bash
sudo certbot --nginx -d papihairdesign.sk -d www.papihairdesign.sk
```

### 4. Environment Variables

Pridajte do `/etc/environment` alebo PHP-FPM config:
```
OPENAI_API_KEY=sk-...
```

---

## 🔧 Troubleshooting

### PHP endpointy nefungujú:
```bash
# Skontroluj PHP-FPM
sudo systemctl status php-fpm

# Skontroluj Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Stream nefunguje:
```bash
# Skontroluj Nginx config - musí mať:
# proxy_buffering off;
# gzip off;
```

### Rate limiting nefunguje:
```bash
# Skontroluj oprávnenia na rate-limit.json
chmod 666 /var/www/papihairdesign.sk/proxy/rate-limit.json
```

---

## 📝 Poznámky

- Script automaticky vytvára zálohy (posledných 5)
- PHP proxy súbory sa kopírujú do `dist/app/browser/proxy/`
- `config.php` sa vytvára na serveri (nie je v Git)
- SSL certifikát treba nastaviť manuálne (ak ešte nie je)

---

## ✅ Ready to Deploy!

```bash
# 1. Upravte konfiguráciu
nano deploy-forpsi.sh

# 2. Spustite deploy
./deploy-forpsi.sh

# 3. Testujte
./test-main-features.sh https://papihairdesign.sk
```

