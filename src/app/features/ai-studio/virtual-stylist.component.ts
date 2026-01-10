import { Component, signal, ViewChild, ElementRef, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HAIRSTYLES, Hairstyle, TutorialStep, STYLE_CATEGORIES, StyleCategory } from '../../core/models/stylist.models';
import { AiVisageService, FaceAnalysis } from '../../core/services/ai-visage.service';

@Component({
    selector: 'app-virtual-stylist',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './virtual-stylist.component.html',
    styleUrls: ['./virtual-stylist.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualStylistComponent {
    private aiService = inject(AiVisageService);

    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('categoryNav') categoryNav!: ElementRef<HTMLElement>;

    // States
    currentStep = signal<TutorialStep>('welcome');
    userImage = signal<string | null>(null);
    selectedStyle = signal<Hairstyle | null>(null);
    resultImage = signal<string | null>(null);
    isProcessing = signal<boolean>(false);
    isCameraActive = signal<boolean>(false);
    showOriginal = signal<boolean>(false);

    // New Analysis State
    analysis = signal<FaceAnalysis | undefined>(undefined);

    // Feedback
    generationTime = signal<number | null>(null);
    cameraError = signal<string | null>(null);

    // Logic
    categories = STYLE_CATEGORIES;
    activeCategory = signal<StyleCategory>('Klasika');

    filteredStyles = computed(() =>
        HAIRSTYLES.filter(style => style.category === this.activeCategory())
    );

    start() {
        // Only transition to 'upload' from the initial 'welcome' step
        if (this.currentStep() === 'welcome') {
            this.currentStep.set('upload');
        }
    }

    setCategory(category: StyleCategory) {
        this.activeCategory.set(category);
    }

    scrollCategories(direction: 'left' | 'right') {
        if (!this.categoryNav) return;
        const scrollAmount = 150;
        const currentScroll = this.categoryNav.nativeElement.scrollLeft;
        this.categoryNav.nativeElement.scrollTo({
            left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }

    async activateCamera() {
        this.cameraError.set(null);
        // Guard against environments where navigator.mediaDevices may throw when accessed
        let mediaDevices: MediaDevices | null = null;
        try {
            mediaDevices = navigator.mediaDevices;
        } catch {
            this.cameraError.set('Zariadenie nepodporuje kameru.');
            return;
        }
        if (!mediaDevices?.getUserMedia) {
            this.cameraError.set('Zariadenie nepodporuje kameru.');
            return;
        }

        try {
            const stream = await mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            await this.handleStream(stream);
        } catch (err) {
            console.error('Camera error (primary):', err);
            try {
                const fallback = await mediaDevices.getUserMedia({ video: true });
                await this.handleStream(fallback);
            } catch (fallbackErr) {
                console.error('Camera error (fallback):', fallbackErr);
                this.cameraError.set('Prístup ku kamere bol zamietnutý alebo kamera chýba.');
                this.isCameraActive.set(false);
            }
        }
    }

    private async handleStream(stream: MediaStream) {
        // Wait for video element to be available (important for mobile)
        let attempts = 0;
        while (!this.videoElement && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (!this.videoElement) {
            console.error('Video element not available after waiting');
            this.cameraError.set('Chyba pri inicializácii kamery.');
            return;
        }

        try {
            const video = this.videoElement.nativeElement;
            video.srcObject = stream;

            // Explicitly play the video (required on some mobile browsers)
            await video.play();

            this.isCameraActive.set(true);
            console.log('Camera stream activated successfully');
        } catch (err) {
            console.error('Error playing video stream:', err);
            this.cameraError.set('Nepodarilo sa spustiť video stream.');
        }
    }

    capturePhoto() {
        const canvas = this.canvasElement?.nativeElement;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext('2d');
        // Guard against missing canvas context methods
        if (!ctx) {
            return;
        }
        // If video element is present, use its dimensions; otherwise fall back to defaults
        const video = this.videoElement?.nativeElement;
        const width = video?.videoWidth || 640;
        const height = video?.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        // Ensure translate and scale exist before using them
        if (typeof ctx.translate === 'function') {
            ctx.translate(canvas.width, 0);
        }
        if (typeof ctx.scale === 'function') {
            ctx.scale(-1, 1);
        }
        if (video && typeof ctx.drawImage === 'function') {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        this.userImage.set(canvas.toDataURL('image/jpeg', 0.95));
        this.stopCamera();
        this.currentStep.set('selection');
    }

    stopCamera() {
        const stream = this.videoElement?.nativeElement?.srcObject as MediaStream;
        stream?.getTracks().forEach(t => t.stop());
        if (this.videoElement) this.videoElement.nativeElement.srcObject = null;
        this.isCameraActive.set(false);
    }

    handleFileUpload(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.userImage.set(e.target?.result as string);
                this.currentStep.set('selection');
            };
            reader.readAsDataURL(file);
        }
    }

    selectStyle(style: Hairstyle) {
        this.selectedStyle.set(style);
    }

    async generateMagic() {
        const style = this.selectedStyle();
        if (!style) return;
        // Ensure we have a user image before invoking AI service
        if (!this.userImage()) {
            // No image to process – do not call AI service
            return;
        }

        this.isProcessing.set(true);
        this.analysis.set(undefined); // Reset previous analysis

        try {
            const result = await this.aiService.generateLook(style.prompt, this.userImage()!);
            if (result && result.imageUrl) {
                this.resultImage.set(result.imageUrl);
                this.generationTime.set(result.analysisTime);
                if (result.analysis) {
                    this.analysis.set(result.analysis);
                }
                this.currentStep.set('finished');
            } else {
                // Gracefully handle missing result
                this.resultImage.set(null);
            }
        } catch {
            alert('Digitálna analýza zlyhala. Skúste to neskôr.');
        } finally {
            this.isProcessing.set(false);
        }
    }

    downloadImage() {
        if (!this.resultImage()) return;
        const link = document.createElement('a');
        link.href = this.resultImage()!;
        link.download = `papi-transformation.jpg`;
        link.click();
    }

    reset() {
        this.stopCamera();
        this.userImage.set(null);
        this.selectedStyle.set(null);
        this.resultImage.set(null);
        this.currentStep.set('welcome');
        this.analysis.set(undefined);
        // Clear additional state used in tests
        this.isProcessing.set(false);
        this.cameraError.set('');
        this.activeCategory.set('Klasika');
    }
}
