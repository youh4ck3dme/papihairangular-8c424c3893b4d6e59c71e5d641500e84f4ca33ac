import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from, timer, race, forkJoin } from 'rxjs';
import { catchError, switchMap, retry, takeUntil } from 'rxjs/operators';
import { OpenAIResponse } from '../models';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

export interface OpenAIImageEditResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  private http = inject(HttpClient);
  private cancelRequests$ = new Subject<void>();

  // Point to the PHP proxy on the same domain (for production)
  private apiUrl = '/proxy/chat.php';

  // OpenAI API direct URL (for development)
  private openaiImageEditUrl = 'https://api.openai.com/v1/images/edits';
  private openaiChatUrl = 'https://api.openai.com/v1/chat/completions';

  // Timeout constants
  private readonly CHAT_TIMEOUT = 20000; // 20 seconds
  private readonly IMAGE_TIMEOUT = 60000; // 60 seconds for image generation

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.cancelRequests$.next();
  }

  /**
   * Generate Slovak response with optimized system prompt and timeout handling
   */
  generateSlovak(
    prompt: string,
    conversationHistory: { role: string; content: string }[] = [],
    abortSignal?: AbortSignal
  ): Observable<OpenAIResponse> {
    // Optimized system prompt (reduced from 2000 to ~800 chars)
    // Optimized premium system prompt
    const systemPrompt = `Si PAPI AI, elitná umelá inteligencia salónu PAPI HAIR DESIGN.
    Tvoja podstata: Jsi stelesnením luxusu, odbornosti a vizionárskeho kaderníckeho umenia.
    Tvoj tón: Sofistikovaný, úctivý, ale autoritatívny v otázkach štýlu. Používaš "My" namiesto "Ja" (reprezentuješ celý tím).
    
    ZÁKLADNÉ PILIERE:
    1. EXKLUZIVITA: Sme "High-End" salón. Nepoužívame lacné riešenia.
    2. ODBORNOSŤ: Používaš terminológiu ako "balayage", "foliage", "face-framing", "texturizácia", "glossing".
    3. VÍZIA: "From Streets to World Stages". Sme mostom medzi košickou scénou a svetovými mólami.

    KĽÚČOVÉ PROTOKOLY:
    - Ak klient nevie, čo chce -> OKAMŽITE odporuč náš VIRTUAL SALON (/virtual-salon) na vizualizáciu.
    - Ak sa klient pýta na cenník -> Uveď orientačnú cenu "od X€" a zdôrazni, že finálna cena závisí od náročnosti a konzultácie.
    - Objednávky -> Smeruj VÝLUČNE na online rezervácie (Bookio) alebo telefón.
    
    INFO BLOK:
    - Adresa: Trieda SNP 61, Košice (pri OC Galéria).
    - Kontakt: +421 949 459 624.
    - Otváracie hodiny: Po-Pi 8:00-17:00.
    
    ŠTÝL KOMUNIKÁCIE:
    Buď stručný, ale nech každá veta má váhu. Vyhýbaj sa prílišnému "chatovaniu". Si asistent, nie kamarát na pokec.`;

    // Truncate conversation history to max 5 messages or 1500 tokens
    const truncatedHistory = this.truncateHistory(conversationHistory, 5, 1500);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...truncatedHistory,
      { role: 'user', content: prompt }
    ];

    // Use direct OpenAI API for production builds
    const useDirectAPI = environment.production || (environment.openaiApiKey && !environment.openaiApiKey.includes('YOUR_'));

    if (useDirectAPI && environment.openaiApiKey) {
      return this.generateDirect(prompt, messages, abortSignal);
    } else {
      return this.generateViaProxy(messages, abortSignal);
    }
  }

  /**
   * Direct OpenAI API call with timeout and abort support
   */
  private generateDirect(
    prompt: string,
    messages: { role: string; content: string }[],
    abortSignal?: AbortSignal
  ): Observable<OpenAIResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${environment.openaiApiKey}`
    });

    const body = {
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 200, // Reduced from 500 for faster responses
      temperature: 0.7,
      stream: false
    };

    // Create abort controller if not provided
    const abortController = abortSignal ? null : new AbortController();
    const signal = abortSignal || (abortController?.signal);

    const requestOptions: Record<string, unknown> = {
      headers,
      observe: 'body' as const
    };
    if (signal) {
      requestOptions.signal = signal;
    }

    const request = this.http.post<OpenAIResponse>(
      this.openaiChatUrl,
      body,
      requestOptions
    ) as unknown as Observable<OpenAIResponse>;

    // Race between request and timeout
    return race(
      request,
      timer(this.CHAT_TIMEOUT).pipe(
        switchMap(() => {
          abortController?.abort();
          return throwError(() => new Error('Request timeout after 20 seconds'));
        })
      )
    ).pipe(
      takeUntil(this.cancelRequests$),
      retry({
        count: 2,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Retry only on network errors or 5xx errors
          if (error?.status >= 500 || error?.status === 0) {
            return timer(1000 * retryCount); // Exponential backoff
          }
          return throwError(() => error);
        }
      }),
      catchError((error: unknown) => {
        console.error('OpenAI API error:', error);
        let errorMessage = '';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        if (errorMessage.includes('abort') || errorMessage.includes('timeout') || errorMessage.includes('zrušená')) {
          return throwError(() => new Error('Požiadavka bola zrušená alebo vypršal časový limit'));
        }
        return throwError(() => new Error('Nepodarilo sa komunikovať s AI. Skúste to prosím znova.'));
      })
    );
  }

  /**
   * PHP Proxy fallback with timeout
   */
  private generateViaProxy(
    messages: { role: string; content: string }[],
    abortSignal?: AbortSignal
  ): Observable<OpenAIResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = { messages };

    const request = this.http.post<OpenAIResponse>(this.apiUrl, body, { headers });

    return race(
      request,
      timer(this.CHAT_TIMEOUT).pipe(
        switchMap(() => throwError(() => new Error('Request timeout')))
      )
    ).pipe(
      takeUntil(this.cancelRequests$),
      catchError((error: HttpErrorResponse) => {
        console.error('Chatbot API error (proxy):', error);
        // Fallback to direct API if proxy fails
        if (environment.openaiApiKey && !environment.openaiApiKey.includes('YOUR_')) {
          const directMessages = messages;
          return this.generateDirect('', directMessages, abortSignal);
        }
        return throwError(() => new Error('Nepodarilo sa komunikovať s chatbot službou'));
      })
    );
  }

  /**
   * Truncate conversation history to fit token limits
   */
  private truncateHistory(
    history: { role: string; content: string }[],
    maxMessages: number,
    maxTokens: number
  ): { role: string; content: string }[] {
    // Take last N messages
    const truncated = history.slice(-maxMessages);

    // Estimate tokens (rough: 1 token ≈ 4 chars)
    let totalChars = truncated.reduce((sum, msg) => sum + msg.content.length, 0);

    // If too long, remove oldest messages
    while (totalChars > maxTokens * 4 && truncated.length > 1) {
      truncated.shift();
      totalChars = truncated.reduce((sum, msg) => sum + msg.content.length, 0);
    }

    return truncated;
  }

  /**
   * Edit image using OpenAI Image Edits API with timeout
   */
  editImage(
    imageBase64: string,
    prompt: string,
    model = 'dall-e-2',
    size = '1024x1024',
    maskBase64?: string,
    abortSignal?: AbortSignal
  ): Observable<OpenAIImageEditResponse> {
    const imageBlob$ = from(this.base64ToBlob(imageBase64));
    const maskBlob$ = maskBase64 ? from(this.base64ToBlob(maskBase64)) : from(Promise.resolve(null));

    const request$ = forkJoin({
      image: imageBlob$,
      mask: maskBlob$
    }).pipe(
      switchMap(({ image, mask }) => {
        const formData = new FormData();
        formData.append('image', image, 'image.png');
        if (mask) {
          formData.append('mask', mask, 'mask.png');
        }
        formData.append('prompt', prompt);
        formData.append('model', model);
        formData.append('n', '1');
        formData.append('size', size);

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${environment.openaiApiKey}`
        });

        const abortController = abortSignal ? null : new AbortController();
        const signal = abortSignal || (abortController?.signal);

        const requestOptions: Record<string, unknown> = {
          headers,
          observe: 'body' as const
        };
        if (signal) {
          requestOptions.signal = signal;
        }

        return this.http.post<OpenAIImageEditResponse>(
          this.openaiImageEditUrl,
          formData,
          requestOptions
        );
      }),
      takeUntil(this.cancelRequests$),
      catchError((error: HttpErrorResponse) => {
        console.error('OpenAI Image Edit API error:', error);
        const errorMsg = error.error?.error?.message || 'Nepodarilo sa upraviť obrázok';
        return throwError(() => new Error(errorMsg));
      })
    );

    return race(
      request$,
      timer(this.IMAGE_TIMEOUT).pipe(
        switchMap(() => throwError(() => new Error('Image generation timeout after 60 seconds')))
      )
    );
  }

  /**
   * Analyze image using GPT-4o Vision capabilities
   */
  analyzeImage(
    base64Image: string,
    prompt: string
  ): Observable<OpenAIResponse> {
    return from(this.getOpenAICompatibleBase64(base64Image)).pipe(
      switchMap(safeBase64 => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${environment.openaiApiKey}`
        });

        const body = {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: safeBase64,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        };

        const options = {
          headers: headers,
          transferCache: false
        };

        return this.http.post<OpenAIResponse>(
          this.openaiChatUrl,
          body,
          options
        );
      }),
      takeUntil(this.cancelRequests$),
      catchError((error: unknown) => {
        console.error('OpenAI Vision API error:', error);
        return throwError(() => new Error('Nepodarilo sa analyzovať obrázok. Skúste to prosím znova.'));
      })
    );
  }

  /**
   * Helper to ensure image is PNG and within size limits, returning base64
   */
  async getOpenAICompatibleBase64(base64: string): Promise<string> {
    const blob = await this.base64ToBlob(base64);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Convert base64 data URL to PNG Blob (converts JPEG/WEBP to PNG)
   * Also validates size is under 4MB as required by OpenAI
   */
  private async base64ToBlob(base64: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas with image dimensions
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Draw image to canvas (this converts any format to raw pixels)
        ctx.drawImage(img, 0, 0);

        // Convert to PNG blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to PNG'));
            return;
          }

          // Check size (4MB limit for OpenAI)
          if (blob.size > 4 * 1024 * 1024) {
            // Try to resize if too large
            const scale = Math.sqrt((4 * 1024 * 1024) / blob.size);
            canvas.width = Math.floor(img.width * scale);
            canvas.height = Math.floor(img.height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((resizedBlob) => {
              if (!resizedBlob) {
                reject(new Error('Failed to resize image'));
                return;
              }
              resolve(resizedBlob);
            }, 'image/png');
          } else {
            resolve(blob);
          }
        }, 'image/png');
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for conversion'));
      };

      // Set image source (handles both data URLs and raw base64)
      img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    });
  }
}
