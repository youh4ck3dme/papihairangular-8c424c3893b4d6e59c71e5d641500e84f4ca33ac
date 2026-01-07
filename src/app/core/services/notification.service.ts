import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private lastId = 0;

  show(message: string, type: NotificationType = 'success', duration = 3000) {
    const newId = this.lastId++;
    const newNotification: Notification = { id: newId, message, type };
    
    this.notifications.update(current => [...current, newNotification]);

    setTimeout(() => {
      this.dismiss(newId);
    }, duration);
  }

  dismiss(id: number) {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }
}
