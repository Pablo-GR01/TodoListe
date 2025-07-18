import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service/authservice';
import { FormsModule } from '@angular/forms';

interface Task {
  id: string;
  label: string;
  done: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  username = 'Utilisateur';
  newTaskTitle = '';
  taskCreationError = '';
  editedTaskTitle = '';
  editingTask: Task | null = null;
  taskCreationLoading = false;
  taskUpdateLoading = false;

  tasks: Task[] = [];
loadingTasks = true;  // <-- nouvelle variable

ngOnInit() {
  if (!this.auth.getToken()) {
    this.router.navigate(['/login']);
    return;
  }
  this.loadUserProfile();
  this.loadTasks();
}

loadTasks() {
  this.loadingTasks = true;
  const headers = this.auth.getAuthHeaders();
  this.http.get<{ data: Task[] }>('https://todof.woopear.fr/api/v1/task', { headers }).subscribe({
    next: (res) => {
      this.tasks = Array.isArray(res.data) ? res.data : [];
      this.loadingTasks = false;
    },
    error: (err) => {
      console.error('Chargement tâches échoué', err);
      this.tasks = [];
      this.loadingTasks = false;
    }
  });
}


  loadUserProfile() {
    this.auth.getUserProfile().subscribe({
      next: (res: any) => {
        const u = res.data;
        this.username = u.username || u.email || 'Utilisateur';
      },
      error: () => {
        this.username = 'Utilisateur';
      }
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  createTask() {
    const title = this.newTaskTitle.trim();
    this.taskCreationError = '';

    if (!title) {
      this.taskCreationError = 'Titre requis.';
      return;
    }
    if (this.tasks.some(t => t.label?.toLowerCase() === title.toLowerCase())) {
      this.taskCreationError = 'Titre déjà utilisé.';
      return;
    }

    this.taskCreationLoading = true;
    const headers = this.auth.getAuthHeaders();

    this.http.post<{ data: Task }>('https://todof.woopear.fr/api/v1/task', { label: title }, { headers }).subscribe({
      next: (res) => {
        if (res.data) {
          this.tasks.unshift(res.data);
          this.newTaskTitle = '';
        }
        this.taskCreationLoading = false;
      },
      error: () => {
        this.taskCreationError = 'Erreur création tâche.';
        this.taskCreationLoading = false;
      }
    });
  }

  startEdit(task: Task) {
    this.editingTask = task;
    this.editedTaskTitle = task.label;
    this.taskCreationError = '';
  }

  cancelEdit() {
    this.editingTask = null;
    this.editedTaskTitle = '';
    this.taskCreationError = '';
  }

  updateTask() {
    if (!this.editingTask) {
      this.taskCreationError = 'Aucune tâche à modifier.';
      return;
    }

    const newTitle = this.editedTaskTitle.trim();
    if (!newTitle) {
      this.taskCreationError = 'Titre requis.';
      return;
    }

    if (this.tasks.some(t => t.id !== this.editingTask!.id && t.label?.toLowerCase() === newTitle.toLowerCase())) {
      this.taskCreationError = 'Titre déjà utilisé.';
      return;
    }

    const id = this.editingTask.id;
    if (!id) {
      this.taskCreationError = 'ID invalide.';
      return;
    }

    this.taskUpdateLoading = true;
    const headers = this.auth.getAuthHeaders();

    this.http.put(`https://todof.woopear.fr/api/v1/task/${id}/user`, { label: newTitle }, { headers }).subscribe({
      next: () => {
        this.editingTask!.label = newTitle;
        this.cancelEdit();
        this.taskUpdateLoading = false;
      },
      error: () => {
        this.taskCreationError = 'Erreur mise à jour.';
        this.taskUpdateLoading = false;
      }
    });
  }

  deleteTask(task: Task) {
    if (!task || !task.id) {
      console.error('ID invalide pour suppression', task);
      return;
    }

    if (!confirm(`Supprimer la tâche "${task.label}" ?`)) return;

    const headers = this.auth.getAuthHeaders();

    this.http.delete(`https://todof.woopear.fr/api/v1/task/${task.id}/user`, { headers }).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      },
      error: (err) => {
        console.error('Erreur suppression tâche', err);
      }
    });
  }
}
