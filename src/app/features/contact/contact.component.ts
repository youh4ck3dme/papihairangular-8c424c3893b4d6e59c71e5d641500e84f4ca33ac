import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactComponent implements OnInit {
  private seoService = inject(SeoService);
  private fb: FormBuilder = inject(FormBuilder);
  private notificationService = inject(NotificationService);

  contactForm!: FormGroup;

  constructor() {
    this.seoService.updateMetaTags({
      description: 'Nájdete nás v Spoločenskom pavilóne v Košiciach. Kontaktujte nás telefonicky alebo emailom. Tešíme sa na vašu návštevu.'
    });
  }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }


    this.notificationService.show('Vaša správa bola úspešne odoslaná!', 'success');
    this.contactForm.reset();
  }
}
