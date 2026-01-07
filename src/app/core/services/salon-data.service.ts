import { Injectable, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SalonService, Stylist } from '../models';
import { BusinessHoursService } from './business-hours.service';

/**
 * A service to simulate interactions with a backend.
 * It manages collections for stylists, services, and users.
 */
@Injectable({
  providedIn: 'root'
})
export class SalonDataService {

  // Simulate collections in a database
  private readonly _stylists = signal<Stylist[]>([]);
  private readonly _services = signal<SalonService[]>([]);

  // Public signals for readonly access
  public readonly stylists = this._stylists.asReadonly();
  public readonly services = this._services.asReadonly();

  // Business hours are needed for slot generation (though booking is removed, this service is still used by business hours calculation)
  private businessHoursService = inject(BusinessHoursService);

  constructor() {
    this.loadDataFromLocalStorage();
  }

  private loadDataFromLocalStorage() {
    this._stylists.set(this.getParsedData('salon_stylists', []));
    this._services.set(this.getParsedData('salon_services', []));
  }

  private getParsedData<T>(key: string, defaultData: T, dateFields: string[] = []): T {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsedData: T = JSON.parse(data);
        // Rehydrate Date objects if necessary
        if (Array.isArray(parsedData) && dateFields.length > 0) {
          parsedData.forEach((item: Record<string, unknown>) => {
            dateFields.forEach(field => {
              // Handle top-level date fields
              if (item[field] && typeof item[field] === 'string' && !field.includes('.')) {
                item[field] = new Date(item[field]);
              }
              // Handle nested date fields like privacyConsent.lastUpdated
              if (field.includes('.')) {
                const parts = field.split('.');
                let current: Record<string, unknown> | null = item;
                // Traverse down to the parent of the date field
                for (let i = 0; i < parts.length - 1; i++) {
                  if (current && typeof current === 'object' && parts[i] in current) {
                    current = current[parts[i]] as Record<string, unknown>;
                  } else {
                    current = null; // Path invalid
                    break;
                  }
                }
                // If the path was valid and the target field exists and is a string, parse it
                if (current && typeof current === 'object' && parts[parts.length - 1] in current && typeof current[parts[parts.length - 1]] === 'string') {
                  current[parts[parts.length - 1]] = new Date(current[parts[parts.length - 1]] as string);
                }
              }
            });
          });
        }
        return parsedData;
      } catch (e) {
        console.error(`Error parsing data from localStorage for key ${key}:`, e);
        return defaultData;
      }
    }
    return defaultData;
  }

  private saveDataToLocalStorage(key: string, data: unknown) {
    localStorage.setItem(key, JSON.stringify(data));
  }


  // --- API Methods ---

  getServices(): Observable<SalonService[]> {
    return of(this.services());
  }

  getStylistsForService(serviceId: string): Observable<Stylist[]> {
    const stylists = this.stylists().filter(s => s.services.includes(serviceId));
    return of(stylists);
  }

  // This method finds the next available slot starting from tomorrow
  // This method is now unused since booking is removed, but kept for reference if needed
  findNextAvailableSlotForStylist(stylistId: string, duration: number): Observable<{ date: Date, start: string } | null> {
    const stylists = this.stylists();
    const stylist = stylists.find(s => s.id === stylistId);
    if (!stylist) {
      return of(null);
    }

    // Start checking from tomorrow
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0);

    const maxSearchDays = 30; // Search up to next 30 days
    for (let i = 0; i < maxSearchDays; i++) {
      const dayIndex = currentDate.getDay(); // 0-6 (Sunday-Saturday)
      const todayHours = this.businessHoursService.openingHours().find(h => h.dayIndex === dayIndex);

      if (todayHours && todayHours.open !== 'ZAVRETÉ') {
        const [openHour, openMinute] = todayHours.open.split(':').map(Number);
        const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);

        const openTime = new Date(currentDate);
        openTime.setHours(openHour, openMinute, 0, 0);

        const closeTime = new Date(currentDate);
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        // No appointments to check against anymore, as booking is removed.
        // This logic is now purely theoretical or for future re-implementation.
        const currentTime = new Date(openTime);
        while (currentTime.getTime() + duration * 60000 <= closeTime.getTime()) {
          // No busy times to check. Any slot within business hours is theoretically available.
          return of({
            date: new Date(currentDate), // Return a new date object to prevent mutations
            start: `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`
          });
          // currentTime = new Date(currentTime.getTime() + 15 * 60000); // Check every 15 minutes
        }
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to next day
    }
    return of(null); // No slot found within maxSearchDays
  }

  // --- Dashboard CRUD Methods ---

  // Service CRUD
  addService(service: SalonService) {
    this._services.update(s => {
      const updated = [...s, { ...service, id: `service-${Date.now()}` }];
      this.saveDataToLocalStorage('salon_services', updated);
      return updated;
    });
  }
  updateService(updatedService: SalonService) {
    this._services.update(s => {
      const updated = s.map(service => service.id === updatedService.id ? updatedService : service);
      this.saveDataToLocalStorage('salon_services', updated);
      return updated;
    });
  }
  deleteService(id: string) {
    this._services.update(s => {
      const updated = s.filter(service => service.id !== id);
      this.saveDataToLocalStorage('salon_services', updated);
      return updated;
    });
  }

  // Stylist CRUD
  addStylist(stylist: Stylist) {
    this._stylists.update(s => {
      const updated = [...s, { ...stylist, id: `stylist-${Date.now()}` }];
      this.saveDataToLocalStorage('salon_stylists', updated);
      return updated;
    });
  }
  updateStylist(updatedStylist: Stylist) {
    this._stylists.update(s => {
      const updated = s.map(stylist => stylist.id === updatedStylist.id ? updatedStylist : stylist);
      this.saveDataToLocalStorage('salon_stylists', updated);
      return updated;
    });
  }
  deleteStylist(id: string) {
    this._stylists.update(s => {
      const updated = s.filter(stylist => stylist.id !== id);
      this.saveDataToLocalStorage('salon_stylists', updated);
      return updated;
    });
  }
}