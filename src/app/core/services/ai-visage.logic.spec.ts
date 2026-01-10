import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AiVisageService } from './ai-visage.service';

describe('AiVisageService Logic Verification', () => {
    let service: AiVisageService;
    let httpMock: HttpTestingController;

    const mockBase64 = 'data:image/jpeg;base64,test-data';
    const mockGeminiResponse = {
        candidates: [{
            content: {
                parts: [{
                    text: `
            Here is the analysis:
            \`\`\`json
            {
              "faceShape": "Square",
              "skinTone": "Medium",
              "undertone": "Warm",
              "eyeColor": "Hazel",
              "features": ["Strong jawline", "High cheekbones"],
              "hairTexture": "Wavy",
              "season": "Autumn"
            }
            \`\`\`
          `
                }]
            }
        }]
    };

    const mockOpenAIResponse = {
        predictions: [{
            bytesBase64Encoded: 'generated-image-data'
        }]
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AiVisageService]
        });
        service = TestBed.inject(AiVisageService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should correctly parse Gemini JSON and construct the Identity Prompt', async () => {
        const promise = service.generateLook('Modern Pompadour', mockBase64);

        // Expect call to Proxy for Analyze
        // Expect call to Proxy for Analyze (First request)
        const analyzeReq = httpMock.expectOne(req => req.url.includes('ai-proxy.php'));
        expect(analyzeReq.request.method).toBe('POST');
        expect(analyzeReq.request.body.action).toBe('analyze'); // Verify action here

        // Simulate Gemini Response
        analyzeReq.flush(mockGeminiResponse);

        // Expect call to Proxy for Generate Image (Second request)
        const generateReq = httpMock.expectOne(req => req.url.includes('ai-proxy.php'));
        expect(generateReq.request.method).toBe('POST');
        expect(generateReq.request.body.action).toBe('generate_image'); // Verify action here

        // CRITICAL: Verify the prompt contains the extracted data
        const prompt = generateReq.request.body.prompt;
        console.log('Constructed Prompt:', prompt);

        expect(prompt).toContain('Face Shape: Square');
        expect(prompt).toContain('Strong jawline');
        expect(prompt).toContain('Autumn');
        expect(prompt).toContain('IDENTITY PRESERVATION');

        // Simulate Image Response
        generateReq.flush(mockOpenAIResponse);

        const result = await promise;
        expect(result.imageUrl).toContain('generated-image-data');
        expect(result.analysis?.faceShape).toBe('Square');
    });
});
