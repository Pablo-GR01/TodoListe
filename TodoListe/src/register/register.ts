import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth-service/authservice';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';

  loading = signal(false);
  errorMessage = signal('');

  register() {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage.set('Tous les champs sont obligatoires.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard/']); // ou '/dashboard'
      },
      error: (err) => {
        this.loading.set(false);

        // Optionnel : affichage d'un message plus précis
        if (err?.error?.message) {
          this.errorMessage.set(err.error.message);
        } else {
          this.errorMessage.set("Erreur lors de la création du compte.");
        }
      }
    });
  }
}
