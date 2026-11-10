import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from "@angular/core";
import { DatePipe, NgOptimizedImage } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BlogService } from "../../core/services/blog.service";
import { BlogPost, ContentBlock } from "../../core/models/blog-post.interface";
import { SeoService } from "../../core/services/seo.service";
import { SALON_CONTACT } from "../../core/config/salon-contact";

@Component({
  selector: "app-blog-post",
  templateUrl: "./blog-post.component.html",
  styleUrls: ["./blog-post.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DatePipe, RouterLink, NgOptimizedImage],
})
export class BlogPostComponent {
  readonly bookingUrl = SALON_CONTACT.bookingUrl;
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);

  post = signal<BlogPost | undefined>(undefined);
  isLoading = signal(false);
  relatedPosts = signal<BlogPost[]>([]);
  nextPost = signal<BlogPost | undefined>(undefined);
  prevPost = signal<BlogPost | undefined>(undefined);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get("slug");
      if (slug) {
        this.loadPost(slug);
      }
    });
  }

  processedContent = signal<ContentBlock[]>([]);

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
    }
  }

  /** Odkazy na zdieľanie – computed: prepočíta sa len pri zmene článku, nie pri každej detekcii zmien.
   *  Kanonická URL je rovnaká pri prerenderingu aj v prehliadači (žiadne window.location). */
  readonly share = computed(() => {
    const p = this.post();
    const url = encodeURIComponent(`${SALON_CONTACT.siteUrl}/blog/${p?.slug ?? ''}`);
    const text = encodeURIComponent(p?.title || '');
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      whatsapp: `https://wa.me/?text=${url}`,
    };
  });
}
