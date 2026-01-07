import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID, signal } from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { RouterLink } from "@angular/router";
import { BusinessHoursService } from "../../../core/services/business-hours.service";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class FooterComponent {
  businessHoursService = inject(BusinessHoursService);
  platformId = inject(PLATFORM_ID);

  openingHours = this.businessHoursService.openingHours;
  currentStatus = this.businessHoursService.currentStatus;
  todayIndex = this.businessHoursService.todayIndex;

  isBrowser = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser.set(true);
    }
  }

  currentYear = new Date().getFullYear();

  socialLinks = {
    instagram: "https://www.instagram.com/papi_hair_design/",
    facebook: "https://www.facebook.com/papihairdesign/",
    tiktok: "https://www.tiktok.com/@papi_hair_design",
  };
}
