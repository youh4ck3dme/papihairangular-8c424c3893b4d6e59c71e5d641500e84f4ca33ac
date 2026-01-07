import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OpenAIService } from './openai.service';
import { OpenAIResponse } from '../models';

describe('OpenAIService', () => {
    let service: OpenAIService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [OpenAIService],
        });
        service = TestBed.inject(OpenAIService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should send POST request with correct headers and body', () => {
        const dummyResponse: OpenAIResponse = {
            choices: [{
                message: { role: 'assistant', content: 'test description' },
                finish_reason: 'stop',
                index: 0
            }],
            id: 'test-id',
            model: 'gpt-4o-mini',
            created: Date.now()
        };
        const prompt = 'test prompt';
        const url = 'https://api.openai.com/v1/chat/completions';

        service.generateSlovak(prompt).subscribe((res: OpenAIResponse) => {
            expect(res).toEqual(dummyResponse);
        });

        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('POST');

        // Direct API body structure
        const body = req.request.body;
        expect(body.model).toBe('gpt-4o-mini');
        expect(body.max_tokens).toBe(200);
        expect(body.stream).toBe(false);
        expect(body.messages.length).toBeGreaterThan(0);
        expect(body.messages[body.messages.length - 1]).toEqual({ role: 'user', content: prompt });

        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        expect(req.request.headers.has('Authorization')).toBeTrue();

        req.flush(dummyResponse);
    });
});
