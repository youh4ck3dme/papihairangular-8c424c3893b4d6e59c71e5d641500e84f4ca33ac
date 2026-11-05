import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter } from "rxjs/operators";
import { ThemeService } from "../../../core/services/theme.service";
import { SALON_CONTACT } from "../../../core/config/salon-contact";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  host: { "(document:keydown.escape)": "closeMenu()" },
})
export class HeaderComponent {
  private readonly theme = inject(ThemeService);
  private readonly document = inject(DOCUMENT);

  readonly contact = SALON_CONTACT;
  readonly isDark = this.theme.isDark;
  readonly isMenuOpen = signal(false);

  readonly navLinks = [
    { path: "/", label: "Domov", exact: true },
    { path: "/cennik", label: "Cenník", exact: false },
    { path: "/o-nas", label: "O nás", exact: false },
    { path: "/kontakt", label: "Kontakt", exact: false },
    { path: "/blog", label: "Blog", exact: false },
  ] as const;

  constructor() {
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.closeMenu());
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  toggleMenu(): void {
    this.isMenuOpen() ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    this.isMenuOpen.set(true);
    this.document.body.style.overflow = "hidden";
  }

  closeMenu(): void {
    if (!this.isMenuOpen()) return;
    this.isMenuOpen.set(false);
    this.document.body.style.overflow = "";
  }
}
