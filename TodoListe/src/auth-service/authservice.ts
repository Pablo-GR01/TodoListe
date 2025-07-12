// Import des outils Angular nécessaires
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

// Interface pour le login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface pour la réponse de connexion
export interface LoginResponse {
  data: {
    token: string;
  };
}

// Injectable = service accessible globalement
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // URL de base de l’API backend
  private apiUrl = 'https://todof.woopear.fr/api/v1/user';

  // Signal de connexion
  isLoggedIn = signal(this.hasValidToken());

  /**
   * Connexion de l'utilisateur
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.data.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  /**
   * Enregistrement d'un nouvel utilisateur
   */
  register(username: string, email: string, password: string): Observable<any> {
    const payload = { username, email, password };
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Récupère le token depuis le localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Vérifie si le token JWT est encore valide
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}