import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, retryWhen, scan, delayWhen, shareReplay, tap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMsg { role: 'user' | 'assistant' | 'system'; content: string }

/**
 * Normalize string for cache key
 */
function norm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
}

/**
 * FAQ cache - instant responses for common questions
 */
const FAQ: Record<string, string> = {
  // Greetings (instant)
  'ahoj': 'Ahoj! 👋 Som PAPI AI asistent. Ako ti môžem pomôcť? 💇‍♀️',
  'čau': 'Čau! ✨ Čím ti môžem poslúžiť?',
  'hi': 'Ahoj! 👋 Ako ti môžem pomôcť? 💇‍♀️',
  'hello': 'Ahoj! 👋 Som PAPI AI asistent. Ako ti môžem pomôcť?',
  'dobrý deň': 'Dobrý deň! 👋 Som PAPI AI asistent. Ako vám môžem pomôcť?',
  'dobry den': 'Dobrý deň! 👋 Som PAPI AI asistent. Ako vám môžem pomôcť?',
  // Pricing
  'koľko stojí strih': 'Pánsky strih: 19-25€, dámsky strih: 30-45€. Rezervácia: +421 949 459 624 alebo https://services.bookio.com/papi-hair-design/widget?lang=sk 💇‍♀️',
  'koľko stojí strih?': 'Pánsky strih: 19-25€, dámsky strih: 30-45€. Rezervácia: +421 949 459 624 alebo https://services.bookio.com/papi-hair-design/widget?lang=sk 💇‍♀️',
  'cena': 'Pánsky strih: 19-25€, dámsky: 30-45€, farbenie: 70-120€, balayage: 150-250€. Pre presný cenník zavolajte: +421 949 459 624 💰',
  'cenník': 'Pánsky strih: 19-25€, dámsky: 30-45€, farbenie: 70-120€, balayage: 150-250€. Pre presný cenník zavolajte: +421 949 459 624 💰',
  // Hours & Location
  'otváracie hodiny': 'Po-Pi: 8:00-17:00, So: podľa objednávok, Ne: zatvorené. Rezervácia: +421 949 459 624 🕒',
  'otváracie hodiny?': 'Po-Pi: 8:00-17:00, So: podľa objednávok, Ne: zatvorené. Rezervácia: +421 949 459 624 🕒',
  'kde sa nachádzate': 'Trieda SNP 61 (Spoločenský pavilón), Košice. 📍 Rezervácia: +421 949 459 624',
  'kde sa nachádzate?': 'Trieda SNP 61 (Spoločenský pavilón), Košice. 📍 Rezervácia: +421 949 459 624',
  'adresa': 'Trieda SNP 61 (Spoločenský pavilón), Košice. 📍 Rezervácia: +421 949 459 624',
  // Contact
  'kontakt': 'Tel: +421 949 459 624, Email: papihairdesign@gmail.com. Online: https://services.bookio.com/papi-hair-design/widget?lang=sk 📞',
  'telefón': 'Tel: +421 949 459 624. Email: papihairdesign@gmail.com 📞',
  'telefon': 'Tel: +421 949 459 624. Email: papihairdesign@gmail.com 📞',
  'email': 'Email: papihairdesign@gmail.com. Tel: +421 949 459 624 ✉️',
  // Reservation
  'rezervácia': 'Online: https://services.bookio.com/papi-hair-design/widget?lang=sk alebo tel: +421 949 459 624 📅',
  'rezervovať': 'Online: https://services.bookio.com/papi-hair-design/widget?lang=sk alebo tel: +421 949 459 624 📅',
  'objednať sa': 'Online: https://services.bookio.com/papi-hair-design/widget?lang=sk alebo tel: +421 949 459 624 📅',
  'chcem sa objednať': 'Online: https://services.bookio.com/papi-hair-design/widget?lang=sk alebo tel: +421 949 459 624 📅',
  'chcem sa objednať na termín': 'Online: https://services.bookio.com/papi-hair-design/widget?lang=sk alebo tel: +421 949 459 624 📅',
};

/**
 * Clamp history by character limit (pragmatic token truncation)
 */
function clampHistoryByChars(history: ChatMsg[], maxChars = 1800): ChatMsg[] {
  const out: ChatMsg[] = [];
  let total = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    total += (h.content?.length || 0);
    if (total > maxChars) break;
    out.unshift(h);
  }
  return out;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  // Vercel: use /api/chat, VPS: use /proxy/chat.php
  private apiUrl = environment.production ? '/api/chat' : '/proxy/chat.php';
  private inflight = new Map<string, Observable<string>>();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  /**
   * JSON endpoint (fallback when stream fails)
   */
  askJson(message: string, history: ChatMsg[]): Observable<{ reply: string }> {
    const payload = {
      message: message.trim(),
      history: clampHistoryByChars(history, 1800),
      max_tokens: 200
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<{ reply?: string }>(this.apiUrl, payload, { headers }).pipe(
      map(r => ({ reply: (r?.reply ?? '').toString().trim() || 'Hmm… nedostal som odpoveď. Skús to ešte raz.' }))
    );
  }

  /**
   * SSE Stream endpoint (preferred - progressive text)
   */
  askStream(message: string, history: ChatMsg[]): Observable<string> {
    return new Observable<string>((observer) => {
      const controller = new AbortController();

      fetch(environment.production ? '/api/chat/stream' : '/proxy/chat_stream.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: message.trim(),
          history: clampHistoryByChars(history, 1800),
          max_tokens: 200
        })
      }).then(res => {
        if (!res.ok || !res.body) {
          throw new Error('stream_failed');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');

        const read = async () => {
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              observer.next(chunk);
            }
            observer.complete();
          } catch (e) {
            observer.error(e);
          }
        };

        read();
      }).catch(err => {
        observer.error(err);
      });

      return () => controller.abort();
    });
  }

  /**
   * Legacy method (uses JSON, kept for compatibility)
   */
  ask(message: string, history: ChatMsg[]): Observable<string> {
    const normalized = norm(message);
    const key = `chat:${normalized}`;

    // 1) FAQ hit -> instant response (<100ms)
    const faqHit = FAQ[normalized];
    if (faqHit) {
      return of(faqHit);
    }

    // 2) localStorage cache (with TTL check)
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          if (age < this.CACHE_TTL) {
            return of(parsed.reply);
          } else {
            localStorage.removeItem(key);
          }
        } catch {
          // Invalid cache, remove it
          localStorage.removeItem(key);
        }
      }
    }

    // 3) Dedupe in-flight requests (if user clicks 2x, only 1 request)
    if (this.inflight.has(key)) {
      return this.inflight.get(key)!;
    }

    // 4) Call API with clamped history



    const req$ = this.askJson(message, history).pipe(
      map(r => r.reply),
      // Retry only on transient errors
      retryWhen(errors =>
        errors.pipe(
          scan((acc, err: HttpErrorResponse) => {
            const status = err?.status || 0;
            const transient = status === 0 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
            if (!transient) throw err;
            if (acc >= 2) throw err; // max 3 attempts total
            return acc + 1;
          }, 0),
          delayWhen((n: number) => timer(400 * Math.pow(2, n))) // 400ms, 800ms exponential backoff
        )
      ),
      tap(reply => {
        // Save to cache (client-side)
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(key, JSON.stringify({
              reply,
              timestamp: Date.now()
            }));
          } catch {
            // localStorage full or disabled, ignore
          }
        }
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('[ChatService] Error:', err);
        return of('Ups… niečo sa pokazilo. Skús to ešte raz o chvíľu.');
      }),
      shareReplay(1)
    );

    // Store in-flight request
    this.inflight.set(key, req$);

    // Clean up after completion
    req$.subscribe({
      complete: () => this.inflight.delete(key),
      error: () => this.inflight.delete(key)
    });

    return req$;
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    if (typeof localStorage !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('chat:')) {
          localStorage.removeItem(key);
        }
      });
    }
    this.inflight.clear();
  }
}
