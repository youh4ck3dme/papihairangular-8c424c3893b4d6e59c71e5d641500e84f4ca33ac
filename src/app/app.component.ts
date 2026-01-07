import { Component, ChangeDetectionStrategy, inject, HostBinding } from "@angular/core";
import { RouterOutlet, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { NotificationComponent } from "./shared/components/notification/notification.component";
import { ScrollProgressComponent } from "./shared/components/scroll-progress/scroll-progress.component";
import { SeoService } from "./core/services/seo.service";
import { ThemeService } from "./core/services/theme.service";
import { PushNotificationService } from "./core/services/push-notification.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NotificationComponent,
    ScrollProgressComponent,
  ],
})
export class AppComponent {
  private seoService = inject(SeoService);
  private themeService = inject(ThemeService);
  private pushService = inject(PushNotificationService);

  private router = inject(Router);

  constructor() {
    // Auto-request push subscription on app load (optional: could be triggered by user action)
    this.pushService.requestSubscription().subscribe();

    // Listen to route changes to handle scrolling and theme
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Scroll to top
      window.scrollTo(0, 0);

      // Enforce white background for blog section
      if (this.router.url.startsWith('/blog')) {
        document.body.classList.add('blog-theme');
        document.body.style.backgroundColor = '#ffffff';
      } else {
        document.body.classList.remove('blog-theme');
        document.body.style.backgroundColor = ''; // Reset to default CSS variable
      }
    });
  }

  @HostBinding('class.dark') get isDarkTheme() {
    return this.themeService.isDark();
  }
}
