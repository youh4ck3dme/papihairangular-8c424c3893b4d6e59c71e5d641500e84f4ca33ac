import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../core/services/gemini.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-blog-topics',
    templateUrl: './blog-topics.component.html',
    styleUrls: ['./blog-topics.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class BlogTopicsComponent {
    topics: string[] = [];
    loading = false;
    private geminiService = inject(GeminiService);

    async fetch() {
        this.loading = true;
        this.topics = [];

        const prompt = 'Navrhni 5 zaujímavých tém na blog pre kadernícky salón. Vypíš len zoznam tém, každú na nový riadok, bez číslovania.';

        try {
            const response = await firstValueFrom(this.geminiService.generateSlovak(prompt));
            this.topics = response.split('\n').filter(line => line.trim().length > 0);
        } catch (error) {
            console.error('Error fetching topics:', error);
            this.topics = ['Nepodarilo sa načítať témy. Skúste znova.'];
        } finally {
            this.loading = false;
        }
    }
}
