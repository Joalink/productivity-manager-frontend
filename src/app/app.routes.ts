import { Routes } from '@angular/router';
import { DashboardComponent } from './layout/private/dashboard/dashboard.component';
import { TasksComponent } from './layout/private/tasks/tasks.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tasks', // Redirige a la ruta 'tasks' por defecto
    pathMatch: 'full', // Asegúrate de que coincida con la ruta completa
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'tasks',
    component: TasksComponent,
  },
];
