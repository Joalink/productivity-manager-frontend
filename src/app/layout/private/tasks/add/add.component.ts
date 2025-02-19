import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ApiService } from '@services/api.service';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';



@Component({
  selector: 'app-add',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    CalendarModule,
    InputNumber,
  ],
  templateUrl: './add.component.html',
  styleUrl: './add.component.css',
  standalone: true,
  providers: [ApiService],
})
export class AddComponent {
  description: string = '';
  date: Date = new Date();
  duration: number = 1;
  status: string = 'PENDING';
  displayAddDialog: boolean = false;

  constructor(private apiService: ApiService) {}

  showDialog() {
    this.displayAddDialog = true;
  }

  accept() {
    const newTask = {
      description: this.description,
      end_date: this.date,
      duration: this.duration,
      status: this.status,
    };

    try {
      this.apiService.createData(newTask).subscribe((data) => {
        console.log('Task added: ', data);
      });
    } catch (error) {
      console.error('Error adding task: ', error);
    }

    this.displayAddDialog = false;
  }

  cancel() {
    this.displayAddDialog = false;
  }
}
