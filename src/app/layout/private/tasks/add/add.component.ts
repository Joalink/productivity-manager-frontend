import { Component, Output, EventEmitter } from '@angular/core';
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
  @Output() taskAdded = new EventEmitter<void>();
  description: string = '';
  date: Date = new Date();
  duration: number = 1;
  status: string = 'PENDING';
  displayAddDialog: boolean = false;

  constructor(private apiService: ApiService) {}

  showDialog() {
    this.displayAddDialog = true;
  }

  async accept() {
    const newTask = {
      description: this.description,
      end_date: this.date,
      duration: this.duration,
      status: this.status,
    };

    try {
      await this.apiService.createData(newTask).subscribe(() => {
        console.log('Task Added');
        window.location.reload(); // 🔄 Recarga la página
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  cancel() {
    this.displayAddDialog = false;
  }
}
