import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/visites/visite-list/visite-list.component').then(m => m.VisiteListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./features/visites/visite-form/visite-form.component').then(m => m.VisiteFormComponent)
  }
];
