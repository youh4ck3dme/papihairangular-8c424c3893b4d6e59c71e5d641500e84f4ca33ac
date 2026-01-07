import { Injectable, ApplicationRef, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, first, interval, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerUpdateService {
  private swUpdate = inject(SwUpdate);
  private appRef = inject(ApplicationRef);

  private updateCheckInterval = 6 * 60 * 60 * 1000; // 6 hours

  /**
   * Initialize service worker update strategies
   */
  public initialize(): void {
    if (!this.swUpdate.isEnabled) {

      return;
    }

    // Check for updates when app stabilizes
    this.checkForUpdatesOnStable();

    // Listen for version updates
    this.listenForVersionUpdates();

    // Listen for unrecoverable state
    this.listenForUnrecoverableState();

    // Periodic update checks
    this.schedulePeriodicUpdateChecks();
  }

  /**
   * Check for updates when app becomes stable
   */
  private checkForUpdatesOnStable(): void {
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );

    const everySixHours$ = interval(this.updateCheckInterval);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(async () => {
      try {
        await this.swUpdate.checkForUpdate();
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  /**
   * Listen for new version ready events
   */
  private listenForVersionUpdates(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(() => {
        this.promptUserToUpdate();
      });
  }

  /**
   * Listen for unrecoverable state
   */
  private listenForUnrecoverableState(): void {
    this.swUpdate.unrecoverable.subscribe(event => {
      console.error('Unrecoverable state:', event.reason);

      // Notify user and reload
      if (confirm(
        'Aplikácia sa dostala do nekonzistentného stavu. ' +
        'Chcete obnoviť stránku?'
      )) {
        window.location.reload();
      }
    });
  }

  /**
   * Schedule periodic update checks
   */
  private schedulePeriodicUpdateChecks(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Check every 6 hours
    interval(this.updateCheckInterval).subscribe(async () => {
      try {
        await this.swUpdate.checkForUpdate();
      } catch (err) {
        console.error('Periodic update check failed:', err);
      }
    });
  }

  /**
   * Prompt user to update to new version
   */
  private promptUserToUpdate(): void {
    // Create custom notification
    const notification = this.createUpdateNotification();
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds if not interacted with
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Create update notification element
   */
  private createUpdateNotification(): HTMLElement {
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <div class="sw-update-icon">🔄</div>
        <div class="sw-update-text">
          <h4>Nová verzia je dostupná!</h4>
          <p>Kliknite pre aktualizáciu aplikácie.</p>
        </div>
        <button class="sw-update-btn" onclick="window.location.reload()">
          Aktualizovať
        </button>
        <button class="sw-update-close" onclick="this.closest('.sw-update-notification').remove()">
          ✕
        </button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .sw-update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        animation: slideInUp 0.4s ease-out;
      }

      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .sw-update-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(212, 175, 55, 0.3);
        max-width: 400px;
      }

      .sw-update-icon {
        font-size: 2rem;
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .sw-update-text h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #d4af37;
      }

      .sw-update-text p {
        margin: 0;
        font-size: 0.875rem;
        color: #cccccc;
      }

      .sw-update-btn {
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #d4af37, #f4c542);
        color: #000000;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
      }

      .sw-update-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
      }

      .sw-update-close {
        background: transparent;
        border: none;
        color: #888888;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.25rem;
        line-height: 1;
        transition: color 0.2s ease;
      }

      .sw-update-close:hover {
        color: #ffffff;
      }

      @media (max-width: 640px) {
        .sw-update-notification {
          bottom: 10px;
          right: 10px;
          left: 10px;
        }

        .sw-update-content {
          flex-wrap: wrap;
          gap: 0.75rem;
        }
      }
    `;

    notification.appendChild(style);
    return notification;
  }

  /**
   * Manually activate update
   */
  public async activateUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    try {
      await this.swUpdate.activateUpdate();
      window.location.reload();
      return true;
    } catch (err) {
      console.error('Failed to activate update:', err);
      return false;
    }
  }

  /**
   * Check for updates manually
   */
  public async checkForUpdate(): Promise<boolean> {
    if (!this.swUpdate.isEnabled) {
      return false;
    }

    try {
      return await this.swUpdate.checkForUpdate();
    } catch (err) {
      console.error('Failed to check for update:', err);
      return false;
    }
  }
}
