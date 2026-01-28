import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  credentials = {
    host: 'localhost',
    port: 3001, // Porta padrão da TWS API
    clientId: 1, // Um ID único para esta conexão
    usuario: '',
    senha: '',
  };

  errorMessage: string | null = null;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  onLogin(): void {
    this.errorMessage = null;
    this.isLoggedIn = false;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/dashboard']); // Redirect to template on successful login
        }
      },
      error: (err) => {
        alert('Credenciais inválidas!');
      },
    });
  }
}
