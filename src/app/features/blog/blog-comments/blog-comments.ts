import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BlogService } from '../../../core/services/blog.service';
import { Comment } from '../../../core/models/comment.interface';
import { Observable } from 'rxjs';
import { fadeSlideIn, slideInRight } from '../../../core/animations';

@Component({
  selector: 'app-blog-comments',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './blog-comments.html',
  styleUrl: './blog-comments.css',
  animations: [fadeSlideIn, slideInRight],
})
export class BlogComments implements OnInit {
  @Input() postSlug!: string;

  private fb = inject(FormBuilder);
  private blogService = inject(BlogService);

  comments$!: Observable<Comment[]>;
  commentForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    if (this.postSlug) {
      this.loadComments();
    }
  }

  private loadComments() {
    this.comments$ = this.blogService.getComments(this.postSlug);
  }

  onSubmit() {
    if (this.commentForm.valid) {
      this.isSubmitting = true;
      const commentData = {
        postSlug: this.postSlug,
        author: this.commentForm.value.author,
        content: this.commentForm.value.content
      };

      this.blogService.addComment(commentData).subscribe({
        next: () => {
          this.commentForm.reset();
          this.loadComments(); // Reload comments
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error adding comment:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      this.commentForm.markAllAsTouched();
    }
  }

  deleteComment(commentId: string) {
    if (confirm('Naozaj chcete vymazať tento komentár?')) {
      this.blogService.deleteComment(commentId).subscribe({
        next: () => {
          this.loadComments(); // Reload comments
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        }
      });
    }
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }
}
