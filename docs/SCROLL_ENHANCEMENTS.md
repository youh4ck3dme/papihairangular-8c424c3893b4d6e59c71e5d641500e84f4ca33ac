# 🎨 Scroll & Reading Enhancements - Documentation

## Implementované Features

### ✅ 1. Reading Progress Highlight
Zvýrazňuje odsek, ktorý používateľ práve číta počas scrollovania.

#### Použitie:
```html
<div appReadingHighlight>
  <p>Váš obsah...</p>
  <p>Ďalší odsek...</p>
</div>
```

#### Features:
- ✅ **IntersectionObserver** - efektívne sledovanie viditeľnosti
- ✅ **Opacity transition** - jemné prechody (0.6 → 1.0)
- ✅ **Background gradient** - zlatý shimmer efekt
- ✅ **Transform animation** - jemný posun vpravo (4px)
- ✅ **Box shadow** - zlatá čiara vľavo
- ✅ **Dark/Light mode** - prispôsobené pre oba režimy
- ✅ **Performance** - GPU-accelerated animations

#### Technické detaily:
```typescript
IntersectionObserver options:
- rootMargin: '-20% 0px -60% 0px'
- threshold: [0, 0.25, 0.5, 0.75, 1]
- Trigger: intersectionRatio > 0.3
```

---

### ✅ 2. Smooth Scroll Enhancement
Vylepšený smooth scroll s centrovaním fokusovaného elementu.

#### Použitie:
```html
<div appSmoothScroll>
  <a href="#section1">Sekcia 1</a>
  <a href="#section2">Sekcia 2</a>
</div>

<section id="section1">Obsah</section>
```

#### Features:
- ✅ **Automatic centering** - element sa vycentruje vo viewporte
- ✅ **Focus highlight** - dočasné zlaté zvýraznenie (2s)
- ✅ **Smooth animation** - cubic-bezier easing
- ✅ **Scroll offset** - 100px pre fixed headers
- ✅ **Anchor interception** - automatické zachytenie `href="#..."`

#### Animácia:
```css
scroll-focus-pulse:
0%   → transparent
10%  → gold glow (8px)
50%  → gold glow (12px)
100% → transparent
```

---

### ✅ 3. FAQ Accordion
Luxusný accordion s výnimočne hladkými animáciami.

#### Použitie:
```html
<app-faq-accordion></app-faq-accordion>
```

#### Features:
- ✅ **Expand/Collapse animations** - 400ms cubic-bezier
- ✅ **Rotate icon** - 180° rotation (300ms)
- ✅ **Expand/Collapse All** - hromadné ovládanie
- ✅ **Hover effects** - zlatý glow a transform
- ✅ **Active state** - vizuálne zvýraznenie otvorenej položky
- ✅ **Responsive** - mobile-first dizajn
- ✅ **Accessibility** - ARIA atribúty, keyboard navigation

#### Animácie:
```typescript
expandCollapse:
- height: 0 → *
- opacity: 0 → 1
- padding: 0 → 1rem

rotateIcon:
- transform: rotate(0deg) → rotate(180deg)
```

#### Obsah:
6 prednastavených FAQ otázok o PAPI HAIR DESIGN:
1. Rezervácia termínu
2. Ponúkané služby
3. Lokalita
4. Otváracie hodiny
5. Vlasová kozmetika
6. Walk-in policy

---

## 📁 Súborová Štruktúra

```
src/app/
├── shared/
│   ├── directives/
│   │   ├── reading-highlight.directive.ts
│   │   └── smooth-scroll.directive.ts
│   └── components/
│       └── faq-accordion/
│           ├── faq-accordion.component.ts
│           ├── faq-accordion.component.html
│           └── faq-accordion.component.css
├── features/
│   └── faq/
│       └── faq.component.ts (demo page)
└── styles.css (global styles)
```

---

## 🎨 Štýly & Animácie

### Reading Highlight CSS:
```css
.reading-highlight-target {
  opacity: 0.6;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.reading-active {
  opacity: 1;
  background: linear-gradient(90deg, gold...);
  transform: translateX(4px);
  box-shadow: -4px 0 0 0 rgba(212, 175, 55, 0.5);
  animation: reading-shimmer 3s infinite;
}
```

### Scroll Focus CSS:
```css
.scroll-focus-highlight {
  animation: scroll-focus-pulse 2s;
}

@keyframes scroll-focus-pulse {
  0%   → transparent
  10%  → gold background + glow
  50%  → stronger glow
  100% → transparent
}
```

### FAQ Accordion CSS:
```css
.faq-item {
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.1);
}

.faq-item.active {
  background: rgba(212, 175, 55, 0.05);
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.15);
}
```

---

## 🚀 Použitie v Aplikácii

### 1. Import direktív:
```typescript
import { ReadingHighlightDirective } from './shared/directives/reading-highlight.directive';
import { SmoothScrollDirective } from './shared/directives/smooth-scroll.directive';

@Component({
  imports: [ReadingHighlightDirective, SmoothScrollDirective]
})
```

### 2. Použitie v template:
```html
<!-- Reading Highlight -->
<article appReadingHighlight>
  <h1>Nadpis</h1>
  <p>Obsah článku...</p>
</article>

<!-- Smooth Scroll -->
<nav appSmoothScroll>
  <a href="#about">O nás</a>
  <a href="#services">Služby</a>
</nav>
```

### 3. FAQ Accordion:
```typescript
import { FaqAccordionComponent } from './shared/components/faq-accordion/faq-accordion.component';

@Component({
  imports: [FaqAccordionComponent]
})
```

```html
<app-faq-accordion></app-faq-accordion>
```

---

## 🎯 Performance

### Reading Highlight:
- **IntersectionObserver** - native browser API
- **GPU acceleration** - transform & opacity
- **Debounced** - optimalizované pre scroll
- **Memory efficient** - automatic cleanup

### Smooth Scroll:
- **Native smooth scroll** - `scroll-behavior: smooth`
- **RequestAnimationFrame** - optimalizované animácie
- **Event delegation** - single listener

### FAQ Accordion:
- **Angular Animations** - optimalizované pre performance
- **OnPush strategy** - minimálne re-renders
- **Signals** - reactive state management

---

## ♿ Accessibility

### Reading Highlight:
- ✅ Respects `prefers-reduced-motion`
- ✅ Neovplyvňuje screen readery
- ✅ Vizuálne enhancement only

### Smooth Scroll:
- ✅ `scroll-margin-top` pre offset
- ✅ Focus management
- ✅ Keyboard navigation support

### FAQ Accordion:
- ✅ ARIA attributes (`aria-expanded`, `aria-controls`)
- ✅ Keyboard navigation (Enter, Space)
- ✅ Focus indicators
- ✅ Screen reader friendly

---

## 🎨 Customizácia

### Farby:
```css
/* Zmena zlatej farby */
--gold: #D4AF37;
--gold-light: #FFD700;
--gold-dark: #B8860B;
```

### Timing:
```css
/* Zmena rýchlosti animácií */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Easing:
```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## 📊 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| IntersectionObserver | ✅ 51+ | ✅ 55+ | ✅ 12.1+ | ✅ 15+ |
| Smooth Scroll | ✅ 61+ | ✅ 36+ | ✅ 15.4+ | ✅ 79+ |
| CSS Animations | ✅ All | ✅ All | ✅ All | ✅ All |
| Angular Animations | ✅ All | ✅ All | ✅ All | ✅ All |

---

## 🐛 Troubleshooting

### Reading highlight nefunguje:
1. Skontroluj, či je direktíva importovaná
2. Overi, že container má `appReadingHighlight`
3. Skontroluj console pre chyby

### Smooth scroll neskáče správne:
1. Overi `scroll-margin-top` hodnotu
2. Skontroluj fixed header výšku
3. Testuj bez iných scroll listenerov

### Accordion sa neotvára:
1. Skontroluj Angular animations import
2. Overi, že `provideAnimations()` je v `main.ts`
3. Skontroluj console pre chyby

---

**Vytvorené:** 2025-11-25  
**Status:** ✅ Production Ready  
**Next:** Pixel-Perfect Audit
