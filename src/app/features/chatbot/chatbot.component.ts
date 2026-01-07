import { Component, inject, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMsg } from '../../core/services/chat.service';
import { of } from 'rxjs';
import { catchError, finalize, takeUntil, timeout } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface UiMsg {
    role: 'user' | 'assistant';
    text: string;
    pending?: boolean;
    timestamp: Date;
}

@Component({
    selector: 'app-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chatbot.component.html',
    styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements AfterViewChecked, OnDestroy {
    private chat = inject(ChatService);

    @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
    private shouldScroll = false;

    isOpen = false;
    userInput = '';
    messages: UiMsg[] = [];
    isLoading = false;

    private cancel$ = new Subject<void>();
    private destroy$ = new Subject<void>();

    welcomeMessage = '👋 Ahoj! Som tvoj PAPI AI asistent. Môžem ti poradiť s účesmi, farbením, starostlivosťou o vlasy, rezerváciou termínu alebo odpovedať na akékoľvek otázky o našom salóne. Čo ťa zaujíma?';

    suggestions = [
        { icon: '✂️', text: 'Aké účesy sú teraz trendy?' },
        { icon: '🎨', text: 'Ako si vybrať správnu farbu vlasov?' },
        { icon: '📅', text: 'Chcem sa objednať na termín' },
        { icon: '💰', text: 'Koľko stojí strih?' },
        { icon: '📍', text: 'Kde sa nachádzate?' },
        { icon: '🕐', text: 'Aké sú otváracie hodiny?' }
    ];

    ngAfterViewChecked() {
        if (this.shouldScroll && this.messagesContainer) {
            this.scrollToBottom();
            this.shouldScroll = false;
        }
    }

    ngOnDestroy() {
        this.cancel$.next();
        this.cancel$.complete();
        this.destroy$.next();
        this.destroy$.complete();
    }

    private scrollToBottom() {
        if (this.messagesContainer) {
            const element = this.messagesContainer.nativeElement;
            element.scrollTop = element.scrollHeight;
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            setTimeout(() => {
                this.shouldScroll = true;
            }, 100);
        } else {
            // Keď zatvára chatbot, zruš request
            this.cancel$.next();
            this.isLoading = false;
        }
    }

    sendMessage() {
        const text = this.userInput.trim();
        if (!text || this.isLoading) return;

        // Zruš predošlý request (ak ešte beží)
        this.cancel$.next();

        // UI: user message
        this.messages.push({
            role: 'user',
            text,
            timestamp: new Date()
        });
        this.userInput = '';

        // UI: bot placeholder (tento sa MUSÍ prepísať)
        const botPlaceholder: UiMsg = {
            role: 'assistant',
            text: 'Píše...',
            pending: true,
            timestamp: new Date()
        };
        this.messages.push(botPlaceholder);

        this.isLoading = true;
        this.shouldScroll = true;

        // Build history pre backend (trim)
        const history: ChatMsg[] = this.messages
            .filter(m => !m.pending) // Neposielaj placeholdery
            .slice(-12) // LEVEL1: max 12 UI správ
            .map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.text
            }));

        // LEVEL 3: Stream path (preferred) + fallback to JSON
        let acc = '';
        const t0 = performance.now();

        this.chat.askStream(text, history).pipe(
            timeout(20000), // 20s timeout for stream
            takeUntil(this.cancel$), // Cancel support
            catchError(() => {
                // Stream failed, fallback to JSON
                return of('\n[stream_error]');
            }),
            finalize(() => {
                this.isLoading = false;
                botPlaceholder.pending = false;
                const dt = Math.round(performance.now() - t0);
                console.log('[chat-stream] latency_ms=', dt, 'chars=', acc.length);
            }),
            takeUntil(this.destroy$)
        ).subscribe(chunk => {
            // If stream failed, use JSON fallback
            if (chunk === '\n[stream_error]') {
                this.fallbackJson(text, history, botPlaceholder, t0);
                return;
            }

            // Accumulate stream chunks and update placeholder
            acc += chunk;
            botPlaceholder.text = acc.trim() || 'Píše...';
            this.shouldScroll = true;
        });
    }

    useSuggestion(suggestionText: string) {
        this.userInput = suggestionText;
        this.sendMessage();
    }

    /**
     * Fallback to JSON when stream fails
     */
    private fallbackJson(text: string, history: ChatMsg[], botPlaceholder: UiMsg, t0: number): void {
        this.chat.askJson(text, history).pipe(
            timeout(15000),
            takeUntil(this.cancel$),
            catchError(() => of({ reply: 'Ups… dnes sa mi to seklo. Skús znova.' })),
            finalize(() => {
                this.isLoading = false;
                botPlaceholder.pending = false;
            }),
            takeUntil(this.destroy$)
        ).subscribe(r => {
            const dt = Math.round(performance.now() - t0);
            console.log('[chat-json-fallback] latency_ms=', dt, 'len=', r.reply.length);
            botPlaceholder.text = (r.reply || '').trim() || 'No reply';
            this.shouldScroll = true;
        });
    }
    // Reset conversation to initial state
    resetConversation() {
        this.messages = [];
        this.userInput = '';
        this.isLoading = false;
        this.cancel$.next();
    }
}
