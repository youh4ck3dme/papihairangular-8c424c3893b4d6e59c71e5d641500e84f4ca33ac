import { Component, ChangeDetectionStrategy, inject, HostBinding, signal } from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { CommonModule } from "@angular/common";
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
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NotificationComponent,
    ScrollProgressComponent,
    ScrollToTopComponent
  ],
})
export class AppComponent {
  private seoService = inject(SeoService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // Tracks if global layout (header/footer) should be visible
  showLayout = signal(true);

  constructor() {
    // Listen to route changes to handle scrolling, theme and layout visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Scroll na začiatok/kotvy rieši withInMemoryScrolling v app.config.ts

      const url = this.router.url;
      const isImmersiveStory = url.includes('/blog/pribeh-znacky');

      // Hide global layout for the immersive story component
      this.showLayout.set(!isImmersiveStory);

      // Blog používa globálne tokeny (light/dark) – žiadna vynútená biela.
    });
  }

  @HostBinding('class.dark') get isDarkTheme() {
    return this.themeService.isDark();
  }
}
