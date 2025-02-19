import { Routes } from '@angular/router';
import { DashboardComponent } from './layout/private/dashboard/dashboard.component';
import { TasksComponent } from './layout/private/tasks/tasks.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'tasks',
    component: TasksComponent,
  },
];
