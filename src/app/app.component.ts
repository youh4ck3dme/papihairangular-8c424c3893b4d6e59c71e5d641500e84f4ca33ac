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
import { PushNotificationService } from "./core/services/push-notification.service";

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
  private pushService = inject(PushNotificationService);
  private router = inject(Router);

  // Tracks if global layout (header/footer) should be visible
  showLayout = signal(true);

  constructor() {
    // Auto-request push subscription on app load
    this.pushService.requestSubscription().subscribe();

    // Listen to route changes to handle scrolling, theme and layout visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Scroll to top
      window.scrollTo(0, 0);

      const url = this.router.url;
      const isImmersiveStory = url.includes('/blog/pribeh-znacky');

      // Hide global layout for the immersive story component
      this.showLayout.set(!isImmersiveStory);

      // Enforce white background for regular blog section, skip for immersive story
      if (url.startsWith('/blog') && !isImmersiveStory) {
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
