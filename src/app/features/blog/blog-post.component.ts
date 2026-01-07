import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  HostListener,
} from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BlogService } from "../../core/services/blog.service";
import { BlogPost, ContentBlock } from "../../core/models/blog-post.interface";
import { SeoService } from "../../core/services/seo.service";
import { fadeSlideIn, slideInLeft, slideInRight, fadeIn } from "../../core/animations";
import { BlogComments } from "./blog-comments/blog-comments";
import { LazyImageDirective } from "../../shared/directives";
import { SafeHtmlPipe } from "../../shared/pipes/safe-html.pipe";
import { effect } from "@angular/core";

@Component({
  selector: "app-blog-post",
  templateUrl: "./blog-post.component.html",
  styleUrls: ["./blog-post.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterLink, BlogComments, LazyImageDirective, SafeHtmlPipe, NgOptimizedImage],
  animations: [fadeSlideIn, slideInLeft, slideInRight, fadeIn],
})
export class BlogPostComponent {
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);

  post = signal<BlogPost | undefined>(undefined);
  isLoading = signal(false);
  relatedPosts = signal<BlogPost[]>([]);
  nextPost = signal<BlogPost | undefined>(undefined);
  prevPost = signal<BlogPost | undefined>(undefined);
  readingProgress = signal(0);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const doc = document.documentElement;
    const winScroll = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    if (height > 0) {
      this.readingProgress.set((winScroll / height) * 100);
    }
  }

  constructor() {
    // Re-load post when slug changes
    effect(() => {
      const params = this.route.snapshot.paramMap;
      const slug = params.get("slug");

      if (slug) {
        this.loadPost(slug);
      }
    }, { allowSignalWrites: true });

    // Fallback if effect doesn't catch initial load correctly in some edge cases
    // but snapshot in constructor usually works for first hit.
    // Better: use paramMap observable if we stay on same component.
    this.route.paramMap.subscribe(params => {
      const slug = params.get("slug");
      if (slug) {
        this.loadPost(slug);
      }
    });
  }

  processedContent = signal<ContentBlock[]>([]);
  // ... existing signals

  private loadPost(slug: string): void {
    const foundPost = this.blogService.getPostBySlug(slug);
    this.post.set(foundPost);

    if (foundPost) {
      // Process content to enforce H2 limit (max 4)
      let processed: ContentBlock[] = [];

      if (Array.isArray(foundPost.content)) {
        let h2Count = 0;
        processed = foundPost.content.map((block: ContentBlock) => {
          if (block.type === 'heading' || block.type === 'heading-level-2') {
            h2Count++;
            if (h2Count > 4) {
              // Downgrade to H3 if limit exceeded
              return { ...block, type: 'heading-level-3' };
            }
          }
          return block;
        });
      } else {
        // If content is just a string, wrap it in a paragraph block or handle accordingly
        // For now, assuming string content doesn't need H2 processing or just push it as is
        processed = [{ type: 'paragraph', text: foundPost.content }];
      }

      this.processedContent.set(processed);

      this.seoService.setBlogPostSeo(foundPost);
      this.relatedPosts.set(this.blogService.getRelatedPosts(slug, 3));
      this.nextPost.set(this.blogService.getNextPost(slug));
      this.prevPost.set(this.blogService.getPrevPost(slug));

      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getFacebookShareUrl(): string {
    const url = encodeURIComponent(window.location.href);
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  }

  getTwitterShareUrl(): string {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.post()?.title || '');
    return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  }

  getWhatsAppShareUrl(): string {
    const url = encodeURIComponent(window.location.href);
    return `https://wa.me/?text=${url}`;
  }
}
