import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogListComponent } from './blog-list.component';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { ThemeService } from '../../core/services/theme.service';
import { provideRouter } from '@angular/router';
import { BlogPost } from '../../core/models/blog-post.interface';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('BlogListComponent', () => {
    let component: BlogListComponent;
    let fixture: ComponentFixture<BlogListComponent>;
    let blogServiceSpy: jasmine.SpyObj<BlogService>;

    const mockPosts: BlogPost[] = [
        {
            id: 'test-1',
            slug: 'test-1',
            title: 'Test Post 1',
            subtitle: 'Subtitle 1',
            perex: 'Perex 1',
            content: 'Content 1',
            imageUrl: 'test.jpg',
            author: 'Author 1',
            authorRole: 'Role 1',
            date: '2026-01-01',
            readingTime: 5,
            tags: ['tag1']
        }
    ];

    beforeEach(async () => {
        // Add missing methods to spy
        blogServiceSpy = jasmine.createSpyObj('BlogService', ['getAllPosts', 'getComments', 'addComment', 'deleteComment']);
        blogServiceSpy.getAllPosts.and.returnValue(mockPosts);

        const seoServiceSpy = jasmine.createSpyObj('SeoService', ['setBlogListSeo']);

        const themeServiceMock = {
            isDark: signal(false),
            toggleTheme: jasmine.createSpy('toggleTheme')
        };

        await TestBed.configureTestingModule({
            imports: [BlogListComponent, NoopAnimationsModule],
            providers: [
                provideRouter([]),
                { provide: BlogService, useValue: blogServiceSpy },
                { provide: SeoService, useValue: seoServiceSpy },
                { provide: ThemeService, useValue: themeServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(BlogListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load posts on initialization', () => {
        expect(blogServiceSpy.getAllPosts).toHaveBeenCalled();
        expect(component.posts().length).toBe(1);
        expect(component.posts()[0].title).toBe('Test Post 1');
    });

    it('should display blog posts in the template', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const articles = compiled.querySelectorAll('article');
        expect(articles.length).toBe(1);
        expect(articles[0].textContent).toContain('Test Post 1');
    });
});
