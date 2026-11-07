import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, EMPTY, mergeMap, shareReplay } from 'rxjs';

/**
 * Ostatné stránky sa stiahnu až po prvom prejave záujmu návštevníka (posun, dotyk, pohyb myši, klávesa)
 * a v nečinnosti prehliadača (requestIdleCallback) – nesúperia s prvou stránkou o sieť a CPU
 * a kto stránku hneď opustí, nesťahuje ~60 kB JS navyše. Ďalšie kliknutie je potom okamžité.
 * Pri šetrení dát alebo 2G sa neprednačítava nič.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreloadStrategy implements PreloadingStrategy {
  private readonly idle$ = new Observable<void>(subscriber => {
    if (typeof window === 'undefined') return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType ?? '')) return;
    const go = () => { subscriber.next(); subscriber.complete(); };
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 5000 }) : setTimeout(go, 1000));
    const events = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'wheel', 'keydown'] as const;
    let armed = true;
    const onFirst = () => {
      if (!armed) return;
      armed = false;
      events.forEach(e => window.removeEventListener(e, onFirst, true));
      if (document.readyState === 'complete') idle();
      else window.addEventListener('load', idle, { once: true });
    };
    events.forEach(e => window.addEventListener(e, onFirst, { capture: true, passive: true }));
  }).pipe(shareReplay(1));

  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return this.idle$.pipe(mergeMap(() => load() ?? EMPTY));
  }
}
