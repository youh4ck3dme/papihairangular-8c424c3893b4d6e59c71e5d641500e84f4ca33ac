import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { RouterLink } from "@angular/router";
import { BusinessHoursService } from "../../../core/services/business-hours.service";
import { SALON_CONTACT } from "../../../core/config/salon-contact";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class FooterComponent {
  private readonly businessHoursService = inject(BusinessHoursService);

  readonly contact = SALON_CONTACT;
  readonly openingHours = this.businessHoursService.openingHours;
  readonly currentStatus = this.businessHoursService.currentStatus;
  readonly todayIndex = this.businessHoursService.todayIndex;
  /** Stav „otvorené/zatvorené“ a dnešný deň počítame len v prehliadači (SSR by ukázal čas servera). */
  readonly isBrowser = () => this._isBrowser;
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly currentYear = new Date().getFullYear();
}
