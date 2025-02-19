import { Component } from '@angular/core';
import { TableComponent } from './table/table.component';
import { AddComponent } from './add/add.component';


import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    TableComponent,
    AddComponent,
    ButtonModule,
  ],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {}
