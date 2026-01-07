import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-api-keys',
    templateUrl: './api-keys.component.html',
    styleUrls: ['./api-keys.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class ApiKeysComponent {
    openaiKey = localStorage.getItem('openai_key') ?? '';
    geminiKey = localStorage.getItem('gemini_key') ?? '';
    blackboxKey = localStorage.getItem('blackbox_key') ?? '';
    saved = false;

    save() {
        localStorage.setItem('openai_key', this.openaiKey);
        localStorage.setItem('gemini_key', this.geminiKey);
        localStorage.setItem('blackbox_key', this.blackboxKey);
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
    }
}
