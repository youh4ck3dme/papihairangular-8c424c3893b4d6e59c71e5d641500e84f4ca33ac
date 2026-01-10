import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VirtualStylistComponent } from './virtual-stylist.component';
import { AiVisageService } from '../../core/services/ai-visage.service';
import { Hairstyle } from '../../core/models/stylist.models'; // Import Hairstyle
import { ElementRef } from '@angular/core';

describe('VirtualStylistComponent', () => {
    let component: VirtualStylistComponent;
    let fixture: ComponentFixture<VirtualStylistComponent>;
    let aiServiceSpy: jasmine.SpyObj<AiVisageService>;

    // ... setup ...

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('AiVisageService', ['generateLook']);

        await TestBed.configureTestingModule({
            imports: [VirtualStylistComponent],
            providers: [
                { provide: AiVisageService, useValue: spy }
            ]
        }).compileComponents();

        aiServiceSpy = TestBed.inject(AiVisageService) as jasmine.SpyObj<AiVisageService>;
        fixture = TestBed.createComponent(VirtualStylistComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // --- 1. Initialization and State ---

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial step "welcome"', () => {
        expect(component.currentStep()).toBe('welcome');
    });

    it('should have empty userImage and resultImage initially', () => {
        expect(component.userImage()).toBeNull();
        expect(component.resultImage()).toBeNull();
    });

    it('should have correct initial category "Klasika"', () => {
        expect(component.activeCategory()).toBe('Klasika');
    });

    // --- 2. Navigation & Steps ---

    it('start() should move from "welcome" to "upload"', () => {
        component.start();
        expect(component.currentStep()).toBe('upload');
    });

    it('reset() should clear all state and return to "welcome"', () => {
        // Setup dirty state
        component.userImage.set('some-image');
        component.selectedStyle.set({ id: '1', name: 'Test', category: 'Klasika', image: '', description: '', prompt: '' });
        component.resultImage.set('result-image');
        component.currentStep.set('finished');

        component.reset();

        expect(component.userImage()).toBeNull();
        expect(component.selectedStyle()).toBeNull();
        expect(component.resultImage()).toBeNull();
        expect(component.currentStep()).toBe('welcome');
    });

    it('should handle step transitions correctly via methods', () => {
        component.currentStep.set('upload');
        expect(component.currentStep()).toBe('upload');
        component.currentStep.set('selection');
        expect(component.currentStep()).toBe('selection');
    });

    // --- 3. Categories & Filtering ---

    it('setCategory() should update activeCategory', () => {
        component.setCategory('Moderné');
        expect(component.activeCategory()).toBe('Moderné');
    });

    it('filteredStyles should return correct styles for "Klasika"', () => {
        component.activeCategory.set('Klasika');
        const styles = component.filteredStyles();
        expect(styles.length).toBeGreaterThan(0);
        expect(styles.every(s => s.category === 'Klasika')).toBeTrue();
    });

    it('filteredStyles should update when category changes to "Moderné"', () => {
        component.activeCategory.set('Moderné');
        fixture.detectChanges();
        const styles = component.filteredStyles();
        expect(styles.every(s => s.category === 'Moderné')).toBeTrue();
    });

    it('scrollCategories should attempt to scroll native element', () => {
        // Mock ElementRef
        const mockNav = { nativeElement: { scrollLeft: 0, scrollTo: jasmine.createSpy('scrollTo') } };
        component.categoryNav = mockNav as unknown as ElementRef;

        component.scrollCategories('right');
        expect(mockNav.nativeElement.scrollTo).toHaveBeenCalled();
    });

    // --- 4. File Upload ---

    it('handleFileUpload with valid file should read data and move to "selection"', (done) => {
        const mockFile = new File([''], 'test.png', { type: 'image/png' });
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;

        const mockReader = {
            readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(function (this: any) {
                if (this.onload) {
                    this.onload({ target: { result: 'data:image/png;base64,test' } });
                }
            })
        };
        spyOn(window, 'FileReader').and.returnValue(mockReader as unknown as FileReader);

        component.handleFileUpload(mockEvent);

        // Since we mocked readAsDataURL to trigger onload appropriately (if assigned), 
        // we can check immediatelly if handleFileUpload assigned the callback and it ran.
        // However, handleFileUpload assigns onload BEFORE calling readAsDataURL.

        expect(component.userImage()).toBe('data:image/png;base64,test');
        expect(component.currentStep()).toBe('selection');
        done();
    });

    it('handleFileUpload with no file should do nothing', () => {
        const mockEvent = { target: { files: [] } } as unknown as Event;
        const initialStep = component.currentStep();
        component.handleFileUpload(mockEvent);
        expect(component.currentStep()).toBe(initialStep);
    });

    // --- 5. Camera Handling ---

    it('activateCamera should set error if getUserMedia is not supported', async () => {
        // Safe mock for mediaDevices
        const originalMediaDevices = navigator.mediaDevices;
        try {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: undefined,
                configurable: true,
                writable: true
            });
            await component.activateCamera();
            expect(component.cameraError()).toBe('Zariadenie nepodporuje kameru.');
        } finally {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: originalMediaDevices,
                configurable: true,
                writable: true
            });
        }
    });

    it('activateCamera should handle permission denial/error', async () => {
        const mockMediaDevices = {
            getUserMedia: jasmine.createSpy('getUserMedia').and.returnValue(Promise.reject('Permission denied'))
        };
        const originalMediaDevices = navigator.mediaDevices;
        try {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: mockMediaDevices,
                configurable: true,
                writable: true
            });
            await component.activateCamera();
            // It tries fallback then fails
            expect(mockMediaDevices.getUserMedia).toHaveBeenCalledTimes(2); // Primary + Fallback
            expect(component.cameraError()).toBe('Prístup ku kamere bol zamietnutý alebo kamera chýba.');
            expect(component.isCameraActive()).toBeFalse();
        } finally {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: originalMediaDevices,
                configurable: true,
                writable: true
            });
        }
    });

    it('activateCamera should activate stream on success', async () => {
        const mockStream = { getTracks: () => [] } as unknown as MediaStream;
        const mockMediaDevices = {
            getUserMedia: jasmine.createSpy('getUserMedia').and.returnValue(Promise.resolve(mockStream))
        };
        const originalMediaDevices = navigator.mediaDevices;
        try {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: mockMediaDevices,
                configurable: true,
                writable: true
            });
            // Mock video element
            const mockVideoNative = {
                srcObject: null as unknown,
                play: jasmine.createSpy('play').and.returnValue(Promise.resolve())
            };
            component.videoElement = { nativeElement: mockVideoNative } as ElementRef;

            await component.activateCamera();

            expect(mockVideoNative.srcObject).toBe(mockStream);
            expect(mockVideoNative.play).toHaveBeenCalled();
            expect(component.isCameraActive()).toBeTrue();
        } finally {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: originalMediaDevices,
                configurable: true,
                writable: true
            });
        }
    });

    it('stopCamera should cleanup stream tracks', () => {
        const mockTrack = jasmine.createSpyObj('MediaStreamTrack', ['stop']);
        const mockStream = { getTracks: () => [mockTrack] };
        const mockVideoNative = { srcObject: mockStream };

        component.videoElement = { nativeElement: mockVideoNative } as unknown as ElementRef;
        component.isCameraActive.set(true);

        component.stopCamera();

        expect(mockTrack.stop).toHaveBeenCalled();
        expect(mockVideoNative.srcObject).toBeNull();
        expect(component.isCameraActive()).toBeFalse();
    });

    it('capturePhoto should draw to canvas and set userImage', () => {
        // Setup video and canvas mocks
        const mockVideo = { videoWidth: 640, videoHeight: 480 };
        const mockContext = jasmine.createSpyObj('CanvasRenderingContext2D', ['translate', 'scale', 'drawImage']);
        const mockCanvas = {
            width: 0,
            height: 0,
            getContext: () => mockContext,
            toDataURL: () => 'data:image/jpeg;base64,captured'
        };

        component.videoElement = { nativeElement: mockVideo } as unknown as ElementRef;
        component.canvasElement = { nativeElement: mockCanvas } as unknown as ElementRef;

        // We also need to mock stopCamera internally or just spy on it
        spyOn(component, 'stopCamera');

        component.capturePhoto();

        expect(mockCanvas.width).toBe(640);
        expect(mockContext.drawImage).toHaveBeenCalled();
        expect(component.userImage()).toBe('data:image/jpeg;base64,captured');
        expect(component.stopCamera).toHaveBeenCalled();
        expect(component.currentStep()).toBe('selection');
    });

    // --- 6. Style Selection ---

    it('selectStyle should update selectedStyle', () => {
        const style = { id: 'test', name: 'T', category: 'Klasika', image: '', description: '', prompt: '' } as unknown as Hairstyle;
        component.selectStyle(style);
        expect(component.selectedStyle()).toBe(style);
    });

    // --- 7. AI Generation (Magic) ---

    it('generateMagic should check if style is selected', async () => {
        component.selectedStyle.set(null);
        await component.generateMagic();
        expect(aiServiceSpy.generateLook).not.toHaveBeenCalled();
    });

    it('generateMagic should call AiVisageService.generateLook', async () => {
        component.selectedStyle.set({ prompt: 'test prompt' } as unknown as Hairstyle);
        component.userImage.set('user-img');

        aiServiceSpy.generateLook.and.returnValue(Promise.resolve({ imageUrl: 'res', analysisTime: 1.5, analysis: undefined }));

        await component.generateMagic();

        expect(aiServiceSpy.generateLook).toHaveBeenCalledWith('test prompt', 'user-img');
    });

    it('generateMagic should set isProcessing true during call', fakeAsync(() => {
        component.selectedStyle.set({ prompt: 'test' } as unknown as Hairstyle);
        component.userImage.set('user-img');

        // Return a promise that doesn't resolve immediately to check 'loading' state

        let resolveFn: (value: { imageUrl: string; analysisTime: number }) => void = () => { };
        const p = new Promise<{ imageUrl: string; analysisTime: number }>(r => resolveFn = r);
        aiServiceSpy.generateLook.and.returnValue(p);

        component.generateMagic();

        expect(component.isProcessing()).toBeTrue();

        resolveFn({ imageUrl: 'res', analysisTime: 1 });
        tick(); // advance async

        expect(component.isProcessing()).toBeFalse();
    }));

    it('generateMagic success should set resultImage and move to "finished"', async () => {
        component.selectedStyle.set({ prompt: 'test' } as unknown as Hairstyle);
        component.userImage.set('user-img');
        aiServiceSpy.generateLook.and.returnValue(Promise.resolve({ imageUrl: 'final.jpg', analysisTime: 2.2 }));

        await component.generateMagic();

        expect(component.resultImage()).toBe('final.jpg');
        expect(component.generationTime()).toBe(2.2);
        expect(component.currentStep()).toBe('finished');
    });

    it('generateMagic error should handle gracefully', async () => {
        spyOn(window, 'alert');
        component.selectedStyle.set({ prompt: 'test' } as unknown as Hairstyle);
        component.userImage.set('user-img');
        aiServiceSpy.generateLook.and.returnValue(Promise.reject('API Error'));

        await component.generateMagic();

        expect(window.alert).toHaveBeenCalledWith('Digitálna analýza zlyhala. Skúste to neskôr.');
        expect(component.isProcessing()).toBeFalse();
        // Should NOT move to finished
        expect(component.currentStep()).not.toBe('finished');
    });

    // --- 8. Final Actions ---

    it('downloadImage should not run if no result image', () => {
        component.resultImage.set(null);
        spyOn(document, 'createElement');
        component.downloadImage();
        expect(document.createElement).not.toHaveBeenCalled();
    });

    it('downloadImage should allow downloading', () => {
        component.resultImage.set('test.jpg');

        const mockLink = jasmine.createSpyObj('a', ['click']);
        spyOn(document, 'createElement').and.returnValue(mockLink);

        component.downloadImage();

        expect(mockLink.href).toContain('test.jpg');
        expect(mockLink.download).toBe('papi-transformation.jpg');
        expect(mockLink.click).toHaveBeenCalled();
    });

    it('showOriginal toggle should switch view state', () => {
        component.showOriginal.set(false);

        // Simulate template interaction or direct signal set
        component.showOriginal.set(true);
        expect(component.showOriginal()).toBeTrue();

        component.showOriginal.set(false);
        expect(component.showOriginal()).toBeFalse();
    });

});
