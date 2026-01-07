import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private swPush = inject(SwPush);
    private subscriptionSubject = new BehaviorSubject<PushSubscription | null>(null);
    readonly subscription$ = this.subscriptionSubject.asObservable();

    constructor() {
        this.checkInitialSubscription();
    }

    get isEnabled(): boolean {
        return this.swPush.isEnabled;
    }

    /**
     * Request subscription to push notifications
     */
    requestSubscription(): Observable<PushSubscription | null> {
        if (!this.swPush.isEnabled) {
            console.warn('Service Worker Push is not enabled.');
            return of(null);
        }

        return from(this.swPush.requestSubscription({
            serverPublicKey: environment.vapidPublicKey
        })).pipe(
            map(sub => {
                console.log('Push Subscription successful:', sub);
                this.subscriptionSubject.next(sub);
                // Here you would typically send the subscription object to your backend
                return sub;
            }),
            catchError(err => {
                console.error('Push Subscription failed:', err);
                return of(null);
            })
        );
    }

    /**
     * Unsubscribe from push notifications
     */
    unsubscribe(): Observable<boolean> {
        if (!this.swPush.isEnabled) {
            return of(false);
        }

        return this.swPush.subscription.pipe(
            take(1),
            switchMap(sub => {
                if (sub) {
                    return from(sub.unsubscribe());
                }
                return of(false);
            }),
            map(result => {
                if (result) {
                    this.subscriptionSubject.next(null);
                }
                return result;
            }),
            catchError(err => {
                console.error('Unsubscribe failed:', err);
                return of(false);
            })
        );
    }

    /**
     * Check if user is already subscribed
     */
    private checkInitialSubscription() {
        if (this.swPush.isEnabled) {
            this.swPush.subscription.pipe(take(1)).subscribe(sub => {
                this.subscriptionSubject.next(sub);
            });
        }
    }

    /**
     * Listen for notification clicks
     */
    get notificationClicks$() {
        return this.swPush.notificationClicks;
    }
}
