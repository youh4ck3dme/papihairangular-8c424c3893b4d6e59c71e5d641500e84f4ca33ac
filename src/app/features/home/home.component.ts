import { Component, ChangeDetectionStrategy, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SeoService } from "../../core/services/seo.service";

import { ServiceCardsComponent } from "../../shared/components/service-cards/service-cards.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ServiceCardsComponent],
})
export class HomeComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        "Objavte miesto, kde sa precízne remeslo stretáva s moderným umením. V PAPI HAIR DESIGN vytvárame viac než len účesy – tvoríme osobnosť.",
    });
  }
}
