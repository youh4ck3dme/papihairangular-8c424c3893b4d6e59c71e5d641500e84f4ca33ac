import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, throwError } from 'rxjs';
import { switchMap, takeWhile, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ImageJob {
  status: 'queued' | 'running' | 'done' | 'error';
  url?: string;
  error?: string;
  createdAt?: number;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private http = inject(HttpClient);
  // Vercel: use /api/image/jobs, VPS: use /proxy/image-job.php
  private apiUrl = environment.production ? '/api/image/jobs' : '/proxy/image-job.php';

  /**
   * Create image generation job
   */
  createJob(imageBase64: string, prompt: string, model = 'gpt-image-1', size = '1024x1024'): Observable<{ jobId: string }> {
    return this.http.post<{ jobId: string }>(this.apiUrl, {
      image: imageBase64,
      prompt: prompt.trim(),
      model,
      size
    });
  }

  /**
   * Poll job status until done or error
   */
  pollJob(jobId: string, intervalMs = 900): Observable<ImageJob> {
    return interval(intervalMs).pipe(
      switchMap(() => this.http.get<ImageJob>(`${this.apiUrl}?jobId=${jobId}`)),
      takeWhile((job) => job.status !== 'done' && job.status !== 'error', true),
      catchError(err => {
        console.error('[ImageService] Poll error:', err);
        return throwError(() => new Error('Failed to poll job status'));
      })
    );
  }

  /**
   * Get job status (single check, no polling)
   */
  getJobStatus(jobId: string): Observable<ImageJob> {
    return this.http.get<ImageJob>(`${this.apiUrl}?jobId=${jobId}`);
  }
}

