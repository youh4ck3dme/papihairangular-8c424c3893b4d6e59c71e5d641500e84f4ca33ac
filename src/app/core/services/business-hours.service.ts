import { Injectable, signal, computed } from '@angular/core';
import { OPENING_HOURS } from '../config/opening-hours';

export interface BusinessHour {
  day: string;
  open: string;
  close: string;
  dayIndex: number; // 0 for Sunday, 1 for Monday, etc.
}

@Injectable({
  providedIn: 'root'
})
export class BusinessHoursService {
  private readonly hours: BusinessHour[] = OPENING_HOURS.map(({ day, open, close, dayIndex }) => ({ day, open, close, dayIndex }));

  openingHours = signal<BusinessHour[]>(this.hours);

  todayIndex = signal(new Date().getDay());

  currentStatus = computed(() => {
    const now = new Date();
    const dayIndex = this.todayIndex();
    const todayHours = this.openingHours().find(h => h.dayIndex === dayIndex);

    if (!todayHours || todayHours.open === 'ZAVRETÉ') {
      return { day: todayHours?.day || 'Dnes', status: 'Zatvorené', isOpen: false };
    }

    const [openHour, openMinute] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);

    const openTime = new Date();
    openTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    const isOpen = now >= openTime && now < closeTime;

    return {
      day: todayHours.day,
      status: isOpen ? 'Otvorené' : 'Zatvorené',
      isOpen: isOpen
    };
  });
}
