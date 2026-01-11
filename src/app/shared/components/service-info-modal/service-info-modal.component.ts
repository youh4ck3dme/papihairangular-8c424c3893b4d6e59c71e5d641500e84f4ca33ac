import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService } from '../../../core/models';

@Component({
    selector: 'app-service-info-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './service-info-modal.component.html',
    styleUrls: ['./service-info-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceInfoModalComponent implements AfterViewInit {
    @Input({ required: true }) service!: SalonService;
    @Output() modalClose = new EventEmitter<void>();
    @ViewChild('backdrop') backdrop!: ElementRef<HTMLDivElement>;

    ngAfterViewInit() {
        // Essential for keyboard support (Escape key)
        this.backdrop.nativeElement.focus();
    }

    onClose() {
        this.modalClose.emit();
    }

    onBackdropClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('backdrop')) {
            this.onClose();
        }
    }
}
