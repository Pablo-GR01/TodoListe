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
  editedTaskTitle = '';
  taskToDelete: any = null;

  // Variables ajoutées pour la modification
  editingTask: any = null;
  taskUpdateLoading = false;

  ngOnInit() {
    this.loadData();
    this.loadTasks();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadData() {
    const token = this.authService.getToken();
    if (!token) {
      this.username = 'Utilisateur'; // Pas connecté
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get('https://todof.woopear.fr/api/v1/user/profil', { headers }).subscribe({
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

    this.http.get('https://todof.woopear.fr/api/v1/task/user', { headers }).subscribe({
      next: (response: any) => {
        console.log('Tasks reçues:', response.data);
        this.tasks = response.data;
      },
      error: () => {
        this.tasks = [];
      }
    });
  }

  createTask() {
    this.taskCreationError.set('');

    const newTitle = this.newTaskTitle.trim();

    if (!newTitle) {
      this.taskCreationError.set('Le titre de la tâche est obligatoire.');
      return;
    }

    const exists = this.tasks.some(task => task.title.toLowerCase() === newTitle.toLowerCase());
    if (exists) {
      this.taskCreationError.set('Une tâche avec ce titre existe déjà.');
      return;
    }

    this.taskCreationLoading.set(true);

    // Simule création locale, remplacer par appel API si besoin
    setTimeout(() => {
      this.tasks.push({ title: newTitle, _id: Math.random().toString(36).slice(2) });
      this.newTaskTitle = '';
      this.taskCreationLoading.set(false);
    }, 500);
  }

  // Modifier une tâche
  startEdit(task: any) {
    console.log('Tâche sélectionnée pour modification :', task);
    this.editingTask = task;
    this.editedTaskTitle = task.title;
    this.taskCreationError.set('');
  }

  cancelEdit() {
    this.editingTask = null;
    this.editedTaskTitle = '';
    this.taskCreationError.set('');
  }

  updateTask() {
  if (!this.editingTask) return;

  const updatedTitle = this.editedTaskTitle.trim();
  if (!updatedTitle) {
    this.taskCreationError.set("Le titre modifié est obligatoire.");
    return;
  }

  // Trouve la tâche dans le tableau par son _id
  const index = this.tasks.findIndex(t => t._id === this.editingTask._id);
  if (index === -1) {
    this.taskCreationError.set("Tâche introuvable.");
    return;
  }

  this.tasks[index].title = updatedTitle;

  this.editingTask = null;
  this.editedTaskTitle = '';
  this.taskCreationError.set('');
}


deleteTask(task: any) {
  if (!confirm(`Voulez-vous vraiment supprimer la tâche "${task.title}" ?`)) {
    return; // Annule si l'utilisateur ne confirme pas
  }

  const token = this.authService.getToken();
  if (!token) {
    console.warn('Token manquant');
    return;
  }

  const taskId = task._id;
  const objectIdPattern = /^[a-f\d]{24}$/i;

  if (!taskId || !objectIdPattern.test(taskId)) {
    // ID invalide = tâche locale, supprime localement
    this.tasks = this.tasks.filter(t => t._id !== taskId);
    console.log('Tâche locale supprimée localement:', task);
    return;
  }

  // Sinon suppression via API pour tâches "server"
  const url = `https://todof.woopear.fr/api/v1/task/${taskId}/user`;
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  this.http.delete(url, { headers }).subscribe({
    next: () => {
      console.log('✅ Tâche supprimée du serveur');
      this.loadTasks();
    },
    error: (err) => {
      console.error('❌ Erreur suppression tâche:', err);
    }
  });
}

}
