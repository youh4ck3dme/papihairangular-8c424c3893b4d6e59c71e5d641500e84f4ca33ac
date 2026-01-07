import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    {
        path: 'seo',
        loadComponent: () => import('./seo/seo.component').then(m => m.SeoComponent)
    },
    {
        path: 'blog-topics',
        loadComponent: () => import('./blog-topics/blog-topics.component').then(m => m.BlogTopicsComponent)
    },
    {
        path: 'code-generator',
        loadComponent: () => import('./code-generator/code-generator.component').then(m => m.CodeGeneratorComponent)
    },
    {
        path: 'api-keys',
        loadComponent: () => import('./api-keys/api-keys.component').then(m => m.ApiKeysComponent)
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule { }
