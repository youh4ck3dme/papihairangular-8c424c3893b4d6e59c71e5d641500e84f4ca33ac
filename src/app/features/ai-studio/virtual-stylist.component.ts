
import { Component, signal, ViewChild, ElementRef, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HAIRSTYLES, Hairstyle, TutorialStep, STYLE_CATEGORIES, StyleCategory } from '../../core/models/stylist.models';
import { AiVisageService } from '../../core/services/ai-visage.service';

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
        this.currentStep.set('upload');
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
        if (!navigator.mediaDevices?.getUserMedia) {
            this.cameraError.set('Zariadenie nepodporuje kameru.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            this.handleStream(stream);
        } catch {
            try {
                const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
                this.handleStream(fallback);
            } catch {
                this.cameraError.set('Prístup ku kamere bol zamietnutý alebo kamera chýba.');
                this.isCameraActive.set(false);
            }
        }
    }

    private handleStream(stream: MediaStream) {
        if (this.videoElement) {
            this.videoElement.nativeElement.srcObject = stream;
            this.isCameraActive.set(true);
        }
    }

    capturePhoto() {
        const video = this.videoElement.nativeElement;
        const canvas = this.canvasElement.nativeElement;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            this.userImage.set(canvas.toDataURL('image/jpeg', 0.95));
            this.stopCamera();
            this.currentStep.set('selection');
        }
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

        this.isProcessing.set(true);
        try {
            const result = await this.aiService.generateLook(style.prompt, this.userImage() || undefined);
            this.resultImage.set(result.imageUrl);
            this.generationTime.set(result.analysisTime);
            this.currentStep.set('finished');
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
    }
}
