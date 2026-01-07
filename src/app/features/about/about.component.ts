import { Component, ChangeDetectionStrategy, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { SeoService } from "../../core/services/seo.service";
import { SalonDataService } from "../../core/services/salon-data.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);
  private salonDataService = inject(SalonDataService);

  teamMembers = this.salonDataService.stylists;

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        "PAPI HAIR DESIGN je viac než len kaderníctvo. Prečítajte si náš príbeh odvahy a odhodlania priniesť svetovú kvalitu do Košíc.",
    });
  }
}
