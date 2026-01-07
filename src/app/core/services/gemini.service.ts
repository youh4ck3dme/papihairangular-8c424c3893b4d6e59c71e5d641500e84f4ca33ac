import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GeminiResponse } from '../models';

@Injectable({
    providedIn: 'root'
})
export class GeminiService {
    private get apiKey(): string {
        return localStorage.getItem('gemini_key') || environment.geminiApiKey;
    }
    private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    /** Generic text generation */
    generateText(prompt: string): Observable<string> {
        if (!this.apiKey) {
            return throwError(() => new Error('Missing Gemini API Key'));
        }
        const body = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };
        return from(fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })).pipe(
            switchMap(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return from(response.json());
            }),
            map((data: GeminiResponse) => {
                return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
            }),
            catchError(err => {
                console.error('Gemini API Error:', err);
                return throwError(() => err);
            })
        );
    }

    /** Image generation (currently not used) */
    generateContentWithImage(prompt: string, imageBase64: string): Observable<string> {
        if (!this.apiKey) {
            return throwError(() => new Error('Missing Gemini API Key'));
        }
        const body = {
            contents: [{
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: imageBase64
                        }
                    }
                ]
            }]
        };
        return from(fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })).pipe(
            switchMap(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return from(response.json());
            }),
            map((data: GeminiResponse) => {
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error('No text in response');
                return text.replace(/```json/g, '').replace(/```/g, '').trim();
            }),
            catchError(err => {
                console.error('Gemini API Error:', err);
                return throwError(() => err);
            })
        );
    }

    /** Helper to force Slovak language in the response */
    generateSlovak(prompt: string): Observable<string> {
        // Prefix the prompt with a clear instruction for Slovak output
        const slovakPrompt = `Prosím, odpovedz v slovenčine. ${prompt}`;
        return this.generateText(slovakPrompt);
    }
}
