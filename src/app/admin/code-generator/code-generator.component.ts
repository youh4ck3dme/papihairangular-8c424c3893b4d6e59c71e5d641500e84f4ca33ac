import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-code-generator',
    templateUrl: './code-generator.component.html',
    styleUrls: ['./code-generator.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class CodeGeneratorComponent {
    modelName = '';
    generated = { html: '', ts: '', css: '' };
    loading = false;
    private geminiService = inject(GeminiService);

    async generate() {
        if (!this.modelName) return;
        this.loading = true;
        this.generated = { html: '', ts: '', css: '' };

        const prompt = `
            Create an Angular component for: "${this.modelName}".
            Provide the HTML, TypeScript, and CSS code.
            Return ONLY a valid JSON object with the following structure:
            {
                "html": "...",
                "ts": "...",
                "css": "..."
            }
            Do not include any markdown formatting or explanations.
        `;

        try {
            const response = await firstValueFrom(this.geminiService.generateText(prompt));
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleanResponse);
                this.generated = {
                    html: parsed.html || '<!-- No HTML generated -->',
                    ts: parsed.ts || '// No TypeScript generated',
                    css: parsed.css || '/* No CSS generated */'
                };
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                // Fallback: try to extract if JSON parsing fails but content is there
                this.generated.ts = '// Error parsing AI response. Raw output:\n' + cleanResponse;
            }

        } catch (error) {
            console.error('Generation Error:', error);
            this.generated.ts = '// Error generating code. Please try again.';
        } finally {
            this.loading = false;
        }
    }

    downloadFile(name: string, content: string) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.${name.includes('html') ? 'html' : name.includes('css') ? 'css' : 'ts'}`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
