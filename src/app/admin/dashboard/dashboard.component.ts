import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    imports: [CommonModule, RouterModule]
})
export class DashboardComponent {
    private router = inject(Router);

    logout(): void {
        localStorage.removeItem('admin_authenticated');
        this.router.navigate(['/']);
    }
}
