import { Component, ElementRef, ViewChild, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService } from '../../core/services/image.service';
import { ThemeService } from '../../core/services/theme.service';
import { finalize, takeUntil, catchError } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

interface HairstylePreset {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}

@Component({
  selector: 'app-virtual-salon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './virtual-salon.component.html',
  styleUrls: ['./virtual-salon.component.css']
})
export class VirtualSalonComponent implements OnDestroy {
  // --- Injections ---
  private imageService = inject(ImageService);
  public themeService = inject(ThemeService);
  private destroy$ = new Subject<void>();

  // --- View Children ---
  @ViewChild('videoElement') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasRef!: ElementRef<HTMLCanvasElement>;

  // --- State Signals ---
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Camera State
  cameraActive = signal<boolean>(false);
  cameraPermissionDenied = signal<boolean>(false);
  private mediaStream: MediaStream | null = null;

  // Captured Image State
  capturedImageBase64 = signal<string | null>(null);
  resultImageUrl = signal<string | null>(null);

  // AI Settings
  selectedModel = signal<string>('gpt-image-1');
  customPrompt = signal<string>('');
  selectedPreset = signal<string | null>(null);

  // Hairstyle Presets
  readonly hairstylePresets: HairstylePreset[] = [
    { id: 'blonde-bob', name: 'Blond Bob', prompt: 'Change the hair to a stylish blonde bob cut', icon: '👱‍♀️' },
    { id: 'pink-mohawk', name: 'Ružový Mohawk', prompt: 'Change the hair to a vibrant pink mohawk hairstyle', icon: '🦄' },
    { id: 'brunette-waves', name: 'Hnedé Vlny', prompt: 'Change the hair to long brunette wavy hair', icon: '👩‍🦱' },
    { id: 'red-curly', name: 'Červené Kučery', prompt: 'Change the hair to curly red hair', icon: '🧑‍🦰' },
    { id: 'silver-pixie', name: 'Strieborný Pixie', prompt: 'Change the hair to a short silver pixie cut', icon: '🧓' },
    { id: 'black-straight', name: 'Čierne Rovné', prompt: 'Change the hair to long straight black hair', icon: '🧑‍🦳' },
    { id: 'ombre', name: 'Ombre Efekt', prompt: 'Add beautiful ombre effect to the hair, transitioning from dark roots to light ends', icon: '🎨' },
    { id: 'balayage', name: 'Balayage', prompt: 'Apply professional balayage highlights to the hair', icon: '✨' }
  ];

  // Available Models (GPT Image 1 only - DALL-E 2 requires mask for edits)
  readonly availableModels = [
    { id: 'gpt-image-1', name: 'GPT Image 1', description: 'Najnovší AI model' }
  ];



  ngOnDestroy(): void {
    this.stopCamera();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================
  // WEBCAM FUNCTIONS
  // ==========================================

  async startCamera(): Promise<void> {
    try {
      this.errorMessage.set(null);
      this.cameraPermissionDenied.set(false);

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera for selfies
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.videoRef?.nativeElement) {
        this.videoRef.nativeElement.srcObject = this.mediaStream;
        this.videoRef.nativeElement.play();
        this.cameraActive.set(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      if ((error as Error).name === 'NotAllowedError') {
        this.cameraPermissionDenied.set(true);
        this.showError('Prístup ku kamere bol zamietnutý. Prosím povoľte kameru v nastaveniach prehliadača.');
      } else {
        this.showError('Nepodarilo sa získať prístup ku kamere. Skontrolujte, či máte kameru pripojenú.');
      }
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.srcObject = null;
    }
    this.cameraActive.set(false);
  }

  capturePhoto(): void {
    if (!this.videoRef?.nativeElement || !this.canvasRef?.nativeElement) {
      this.showError('Kamera nie je pripravená.');
      return;
    }

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      this.showError('Nepodarilo sa inicializovať canvas.');
      return;
    }

    // Set canvas to square (1024x1024 for OpenAI)
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 1024;
    canvas.height = 1024;

    // Calculate crop to center the face
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;

    // Draw cropped and scaled image
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, 1024, 1024);

    // Convert to base64 PNG
    const base64 = canvas.toDataURL('image/png');
    this.capturedImageBase64.set(base64);
    this.resultImageUrl.set(null);

    // Stop camera after capture
    this.stopCamera();

    this.showSuccess('Fotka zachytená! Vyberte si účes alebo napíšte vlastný popis.');
  }

  retakePhoto(): void {
    this.capturedImageBase64.set(null);
    this.resultImageUrl.set(null);
    this.selectedPreset.set(null);
    this.customPrompt.set('');
    this.startCamera();
  }

  // ==========================================
  // AI HAIRSTYLE FUNCTIONS
  // ==========================================

  selectPreset(preset: HairstylePreset): void {
    this.selectedPreset.set(preset.id);
    this.customPrompt.set(preset.prompt);
  }

  generateHairstyle(): void {
    const imageBase64 = this.capturedImageBase64();
    const prompt = this.customPrompt().trim();

    if (!imageBase64) {
      this.showError('Najprv odfotťe svoju tvár.');
      return;
    }

    if (!prompt) {
      this.showError('Vyberte si účes alebo napíšte vlastný popis.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.resultImageUrl.set(null);

    // LEVEL 3: Create job (non-blocking)
    this.imageService.createJob(imageBase64, prompt, this.selectedModel())
      .pipe(
        catchError(err => {
          console.error('[VirtualSalon] Create job error:', err);
          this.showError('Nepodarilo sa vytvoriť úlohu. Skúste to znova.');
          this.isLoading.set(false);
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (!result) return;

        const { jobId } = result;
        console.log('[VirtualSalon] Job created:', jobId);

        // Poll job status
        this.imageService.pollJob(jobId)
          .pipe(
            finalize(() => this.isLoading.set(false)),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (job) => {
              if (job.status === 'done' && job.url) {
                this.resultImageUrl.set(job.url);
                this.showSuccess('Nový účes bol vygenerovaný!');
              } else if (job.status === 'error') {
                this.showError(job.error || 'Nepodarilo sa vygenerovať nový účes.');
              } else if (job.status === 'running') {
                // Update UI to show progress
                console.log('[VirtualSalon] Job running...');
              }
            },
            error: (error) => {
              console.error('[VirtualSalon] Poll error:', error);
              this.showError('Nepodarilo sa získať status úlohy. Skúste to znova.');
            }
          });
      });
  }

  downloadResult(): void {
    const resultUrl = this.resultImageUrl();
    if (!resultUrl) return;

    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `papi-virtual-salon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  resetAll(): void {
    this.stopCamera();
    this.capturedImageBase64.set(null);
    this.resultImageUrl.set(null);
    this.selectedPreset.set(null);
    this.customPrompt.set('');
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 5000);
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}

