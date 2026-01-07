#!/usr/bin/env bash
set -e

# -------------------------------------------------
# 1️⃣  Inštalácia Angular Animations (ak nie sú)
# -------------------------------------------------
if ! npm ls @angular/animations >/dev/null 2>&1; then
  echo "Inštalujem @angular/animations (verzia ^20.3.0)..."
  npm install @angular/animations@^20.3.0 --save
fi

# -------------------------------------------------
# 2️⃣  Pridanie globálnych štýlov (styles.css)
# -------------------------------------------------
apply_patch <<'PATCH_INNER'
*** Begin Patch
*** Update File: src/styles.css
@@
-/* You can add global styles to this file, and also import other style files */
+/* --------------------------------------------------------------
+   GLOBAL STYLES – PAPI HAIR DESIGN THEME
+   --------------------------------------------------------------
+   • Google Font „Inter”
+   • Dark gradient background
+   • Glass‑morphism cards
+   • Micro‑animations (fade‑in, slide‑up)
+-------------------------------------------------------------- */
+
+@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
+
+html {
+  --color-primary:   hsl(210, 30%, 20%);
+  --color-secondary: hsl(210, 30%, 30%);
+  --color-accent:    hsl(10, 80%, 55%);
+  --color-bg:        hsl(210, 30%, 10%);
+  --color-surface:   hsla(0, 0%, 100%, 0.08);
+  --color-text:      hsl(0, 0%, 95%);
+  --shadow-glass:    0 8px 32px rgba(0,0,0,0.25);
+  --radius:          12px;
+}
+
+body {
+  margin: 0;
+  font-family: 'Inter', system-ui, sans-serif;
+  background: linear-gradient(135deg, hsl(210, 30%, 12%), hsl(210, 30%, 6%));
+  color: var(--color-text);
+  min-height: 100vh;
+  overflow-x: hidden;
+}
+
+.glass-card {
+  background: var(--color-surface);
+  backdrop-filter: blur(12px);
+  border-radius: var(--radius);
+  box-shadow: var(--shadow-glass);
+  padding: 1.5rem;
+  transition: transform 0.25s ease, box-shadow 0.25s ease;
+}
+.glass-card:hover {
+  transform: translateY(-4px);
+  box-shadow: 0 12px 36px rgba(0,0,0,0.35);
+}
+
+.fade-in { animation: fadeIn 0.6s ease forwards; }
+.slide-up { animation: slideUp 0.6s ease forwards; }
+
+@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
+@keyframes slideUp { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
+
+a { color: var(--color-accent); text-decoration:none; transition:color .2s; }
+a:hover { color:hsl(10,80%,65%); }
PATCH_INNER

# -------------------------------------------------
# 3️⃣  Pridanie animácií (core/animations.ts)
# -------------------------------------------------
apply_patch <<'PATCH_INNER'
*** Begin Patch
*** Add File: src/app/core/animations.ts
+import { trigger, transition, style, animate } from '@angular/animations';
+
+export const fadeSlideIn = trigger('fadeSlideIn', [
+  transition(':enter', [
+    style({ opacity: 0, transform: 'translateY(20px)' }),
+    animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
+  ])
+]);
*** End Patch
PATCH_INNER

# -------------------------------------------------
# 4️⃣  Aktualizovať AppComponent – import BrowserAnimationsModule
# -------------------------------------------------
apply_patch <<'PATCH_INNER'
*** Begin Patch
*** Update File: src/app/app.component.ts
@@
-import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
+import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
+import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@@
-  imports: [RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent]
+  imports: [RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent, BrowserAnimationsModule]
*** End Patch
PATCH_INNER

# -------------------------------------------------
# 5️⃣  Pridať animáciu do všetkých routovaných komponentov (príklad Blog)
# -------------------------------------------------
apply_patch <<'PATCH_INNER'
*** Begin Patch
*** Update File: src/app/features/blog/blog-list.component.ts
@@
-import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
+import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
+import { fadeSlideIn } from '../../core/animations';
@@
   standalone: true,
   imports: [RouterLink],
+  animations: [fadeSlideIn],
*** End Patch
PATCH_INNER

apply_patch <<'PATCH_INNER'
*** Begin Patch
*** Update File: src/app/features/blog/blog-post.component.ts
@@
-import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
+import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
+import { fadeSlideIn } from '../../core/animations';
@@
   standalone: true,
   imports: [RouterLink],
+  animations: [fadeSlideIn],
*** End Patch
PATCH_INNER

# -------------------------------------------------
# 6️⃣  Pridať utility tried do existujúcich CSS (príklad blog‑list)
# -------------------------------------------------
apply_patch <<'PATCH_INNER'
*** Begin Patch
*** Update File: src/app/features/blog/blog-list.component.css
@@
 .blog-archive {
-  font-family: 'Inter', sans-serif;
-  padding: 2rem;
-  background: linear-gradient(135deg, #f0f4ff, #e6e9ff);
+  font-family: 'Inter', sans-serif;
+  padding: 2rem;
+  background: transparent;
+  display: flex;
+  flex-direction: column;
+  align-items: center;
 }
@@
 .post-card {
-  background: rgba(255, 255, 255, 0.85);
+  @extend .glass-card;
+  opacity: 0;
+  animation: fadeIn 0.6s ease forwards;
+  animation-delay: calc(var(--i) * 0.1s);
 }
*** End Patch
PATCH_INNER

# -------------------------------------------------
# 7️⃣  Spusti dev server (na konci skriptu)
# -------------------------------------------------
echo "Spúšťam dev server – otvor http://localhost:3000 v prehliadači"
npm run dev
