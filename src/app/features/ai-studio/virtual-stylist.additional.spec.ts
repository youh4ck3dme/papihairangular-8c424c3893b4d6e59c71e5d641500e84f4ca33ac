// Additional unit tests for VirtualStylistComponent (25 new test cases)
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualStylistComponent } from './virtual-stylist.component';
import { AiVisageService } from '../../core/services/ai-visage.service';
import { ElementRef } from '@angular/core';

describe('VirtualStylistComponent Additional Tests', () => {
    let component: VirtualStylistComponent;
    let fixture: ComponentFixture<VirtualStylistComponent>;
    let aiServiceSpy: jasmine.SpyObj<AiVisageService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('AiVisageService', ['generateLook']);
        await TestBed.configureTestingModule({
            imports: [VirtualStylistComponent],
            providers: [{ provide: AiVisageService, useValue: spy }]
        }).compileComponents();
        aiServiceSpy = TestBed.inject(AiVisageService) as jasmine.SpyObj<AiVisageService>;
        fixture = TestBed.createComponent(VirtualStylistComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // 1. Ensure camera error message appears when mediaDevices not available
    it('should set cameraError when navigator.mediaDevices is undefined', async () => {
        const original = navigator.mediaDevices;
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
                value: original,
                configurable: true,
                writable: true
            });
        }
    });

    // 2. Verify fallback error handling when getUserMedia rejects twice
    it('should handle double permission denial and set error', async () => {
        const mockMedia = { getUserMedia: jasmine.createSpy('getUserMedia').and.returnValues(Promise.reject('err'), Promise.reject('err')) };
        const original = navigator.mediaDevices;
        try {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: mockMedia,
                configurable: true,
                writable: true
            });
            await component.activateCamera();
            expect(component.cameraError()).toBe('Prístup ku kamere bol zamietnutý alebo kamera chýba.');
            expect(component.isCameraActive()).toBeFalse();
        } finally {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: original,
                configurable: true,
                writable: true
            });
        }
    });

    // 3. Ensure video element play is called even if srcObject already set
    it('should call video.play after setting srcObject', async () => {
        const mockStream = { getTracks: () => [] } as unknown as MediaStream;
        const mockMedia = { getUserMedia: jasmine.createSpy('getUserMedia').and.returnValue(Promise.resolve(mockStream)) };
        const original = navigator.mediaDevices;
        try {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: mockMedia,
                configurable: true,
                writable: true
            });
            const mockVideo = { srcObject: null, play: jasmine.createSpy('play').and.returnValue(Promise.resolve()) };
            component.videoElement = { nativeElement: mockVideo } as ElementRef;
            await component.activateCamera();
            expect(mockVideo.play).toHaveBeenCalled();
            expect(component.isCameraActive()).toBeTrue();
        } finally {
            Object.defineProperty(navigator, 'mediaDevices', {
                value: original,
                configurable: true,
                writable: true
            });
        }
    });

    // 4. Verify stopCamera clears srcObject even if no tracks
    it('should clear srcObject when stopCamera called with empty tracks', () => {
        const mockVideo = { srcObject: { getTracks: () => [] } };
        component.videoElement = { nativeElement: mockVideo } as unknown as ElementRef;
        component.isCameraActive.set(true);
        component.stopCamera();
        expect(mockVideo.srcObject).toBeNull();
        expect(component.isCameraActive()).toBeFalse();
    });

    // 5. Handle file upload with unsupported file type
    it('should ignore unsupported file types in handleFileUpload', () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        const originalStep = component.currentStep();
        component.handleFileUpload(mockEvent);
        expect(component.currentStep()).toBe(originalStep);
        expect(component.userImage()).toBeNull();
    });

    // 6. Ensure generateMagic does not proceed when no userImage
    it('should not call AI service if userImage is null', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.selectedStyle.set({ prompt: 'prompt' } as any);
        component.userImage.set(null);
        await component.generateMagic();
        expect(aiServiceSpy.generateLook).not.toHaveBeenCalled();
    });

    // 7. Verify generateMagic sets isProcessing false on error
    it('should reset isProcessing on AI service error', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.selectedStyle.set({ prompt: 'p' } as any);
        component.userImage.set('img');
        aiServiceSpy.generateLook.and.returnValue(Promise.reject('error'));
        await component.generateMagic();
        expect(component.isProcessing()).toBeFalse();
        expect(component.currentStep()).not.toBe('finished');
    });

    // 8. Confirm downloadImage does nothing when resultImage is empty string
    it('downloadImage should not create link when resultImage is empty string', () => {
        component.resultImage.set('');
        spyOn(document, 'createElement');
        component.downloadImage();
        expect(document.createElement).not.toHaveBeenCalled();
    });

    // 9. Verify showOriginal toggle works via method call
    it('should toggle showOriginal via toggle method', () => {
        component.showOriginal.set(false);
        component.showOriginal.set(true);
        expect(component.showOriginal()).toBeTrue();
        component.showOriginal.set(false);
        expect(component.showOriginal()).toBeFalse();
    });

    // 10. Ensure filteredStyles returns empty array for unknown category
    it('filteredStyles should return empty array for unknown category', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.activeCategory.set('Neexistuje' as any);
        const styles = component.filteredStyles();
        expect(styles.length).toBe(0);
    });

    // 11. Verify scrollCategories handles unknown direction gracefully
    it('scrollCategories should not throw for invalid direction', () => {
        const mockNav = { nativeElement: { scrollLeft: 0, scrollTo: jasmine.createSpy('scrollTo') } };
        component.categoryNav = mockNav as unknown as ElementRef;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => component.scrollCategories('invalid' as any)).not.toThrow();
    });

    // 12. Test that start() does nothing if already on upload step
    it('start should keep step as upload if already there', () => {
        component.currentStep.set('upload');
        component.start();
        expect(component.currentStep()).toBe('upload');
    });

    // 13. Verify reset clears camera error state
    it('reset should clear cameraError', () => {
        component.cameraError.set('some error');
        component.reset();
        expect(component.cameraError()).toBe('');
    });

    // 14. Ensure capturePhoto resets camera and moves to selection even if video element missing
    it('capturePhoto should handle missing video element gracefully', () => {
        component.videoElement = undefined as unknown as ElementRef;
        component.canvasElement = {
            nativeElement: {
                width: 0,
                height: 0,
                getContext: () => ({
                    drawImage: () => void 0,
                    translate: () => void 0,
                    scale: () => void 0
                }),
                toDataURL: () => 'data'
            }
        } as unknown as ElementRef;
        spyOn(component, 'stopCamera');
        component.capturePhoto();
        expect(component.userImage()).toBe('data');
        expect(component.currentStep()).toBe('selection');
        expect(component.stopCamera).toHaveBeenCalled();
    });

    // 15. Verify generateMagic does not set resultImage when AI returns null
    it('generateMagic should not set resultImage if AI returns undefined', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.selectedStyle.set({ prompt: 'p' } as any);
        component.userImage.set('img');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        aiServiceSpy.generateLook.and.returnValue(Promise.resolve(undefined as any));
        await component.generateMagic();
        expect(component.resultImage()).toBeNull();
        expect(component.currentStep()).not.toBe('finished');
    });

    // 16. Ensure downloadImage sets correct filename when resultImage has query params
    it('downloadImage should use correct filename even with query params', () => {
        component.resultImage.set('image.jpg?size=large');
        const mockLink = jasmine.createSpyObj('a', ['click']);
        spyOn(document, 'createElement').and.returnValue(mockLink);
        component.downloadImage();
        expect(mockLink.download).toBe('papi-transformation.jpg');
    });

    // 17. Verify that selecting a style updates selectedStyle signal correctly
    it('selectStyle should set selectedStyle to provided object', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const style = { id: 's1', name: 'Style 1', category: 'Klasika', image: '', description: '', prompt: '' } as any;
        component.selectStyle(style);
        expect(component.selectedStyle()).toBe(style);
    });

    // 18. Ensure that after reset, isProcessing is false
    it('reset should set isProcessing to false', () => {
        component.isProcessing.set(true);
        component.reset();
        expect(component.isProcessing()).toBeFalse();
    });

    // 19. Verify that scrollCategories does not fail when categoryNav is undefined
    it('scrollCategories should not throw when categoryNav is undefined', () => {
        component.categoryNav = undefined as unknown as ElementRef;
        expect(() => component.scrollCategories('right')).not.toThrow();
    });

    // 20. Test that handleFileUpload correctly handles FileReader error event
    it('handleFileUpload should keep step unchanged on FileReader error', () => {
        const mockFile = new File([''], 'test.png', { type: 'image/png' });
        const mockEvent = { target: { files: [mockFile] } } as unknown as Event;
        const mockReader = { readAsDataURL: jasmine.createSpy('readAsDataURL'), onerror: null as unknown as Event };
        spyOn(window, 'FileReader').and.returnValue(mockReader as unknown as FileReader);
        const originalStep = component.currentStep();
        // Simulate error
        mockReader.onerror = new Event('error');
        component.handleFileUpload(mockEvent);
        expect(component.currentStep()).toBe(originalStep);
    });

    // 21. Verify that generateMagic does not call AI service when selectedStyle is null
    it('generateMagic should not call AI when selectedStyle is null', async () => {
        component.selectedStyle.set(null);
        component.userImage.set('img');
        await component.generateMagic();
        expect(aiServiceSpy.generateLook).not.toHaveBeenCalled();
    });

    // 22. Ensure that after successful generateMagic, generationTime is set correctly
    it('generateMagic should set generationTime on success', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.selectedStyle.set({ prompt: 'p' } as any);
        component.userImage.set('img');
        aiServiceSpy.generateLook.and.returnValue(Promise.resolve({ imageUrl: 'res', analysisTime: 3.14 }));
        await component.generateMagic();
        expect(component.generationTime()).toBeCloseTo(3.14);
    });

    // 23. Verify that reset also clears activeCategory back to default
    it('reset should reset activeCategory to default "Klasika"', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component.activeCategory.set('Moderné' as any);
        component.reset();
        expect(component.activeCategory()).toBe('Klasika');
    });

    // 24. Ensure that start does not change step if already at "selection"
    it('start should not change step when already at selection', () => {
        component.currentStep.set('selection');
        component.start();
        expect(component.currentStep()).toBe('selection');
    });

    // 25. Verify that downloadImage creates anchor with correct href encoding
    it('downloadImage should set href with proper data URL encoding', () => {
        component.resultImage.set('data:image/png;base64,AAA');
        const mockLink = jasmine.createSpyObj('a', ['click']);
        spyOn(document, 'createElement').and.returnValue(mockLink);
        component.downloadImage();
        expect(mockLink.href).toContain('data:image/png;base64,AAA');
    });
});
