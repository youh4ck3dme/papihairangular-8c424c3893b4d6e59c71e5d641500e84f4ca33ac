import { Component, ChangeDetectionStrategy, inject, HostBinding } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { NotificationComponent } from "./shared/components/notification/notification.component";
import { ScrollToTopComponent } from "./shared/components/scroll-to-top/scroll-to-top.component";
import { ScrollProgressComponent } from "./shared/components/scroll-progress/scroll-progress.component";
import { SeoService } from "./core/services/seo.service";
import { ThemeService } from "./core/services/theme.service";

@Component({
  selector: "app-root",
  standalone: true,
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NotificationComponent,
    ScrollProgressComponent,
    ScrollToTopComponent
  ],
})
export class AppComponent {
  // SeoService počúva navigáciu a nastavuje title/meta každej stránky
  private seoService = inject(SeoService);
  private themeService = inject(ThemeService);

  @HostBinding('class.dark') get isDarkTheme() {
    return this.themeService.isDark();
  }
}
