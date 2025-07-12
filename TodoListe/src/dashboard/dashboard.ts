import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service/authservice';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  isLoggedIn = this.authService.isLoggedIn;
  username: string = 'Utilisateur';

  newTaskTitle = '';
  taskCreationError = signal('');
  taskCreationLoading = signal(false);
  tasks: any[] = [];

  selectedTask: any = null;
  editedTaskTitle: string = '';
  taskToDelete: any = null;

  ngOnInit() {
    this.loadData();
    this.loadTasks();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // rediriger si nécessaire
  }

  loadData() {
    this.http.get('https://todof.woopear.fr/api/v1/user/profil').subscribe({
      next: (response: any) => {
        this.username = response.data?.username || 'Utilisateur';
      },
      error: () => {
        this.username = 'Utilisateur';
      }
    });
  }

  loadTasks() {
    const token = this.authService.getToken();
    if (!token) {
      this.tasks = [];
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get('https://todof.woopear.fr/api/v1/tasks', { headers }).subscribe({
      next: (response: any) => {
        this.tasks = response.data || [];
      },
      error: () => {
        this.tasks = [];
      }
    });
  }

  createTask() {
    if (!this.newTaskTitle.trim()) {
      this.taskCreationError.set('Le titre de la tâche ne peut pas être vide');
      return;
    }
    this.taskCreationLoading.set(true);
    this.taskCreationError.set('');

    const token = this.authService.getToken();
    if (!token) {
      this.taskCreationLoading.set(false);
      this.taskCreationError.set('Utilisateur non authentifié');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = { title: this.newTaskTitle };

    this.http.post('https://todof.woopear.fr/api/v1/task', body, { headers }).subscribe({
      next: () => {
        this.taskCreationLoading.set(false);
        this.newTaskTitle = '';
        this.loadTasks();
      },
      error: () => {
        this.taskCreationLoading.set(false);
        this.taskCreationError.set('Erreur lors de la création de la tâche');
      }
    });
  }

  selectTaskForEdit(task: any) {
    this.selectedTask = task;
    this.editedTaskTitle = task.title;
  }

  updateTask() {
    if (!this.selectedTask || !this.editedTaskTitle.trim()) {
      return;
    }
    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(`https://todof.woopear.fr/api/v1/task/`,
      { title: this.editedTaskTitle }, { headers }).subscribe({
        next: () => {
          this.editedTaskTitle = '';
          this.selectedTask = null;
          this.loadTasks();
        }
      });
  }

  selectTaskForDelete(task: any) {
    this.taskToDelete = task;
  }

  deleteTask() {
    if (!this.taskToDelete) return;
    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(`https://todof.woopear.fr/api/v1/task/delete/user`, { headers }).subscribe({
      next: () => {
        this.taskToDelete = null;
        this.loadTasks();
      }
    });
  }
}
