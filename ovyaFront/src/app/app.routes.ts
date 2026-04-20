import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'visites',
    pathMatch: 'full'
  },
  {
    path: 'visites',
    loadComponent: () => import('./features/visites/visite-list/visite-list.component').then(m => m.VisiteListComponent)
  },
  {
    path: 'acqs',
    loadComponent: () => import('./features/acqs/acq-page/acq-page.component').then(m => m.AcqPageComponent)
  },
  {
    path: 'ccials',
    loadComponent: () => import('./features/ccials/ccial-page/ccial-page.component').then(m => m.CcialPageComponent)
  },
  {
    path: 'dossiers',
    loadComponent: () => import('./features/dossiers/dossier-page/dossier-page.component').then(m => m.DossierPageComponent)
  }
];
