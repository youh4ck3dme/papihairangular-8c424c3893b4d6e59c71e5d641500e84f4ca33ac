import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SalonDataService } from "../../core/services/salon-data.service";
import { PageHeaderComponent } from "../../shared/components/page-header/page-header.component";
import { SALON_CONTACT } from "../../core/config/salon-contact";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeaderComponent],
})
export class AboutComponent {
  readonly contact = SALON_CONTACT;
  readonly teamMembers = inject(SalonDataService).stylists;

  readonly credentials = [
    "Ambasádor GOLD Haircare pre Česko a Slovensko od roku 2021",
    "Školiteľ dámskych a pánskych strihov",
    "Finalista a víťaz domácich i zahraničných súťaží",
    "Vlasové šou, módne prehliadky a kampane",
  ] as const;
}
