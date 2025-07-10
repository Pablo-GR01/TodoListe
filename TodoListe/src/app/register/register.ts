import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  user = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private http: HttpClient) {}

  onSubmit() {
    this.http.post('http://localhost:3000/api/users/register', this.user)
      .subscribe({
        next: res => alert("Utilisateur inscrit !"),
        error: err => console.error(err)
      });
  }
}