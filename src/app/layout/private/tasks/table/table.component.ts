import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ApiService } from '@services/api.service';
import { Tasks } from '@interfaces/tasks.model';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
// import { Subscription } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    FormsModule,
    InputNumber,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  standalone: true,
  // providers: [ApiService],
})
export class TableComponent implements OnInit {
  tasks: Tasks[] = [];
  selectedTask: Tasks | null = null;
  taskId: number | null = null;
  displayEditDialog: boolean = false;
  displayDeleteDialog: boolean = false;

  description: string = '';
  date: Date | undefined;
  duration: number = 1;
  status: string = 'PENDING';

  activeAction: string = '';
  isStarted: { [key: number]: boolean } = {};
  private timer: any;
  private startTime: number = 0;
  private elapsedTime: number = 0;

  // private taskSubscription!: Subscription;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.getTasks();
    // this.getTasksByStatus(this.status);

    // this.taskSubscription = this.apiService.dataUpdate$.subscribe(() => {
    //   this.getTasks();
    // });
  }

  // ngOnDestroy(): void {
  //   this.taskSubscription.unsubscribe();
  // }

  getTasks() {
    this.apiService.getData().subscribe((data: Tasks[]) => {
      this.tasks = data.filter((task) => task.status !== 'DELETED');
      console.log('Tasks: ', data);
    });
  }

  getTasksByStatus(status: string) {
    this.apiService.getDataByStatus(status).subscribe((data: Tasks[]) => {
      this.tasks = data;
      console.log('Tasks: ', data);
    });
  }

  editTask(task: Tasks) {
    console.log('Edit task: ', task);
    this.taskId = task.id;
    this.description = task.description;
    this.date = new Date(task.end_date);
    this.duration = task.duration;
    this.status = task.status;
    this.displayEditDialog = true;
  }

  EditTask() {
    const updatedTask = {
      description: this.description,
      end_date: this.date,
      duration: this.duration,
      status: this.status,
    };
    if (this.taskId === null) {
      console.error('El ID de la tarea es nulo, no se puede actualizar.');
      return;
    }
    try {
      this.apiService.updateData(this.taskId, updatedTask).subscribe((data) => {
        console.log('Tarea actualizada:', data);
        this.getTasks();
      });
    } catch (error) {
      console.error('Error adding task: ', error);
    }
    console.log('Tarea editada:', this.taskId);
    this.displayEditDialog = false;
  }

  cancelEdit() {
    this.displayEditDialog = false;
  }

  deleteTask(task: Tasks) {
    console.log('Delete task: ', task);
    this.taskId = task.id;
    this.displayDeleteDialog = true;
  }

  removeTask() {
    const updatedTask = {
      status: 'DELETED',
    };
    if (this.taskId === null) {
      console.error('El ID de la tarea es nulo, no se puede actualizar.');
      return;
    }
    try {
      this.apiService.updateData(this.taskId, updatedTask).subscribe((data) => {
        console.log('Tarea eliminada:', data);
        this.getTasks();
      });
    } catch (error) {
      console.error('Error deleted task: ', error);
    }
    console.log('Tarea editada:', this.taskId);
    this.displayEditDialog = false;
  }

  cancelDelete() {
    this.displayDeleteDialog = false;
  }

  startTask(task: Tasks) {
    console.log('Start task: ', task);
    if (this.taskId !== null && this.taskId !== task.id) {
      this.isStarted[this.taskId] = false;
      this.resetTimer();
    }
    this.taskId = task.id;
    this.activeAction = 'start';
    this.isStarted[task.id] = true;
    this.startTime = Date.now() - this.elapsedTime;
    this.timer = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
    }, 1000);

    this.tasks = this.tasks.map((t) => ({
      ...t,
      status: t.id === task.id ? 'COMPLETE' : t.status,
    }));
    this.tasks.sort((a, b) => (a.id === this.taskId ? -1 : 1));
  }

  pauseTask(task: Tasks) {
    console.log('Stop task: ', task);
    if (this.taskId === task.id) {
      clearInterval(this.timer);
      this.activeAction = 'stop';
      console.log(`⏸️ Tiempo pausado: ${this.formatTime(this.elapsedTime)}`);
    }
  }

  resetTask(task: Tasks) {
    console.log('Reset task: ', task);
    if (this.taskId === task.id) {
      this.activeAction = 'reset';
      this.resetTimer();
      console.log('🔄 Temporizador reiniciado.');
    }
  }

  completeTask(task: Tasks) {
    console.log('Complete task: ', task);
    if (this.taskId === task.id) {
      clearInterval(this.timer);
      this.activeAction = 'complete';

      const updatedTask = {
        description: task.description,
        end_date: new Date(task.end_date).toISOString(), // ✅ Formato ISO para end_date
        duration: task.duration,
        recorded_time: this.formatTime(this.elapsedTime), // ✅ Formato 'HH:mm:ss'
        status: 'COMPLETED',
      };

      console.log('🛠️ Payload enviado:', updatedTask);

      if (this.taskId === null) {
        console.error('El ID de la tarea es nulo, no se puede actualizar.');
        return;
      }

      console.log('🆔 ID de la tarea:', this.taskId);

      try {
        this.apiService.updateData(this.taskId, updatedTask).subscribe({
          next: (data) => {
            console.log('✅ Tarea actualizada:', data);
            this.getTasks();
          },
          error: (error) => {
            console.error('❌ Error al actualizar tarea:', error);
          },
        });
      } catch (error) {
        console.error('⚠️ Error inesperado al actualizar tarea:', error);
      }

      console.log(
        `✅ Tarea completada en: ${this.formatTime(this.elapsedTime)}`
      );
      this.resetTimer();
      this.taskId = null;
    }
  }

  private resetTimer() {
    clearInterval(this.timer);
    this.startTime = 0;
    this.elapsedTime = 0;
  }

  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`; // ✅ Devuelve 'HH:mm:ss'
  }
}
