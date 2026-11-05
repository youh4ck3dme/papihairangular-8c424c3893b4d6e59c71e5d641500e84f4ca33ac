import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NotificationService } from '../../core/services/notification.service';
import { BusinessHoursService } from '../../core/services/business-hours.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SALON_CONTACT } from '../../core/config/salon-contact';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, PageHeaderComponent],
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly hours = inject(BusinessHoursService);

  readonly contact = SALON_CONTACT;
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly openingHours = this.hours.openingHours;
  readonly status = this.hours.currentStatus;
  readonly todayIndex = this.hours.todayIndex;

  /** Mapa Google sa načíta až po kliknutí (žiadne cookies tretích strán bez súhlasu). */
  readonly mapLoaded = signal(false);
  readonly mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `https://www.google.com/maps?q=${encodeURIComponent('PAPI HAIR DESIGN, Trieda SNP 61, Košice')}&output=embed`,
  );

  readonly submitted = signal(false);
  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  readonly hourLabel = computed(() => (open: string, close: string) =>
    open === 'ZAVRETÉ' ? 'Zatvorené' : close ? `${open} – ${close}` : open);

  showError(field: 'name' | 'email' | 'message'): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || this.submitted());
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, message } = this.form.getRawValue();
    const subject = `Správa z webu od ${name}`;
    const body = `${message}\n\nOdosielateľ: ${name}\nE-mail: ${email}`;
    window.location.href = `mailto:${this.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.notificationService.show('Otváram váš e-mailový klient…', 'info');
    this.form.reset();
    this.submitted.set(false);
  }
}
