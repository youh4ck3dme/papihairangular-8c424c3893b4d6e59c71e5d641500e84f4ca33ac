import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { RouterLink } from "@angular/router";
import { BlogService } from "../../core/services/blog.service";
import { BlogPost } from "../../core/models/blog-post.interface";
import { fadeSlideIn, slideInLeft, hoverScale } from "../../core/animations";
import { SeoService } from "../../core/services/seo.service";
import { ThemeService } from "../../core/services/theme.service";
import { LazyImageDirective } from "../../shared/directives";

@Component({
  selector: "app-blog-list",
  templateUrl: "./blog-list.component.html",
  styleUrls: ["./blog-list.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterLink, LazyImageDirective, NgOptimizedImage],
  animations: [fadeSlideIn, slideInLeft, hoverScale],
})
export class BlogListComponent {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);
  private themeService = inject(ThemeService);

  posts = signal<BlogPost[]>([]);
  isLoading = signal(false);

  isDarkTheme = this.themeService.isDark;

  constructor() {
    this.seoService.setBlogListSeo();

    // BlogService.getAllPosts() returns BlogPost[] directly (synchronous)
    const allPosts = this.blogService.getAllPosts();
    this.posts.set(allPosts);

  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
