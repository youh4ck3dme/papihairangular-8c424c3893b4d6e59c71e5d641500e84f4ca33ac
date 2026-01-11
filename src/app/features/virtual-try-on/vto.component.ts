import { Component, ElementRef, ViewChild, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { ThemeService } from '../../core/services/theme.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

// Rozhrania pre typovú bezpečnosť
interface HairStyleRecommendation {
    id: string;
    name: string;
    description: string;
    imageUrl: string; // URL transparentného PNG účesu na prekrytie
    tags: string[];
}



interface TrendInspiration {
    title: string;
    occasion: string;
    imageUrl: string;
}

@Component({
    selector: 'app-vto',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './vto.component.html',
    styleUrls: ['./vto.component.css'],
    providers: [
        // GeminiService // Use real service
    ]
})
export class VtoComponent implements AfterViewInit {
    // --- Injections ---
    private geminiService = inject(GeminiService);
    public themeService = inject(ThemeService);

    // --- View Children ---
    @ViewChild('canvasPreview', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;


    // --- State Signals ---
    isLoading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);
    activeSection = signal<'analysis' | 'trends'>('analysis');

    // Image Analysis State
    uploadedImageBase64 = signal<string | null>(null);
    recommendations = signal<HairStyleRecommendation[]>([]);
    activeOverlayStyle = signal<string | null>(null); // URL aktuálne skúšaného účesu
    generatedImageUrl = signal<string | null>(null); // URL vygenerovaného obrázka z Replicate

    // Chat State


    // Trends State
    trendInspirations = signal<TrendInspiration[]>([]);

    // Canvas Context
    private ctx!: CanvasRenderingContext2D | null;
    private baseImage = new Image();

    // --- Lock & Countdown State ---
    isLocked = signal<boolean>(true);
    lockPassword = signal<string>('');
    private unlockDate = new Date('2026-01-01T00:00:00');
    remainingTime = signal<string>('');


    constructor() {


        // Načítanie úvodných trendov pri štarte
        this.loadTrends('current season');


        // Initialize countdown timer
        this.updateRemainingTime();
        setInterval(() => this.updateRemainingTime(), 1000);
    }

    ngAfterViewInit(): void {
        // Inicializácia canvasu
        this.ctx = this.canvasRef.nativeElement.getContext('2d');
    }

    private updateRemainingTime(): void {
        const now = new Date();
        const diff = this.unlockDate.getTime() - now.getTime();
        if (diff <= 0) {
            this.isLocked.set(false);
            this.remainingTime.set('');
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        this.remainingTime.set(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }

    checkPassword(): void {
        const correct = '23513900';
        if (this.lockPassword().trim() === correct) {
            this.isLocked.set(false);
            this.errorMessage.set(null);
        } else {
            this.errorMessage.set('Nesprávne heslo.');
        }
    }


    // ==========================================
    // IDEA 1: AI Analýza & Osobné Odporúčania
    // ==========================================

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        if (!file.type.startsWith('image/')) {
            this.showError("Prosím, nahrajte obrázok (JPEG/PNG).");
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set(null);
        this.recommendations.set([]);
        this.activeOverlayStyle.set(null);
        this.generatedImageUrl.set(null); // Reset generated image

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const base64Result = e.target?.result as string;
            this.uploadedImageBase64.set(base64Result);

            // Načítanie obrázka pre Canvas
            this.baseImage.onload = () => {
                this.drawBaseImage();
                // Spustenie Gemini analýzy po načítaní obrázka
                this.analyzeFaceWithGemini(base64Result);
            };
            this.baseImage.src = base64Result;
        };
        reader.onerror = () => this.showError("Chyba pri čítaní súboru.");
        reader.readAsDataURL(file);
    }

    private drawBaseImage(): void {
        if (!this.ctx || !this.canvasRef) return;
        const canvas = this.canvasRef.nativeElement;
        // Nastavenie rozmerov canvasu podľa obrázka (s max šírkou pre responzivitu)
        const maxWidth = 600;
        const scale = Math.min(1, maxWidth / this.baseImage.width);
        canvas.width = this.baseImage.width * scale;
        canvas.height = this.baseImage.height * scale;

        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ctx.drawImage(this.baseImage, 0, 0, canvas.width, canvas.height);
    }

    private analyzeFaceWithGemini(fullBase64: string): void {
        // Odstránenie prefixu data:image/... pre Gemini API ak je to potrebné
        const base64Data = fullBase64.split(',')[1];

        const prompt = `Analyze this face image for hairstyle recommendations. Based on face shape, skin tone, and apparent hair type, suggest 3 distinct hairstyles (e.g., short, medium, long or specific cuts like 'Bob', 'Pixie').
    Return ONLY a JSON array of objects. Each object must have: "name", "description", and a list of "tags". Do not include markdown formatting like \`\`\`json. Example: [{"name": "Textured Bob", "description": "...", "tags": ["short", "wavy"]}]`;

        // POZNÁMKA: Toto predpokladá, že geminiService má metódu generateContentWithImage
        this.geminiService.generateContentWithImage(prompt, base64Data)
            .pipe(
                catchError((err: unknown) => {
                    this.showError("Nepodarilo sa analyzovať obrázok cez AI. Skúste to prosím neskôr.");
                    console.error('Gemini Error:', err);
                    return of(null);
                }),
                finalize(() => this.isLoading.set(false))
            )
            .subscribe((response: string | null) => {
                if (response) {
                    try {
                        // Pokus o parsovanie JSON odpovede od Gemini
                        const sanitizedResponse: string = response.replace(/```json/g, '').replace(/```/g, '').trim();
                        const recommendationsJson: { name: string; description: string; tags?: string[] }[] = JSON.parse(sanitizedResponse);

                        // Mapovanie na naše rozhranie + pridanie mock obrázkov pre overlay
                        // V reálnej aplikácii by ste tu použili skutočné URL vašich transparentných PNG účesov
                        const mappedRecs: HairStyleRecommendation[] = recommendationsJson.map((rec, index) => ({
                            id: `rec-${index}`,
                            name: rec.name,
                            description: rec.description,
                            // MOCK URLs - Nahraďte skutočnými cestami k transparentným PNG
                            imageUrl: index === 0 ? 'assets/mock/hair-overlay-short.webp' :
                                index === 1 ? 'assets/mock/hair-overlay-medium.webp' :
                                    'assets/mock/hair-overlay-long.webp',
                            tags: rec.tags || []
                        }));
                        this.recommendations.set(mappedRecs);

                    } catch (e) {
                        this.showError("Chyba pri spracovaní AI odporúčaní. Skúste iný obrázok.");
                        console.error('JSON Parse Error:', e, response);
                    }
                }
            });
    }

    // Funkcia pre virtuálne vyskúšanie (Generovanie cez Gemini - ak podporuje, inak placeholder)
    tryOnStyle(style: HairStyleRecommendation): void {
        if (!this.uploadedImageBase64()) {
            this.showError("Najprv nahrajte fotku tváre.");
            return;
        }

        this.isLoading.set(true);
        this.activeOverlayStyle.set(style.id);
        this.generatedImageUrl.set(null);

        // Gemini 2.0 Flash (v tejto verzii) primárne analyzuje.
        // Pre generovanie obrázkov by sme potrebovali Imagen model.
        // Keďže používateľ chcel prejsť na Gemini a odstrániť Replicate,
        // zatiaľ tu necháme placeholder alebo logiku pre Gemini Image Generation ak bude dostupná.

        // Pre demo účely a splnenie požiadavky "odstrániť ostatné API":
        // Simulujeme proces, alebo použijeme Gemini na textový popis zmeny (čo nie je obrázok).

        // TODO: Implementovať Gemini Image Generation keď bude dostupné API.
        // Zatiaľ zobrazíme pôvodný obrázok s overlayom (ak by sme mali overlaye)
        // alebo len informujeme používateľa.

        setTimeout(() => {
            this.isLoading.set(false);
            // Tu by sme nastavili URL vygenerovaného obrázka
            // this.generatedImageUrl.set(fakeUrl);
            this.showError("Generovanie obrázkov cez Gemini zatiaľ nie je implementované (vyžaduje Imagen model).");
        }, 1500);
    }





    // ==========================================
    // IDEA 3: Trendové Predpovede
    // ==========================================

    loadTrends(occasion: string): void {
        // V reálnej aplikácii by toto volalo Gemini pre dynamické trendy na základe dátumu/sezóny
        // Pre ukážku použijeme statické mock dáta, ktoré simulujú AI výstup

        this.isLoading.set(true);
        // Simulácia API volania
        setTimeout(() => {
            const mockTrends: TrendInspiration[] = [
                { title: 'Svadobná Romantika 2025', occasion: 'wedding', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop' },
                { title: 'Elegantný Business Look', occasion: 'work', imageUrl: 'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?q=80&w=600&auto=format&fit=crop' },
                { title: 'Letné Festivalové Vlny', occasion: 'summer', imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop' },
                { title: 'Moderný Shag', occasion: 'trendy', imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=600&auto=format&fit=crop' },
            ];

            // Filter podľa príležitosti ak je zadaná (rozšírenie funkionality)
            const filtered = occasion === 'all' ? mockTrends : mockTrends;

            this.trendInspirations.set(filtered);
            this.isLoading.set(false);
        }, 1000);

        /* Reálna Gemini implementácia by vyzerala takto:
        const prompt = `What are the top 3 trending hairstyles for ${occasion} in the current season? Return JSON array with title, occasion, and a descriptive image query string.`;
        this.geminiService.generateText(prompt).subscribe(...)
        */
    }


    // ==========================================
    // Pomocné Funkcie (Ukladanie, UI)
    // ==========================================

    saveToFavorites(style: HairStyleRecommendation): void {
        // Jednoduché ukladanie do localStorage
        try {
            const currentFavoritesStr = localStorage.getItem('papi_favorites');
            const favorites: HairStyleRecommendation[] = currentFavoritesStr ? JSON.parse(currentFavoritesStr) : [];

            if (!favorites.some(f => f.id === style.id)) {
                favorites.push(style);
                localStorage.setItem('papi_favorites', JSON.stringify(favorites));
                alert(`Účes "${style.name}" bol uložený do obľúbených!`);
            } else {
                alert(`Tento účes už máte v obľúbených.`);
            }
        } catch (e) {
            console.error('Error saving to localStorage', e);
            this.showError("Nepodarilo sa uložiť do obľúbených.");
        }
    }

    triggerFileUpload(): void {
        document.getElementById('fileInput')?.click();
    }

    resetVTO(): void {
        this.uploadedImageBase64.set(null);
        this.recommendations.set([]);
        this.activeOverlayStyle.set(null);
        if (this.ctx && this.canvasRef) {
            this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        }
    }

    private showError(msg: string): void {
        this.errorMessage.set(msg);
        // Auto-hide error after 5 seconds
        setTimeout(() => this.errorMessage.set(null), 5000);
    }
}
