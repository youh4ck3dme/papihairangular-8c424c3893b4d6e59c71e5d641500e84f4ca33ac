import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, EMPTY, mergeMap, shareReplay } from 'rxjs';

/**
 * Ostatné stránky sa stiahnu až keď je prehliadač po načítaní nečinný (requestIdleCallback),
 * nie hneď pri štarte – nesúperia s prvou stránkou o sieť a CPU. Ďalšie kliknutie je potom okamžité.
 * Pri šetrení dát alebo 2G sa neprednačítava nič.
 */
@Injectable({ providedIn: 'root' })
export class IdlePreloadStrategy implements PreloadingStrategy {
  private readonly idle$ = new Observable<void>(subscriber => {
    if (typeof window === 'undefined') return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || /2g/.test(conn?.effectiveType ?? '')) return;
    const go = () => { subscriber.next(); subscriber.complete(); };
    const start = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 5000 }) : setTimeout(go, 3000));
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }).pipe(shareReplay(1));

  preload(_route: Route, load: () => Observable<unknown>): Observable<unknown> {
    return this.idle$.pipe(mergeMap(() => load() ?? EMPTY));
  }
}
