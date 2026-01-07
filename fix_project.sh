#!/usr/bin/env bash
set -e

# Skript na automatickú úpravu projektu

# 1. Odstrániť volanie seoService.init() v AppComponent (už je odstránené, ale pre istotu)
sed -i '' '/this\.seoService\.init()/d' src/app/app.component.ts || true

# 2. Pridať metódu init() do SeoService (ak ešte neexistuje)
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/app/core/services/seo.service.ts
@@
-  constructor() {
-    // Example: set page title based on the current route data
-    const routeData = this.currentRoute.snapshot.data;
-    const pageTitle = routeData['title'] ?? 'Papihairdesign';
-    this.titleService.setTitle(pageTitle);
-  }
+  /** Initialise the service with a default title. */
+  init(): void {
+    const routeData = this.currentRoute.snapshot.data;
+    const pageTitle = (routeData as any)['title'] ?? 'Papihairdesign';
+    this.titleService.setTitle(pageTitle);
+  }
*** End Patch
PATCH

# 3. Uistiť sa, že polyfills je pole (už je nastavené, ale kontrola)
jq '.projects.app.architect.build.options.polyfills' angular.json > /dev/null || {
  echo "Polyfills nie je pole – opravujem..."
  # Pridá polyfills ako pole, ak chýba
  tmp=$(mktemp)
  jq '.projects.app.architect.build.options.polyfills = ["src/polyfills.ts"]' angular.json > "$tmp" && mv "$tmp" angular.json
}

# 4. Pridať @Component dekorátor s standalone:true pre komponenty, ktoré ho nemajú
# (jednoduchý príklad – skontroluje .ts súbory v src/app a pridá dekorátor, ak chýba)
for file in $(git ls-files "src/app/**/*.ts" | grep -v "\.spec\.ts"); do
  if ! grep -q "@Component" "$file"; then
    echo "Pridávam @Component dekorátor do $file"
    componentName=$(basename "$file" .ts)
    apply_patch <<PATCH2
*** Begin Patch
*** Update File: $file
@@
+import { Component } from '@angular/core';
+
+@Component({
+  selector: 'app-$componentName',
+  templateUrl: './$componentName.component.html',
+  styleUrls: ['./$componentName.component.css'],
+  standalone: true,
+  imports: []
+})
*** End Patch
PATCH2
  fi
done

# 5. Spustiť vývojový server
npm run dev
