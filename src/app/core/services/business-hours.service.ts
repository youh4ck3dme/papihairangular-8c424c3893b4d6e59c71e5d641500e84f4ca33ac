import { Injectable, signal, computed } from '@angular/core';

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
  private readonly hours: BusinessHour[] = [
    { day: 'Pondelok', open: '08:00', close: '17:00', dayIndex: 1 },
    { day: 'Utorok', open: '08:00', close: '17:00', dayIndex: 2 },
    { day: 'Streda', open: '08:00', close: '17:00', dayIndex: 3 },
    { day: 'Štvrtok', open: '08:00', close: '17:00', dayIndex: 4 },
    { day: 'Piatok', open: '08:00', close: '17:00', dayIndex: 5 },
    { day: 'Sobota', open: 'Podľa objednávok', close: '', dayIndex: 6 },
    { day: 'Nedeľa', open: 'ZAVRETÉ', close: 'ZAVRETÉ', dayIndex: 0 }
  ];

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
