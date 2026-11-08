import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
  notifications = this.notificationService.notifications;

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
      case 'error': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z';
      default: return 'M11 7h2v2h-2zm0 4h2v6h-2z';
    }
  }

  getBgColor(type: string): string {
    // Sémantické tokeny (surface/accent/danger) — správny kontrast v light aj dark
    switch (type) {
      case 'success': return 'bg-card text-success border border-success';
      case 'error':   return 'bg-card text-danger border border-danger';
      default:        return 'bg-card text-accent-text border border-gold-400';
    }
  }
}
