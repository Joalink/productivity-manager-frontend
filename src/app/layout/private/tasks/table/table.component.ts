import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ApiService } from '@services/api.service';
import { Tasks } from '@interfaces/tasks.model';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { firstValueFrom } from 'rxjs';


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

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.getTasks();
    // this.getTasksByStatus(this.status);
  }

  async getTasks() {
    try {
      const data: Tasks[] = await firstValueFrom(this.apiService.getData());
      this.tasks = data.filter((task) => task.status !== 'DELETED');
      console.log('Tasks:', data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  async getTasksByStatus(status: string) {
    try {
      const data: Tasks[] = await firstValueFrom(
        this.apiService.getDataByStatus(status)
      );
      this.tasks = data;
      console.log('Tasks by status:', data);
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
    }
  }

  editTask(task: Tasks) {
    this.taskId = task.id;
    this.description = task.description;
    this.date = new Date(task.end_date);
    this.duration = task.duration;
    this.status = task.status;
    this.displayEditDialog = true;
  }

  async EditTask() {
    const updatedTask = {
      description: this.description,
      end_date: this.date,
      duration: this.duration,
      status: this.status,
    };

    if (this.taskId === null) {
      return;
    }

    try {
      const data = await firstValueFrom(
        this.apiService.updateData(this.taskId, updatedTask)
      );
      console.log('Task updated:', data);
      await this.getTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
    this.displayEditDialog = false;
  }

  cancelEdit() {
    this.displayEditDialog = false;
  }

  deleteTask(task: Tasks) {
    this.taskId = task.id;
    this.displayDeleteDialog = true;
  }

  async removeTask() {
    const updatedTask = {
      status: 'DELETED',
    };

    if (this.taskId === null) {
      return;
    }

    try {
      const data = await firstValueFrom(
        this.apiService.updateData(this.taskId, updatedTask)
      );
      console.log('Task deleted:', data);
      await this.getTasks(); // Refresca la tabla después de eliminar
    } catch (error) {
      console.error('Error deleting task:', error);
    }
    this.displayDeleteDialog = false;
  }

  cancelDelete() {
    this.displayDeleteDialog = false;
  }

  startTask(task: Tasks) {
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
    if (this.taskId === task.id) {
      clearInterval(this.timer);
      this.activeAction = 'stop';
    }
  }

  resetTask(task: Tasks) {
    if (this.taskId === task.id) {
      this.activeAction = 'reset';
      this.resetTimer();
    }
  }

  async completeTask(task: Tasks) {
    if (this.taskId === task.id) {
      clearInterval(this.timer);
      this.activeAction = 'complete';

      const updatedTask = {
        description: task.description,
        end_date: new Date(task.end_date).toISOString(),
        duration: task.duration,
        recorded_time: this.formatTime(this.elapsedTime),
        status: 'COMPLETED',
      };

      if (this.taskId === null) {
        return;
      }

      try {
        const data = await firstValueFrom(
          this.apiService.updateData(this.taskId, updatedTask)
        );
        console.log('Task updated:', data);
        await this.getTasks();
      } catch (error) {
        console.error('Error updating task:', error);
      }

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
