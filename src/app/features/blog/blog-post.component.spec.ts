import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogPostComponent } from './blog-post.component';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { BlogPost } from '../../core/models/blog-post.interface';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BlogPostComponent', () => {
    let component: BlogPostComponent;
    let fixture: ComponentFixture<BlogPostComponent>;
    let blogServiceSpy: jasmine.SpyObj<BlogService>;

    const mockPost: BlogPost = {
        id: 'test-id',
        slug: 'test-post',
        title: 'Test Post',
        subtitle: 'Test Subtitle',
        perex: 'Test Perex',
        content: [{ type: 'paragraph', text: 'Test Content' }],
        imageUrl: 'test.jpg',
        author: 'Author',
        authorRole: 'Role',
        date: '2026-01-01',
        readingTime: 5,
        tags: ['tag1']
    };

    beforeEach(async () => {
        blogServiceSpy = jasmine.createSpyObj('BlogService', [
            'getPostBySlug',
            'getRelatedPosts',
            'getNextPost',
            'getPrevPost',
            'getComments',
            'addComment',
            'deleteComment'
        ]);
        blogServiceSpy.getPostBySlug.and.returnValue(mockPost);
        blogServiceSpy.getRelatedPosts.and.returnValue([]);
        blogServiceSpy.getNextPost.and.returnValue(undefined);
        blogServiceSpy.getPrevPost.and.returnValue(undefined);
        blogServiceSpy.getComments.and.returnValue(of([]));
        blogServiceSpy.addComment.and.returnValue(of('mock-id'));
        blogServiceSpy.deleteComment.and.returnValue(of(void 0));

        const seoServiceSpy = jasmine.createSpyObj('SeoService', ['setBlogPostSeo']);

        await TestBed.configureTestingModule({
            imports: [BlogPostComponent, NoopAnimationsModule],
            providers: [
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: { get: () => 'test-post' } },
                        paramMap: of({ get: () => 'test-post' })
                    }
                },
                { provide: BlogService, useValue: blogServiceSpy },
                { provide: SeoService, useValue: seoServiceSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BlogPostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load post data', () => {
        expect(blogServiceSpy.getPostBySlug).toHaveBeenCalledWith('test-post');
        expect(component.post()).toEqual(mockPost);
    });

    it('should render post title', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const title = compiled.querySelector('h1.title');
        expect(title?.textContent).toContain('Test Post');
    });
});
