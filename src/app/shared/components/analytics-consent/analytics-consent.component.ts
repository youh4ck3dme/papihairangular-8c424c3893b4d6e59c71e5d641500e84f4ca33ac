import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { SALON_CONTACT } from '../../../core/config/salon-contact';
import { ANALYTICS_ID, trustedAnalyticsTagUrl } from '../../../core/security/trusted-types';

const PREFERENCE = 'papi.analytics-consent.v1';
type Preference = 'granted' | 'denied';
const DISABLE_KEY = `ga-disable-${ANALYTICS_ID}` as const;
type AnalyticsWindow = Window & { dataLayer?: IArguments[]; [DISABLE_KEY]?: boolean };

@Component({
  selector: 'app-analytics-consent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics-consent.component.html',
  styleUrl: './analytics-consent.component.css',
})
export class AnalyticsConsentComponent {
  readonly available = signal(false);
  readonly open = signal(false);
  readonly preference = signal<Preference | null>(null);
  private readonly destroy = inject(DestroyRef);
  private started = false;

  constructor() {
    afterNextRender(() => {
      if (!['papihairdesign.sk', 'www.papihairdesign.sk'].includes(location.hostname)) return;
      this.available.set(true);
      let saved: string | null = null;
      try { saved = localStorage.getItem(PREFERENCE); } catch { /* súkromný režim */ }
      this.apply(saved);
      const synchronize = (event: StorageEvent) => {
        if (event.key === PREFERENCE || event.key === null) this.apply(event.newValue);
      };
      window.addEventListener('storage', synchronize);
      this.destroy.onDestroy(() => window.removeEventListener('storage', synchronize));
    });
  }

  choose(choice: Preference): void {
    try { localStorage.setItem(PREFERENCE, choice); } catch { /* voľba platí pre túto stránku */ }
    this.apply(choice);
  }

  private apply(value: string | null): void {
    const choice = value === 'granted' || value === 'denied' ? value : null;
    this.preference.set(choice);
    this.open.set(choice === null);
    const browser = window as AnalyticsWindow;
    browser[DISABLE_KEY] = choice !== 'granted';
    if (choice === 'granted') {
      if (this.started) return;
      this.started = true;
      browser.dataLayer ??= [];
      const gtag: (...command: unknown[]) => void = function () {
        // eslint-disable-next-line prefer-rest-params -- gtag.js očakáva objekt arguments v poli dataLayer.
        browser.dataLayer!.push(arguments);
      };
      gtag('consent', 'default', {
        analytics_storage: 'granted', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied',
      });
      gtag('js', new Date());
      // Rozšírené meranie streamu zachytí načítanie aj navigáciu cez History API.
      gtag('config', ANALYTICS_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
      const trackClick = ({ target }: MouseEvent) => {
        if (this.preference() !== 'granted' || !(target instanceof Element)) return;
        const link = target.closest<HTMLAnchorElement>('a[href]');
        if (!link) return;
        // Odznak recenzií Bookio má rovnaký cieľ ako rezervácia.
        const source = link.dataset['reviewSource'];
        if (source === 'Google' || source === 'Bookio') {
          gtag('event', 'reviews_click', { review_source: source });
        } else if (link.href === SALON_CONTACT.bookingUrl) {
          gtag('event', 'booking_click');
        } else if (link.protocol === 'tel:') {
          gtag('event', 'phone_click');
        }
      };
      document.addEventListener('click', trackClick, true);
      this.destroy.onDestroy(() => document.removeEventListener('click', trackClick, true));
      const script = document.createElement('script');
      script.async = true;
      script.src = trustedAnalyticsTagUrl();
      document.head.appendChild(script);
    } else {
      for (const name of ['_ga', '_ga_' + ANALYTICS_ID.slice(2)]) {
        for (const scope of ['', '; Domain=papihairdesign.sk', '; Domain=' + location.hostname]) {
          document.cookie = name + '=; Max-Age=0; Path=/' + scope;
        }
      }
      // Po odvolaní zahodíme aj poslucháče Google pre ďalšiu navigáciu.
      if (this.started) location.reload();
    }
  }
}
