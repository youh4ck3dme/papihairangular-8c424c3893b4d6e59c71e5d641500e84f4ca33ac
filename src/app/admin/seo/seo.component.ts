import { Component, inject } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { GeminiService } from '../../core/services/gemini.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-seo',
    templateUrl: './seo.component.html',
    styleUrls: ['./seo.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class SeoComponent {
    private seo = inject(SeoService);
    private geminiService = inject(GeminiService);

    title = '';
    slug = '';
    result = '';
    generatedData: { description: string, keywords: string } | null = null;
    loading = false;

    async generate() {
        if (!this.title || !this.slug) {
            this.result = 'Prosím vyplňte všetky polia.';
            return;
        }

        this.loading = true;
        this.result = '';
        this.generatedData = null;

        const prompt = `
            Generate a meta description (max 160 characters) and keywords (comma separated) for a blog post with title: "${this.title}".
            Language: Slovak.
            Return ONLY a valid JSON object with the following structure:
            {
                "description": "...",
                "keywords": "..."
            }
            Do not include markdown formatting.
        `;

        try {
            const response = await firstValueFrom(this.geminiService.generateText(prompt));
            const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanResponse);

            this.generatedData = parsed;

            // Preview the SEO settings
            this.seo.setBlogPostSeo({
                title: this.title,
                slug: this.slug,
                perex: parsed.description,
                content: '',
                imageUrl: '/assets/images/blog-default.jpg',
                author: 'PAPI Team',
                date: new Date().toISOString(),
                readingTime: 5,
                tags: parsed.keywords.split(',').map((k: string) => k.trim())
            });

            this.result = 'SEO dáta boli vygenerované a nastavené (preview).';

        } catch (error) {
            console.error('SEO Generation Error:', error);
            this.result = 'Chyba pri generovaní SEO dát.';
        } finally {
            this.loading = false;
        }
    }
}
