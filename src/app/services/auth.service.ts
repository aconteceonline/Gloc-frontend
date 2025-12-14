import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3001/tokens';
  private tokenSubject = new BehaviorSubject<string | null>(null);

 // Chave usada para armazenar o token no localStorage
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'user_name';

 // private token: string | null = null;

  constructor(private http: HttpClient,  private router: Router) {  this.loadToken() ;}

  login(credentials: any): Observable<any> {
    // TWS Authentication: Send credentials to the backend

    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap(response => {
        const token = response.token;
        const username = response.user_name || response.usuario; // Usar 'user_name' ou 'usuario' dependendo do backend.
        console.log(' usuario logado aut ', username)
        if (token && username) {
            this.setToken(token);
            // ✅ Armazena o username
            this.setUsername(username);
        } else {
            // Se faltar token/username, trata como falha
            alert('Resposta de login incompleta.');
        }
      }),
      catchError(error => {
         alert('Credenciais inválidas!');
        return of(null);
      })
    );
  }

  // 🆕 NOVO MÉTODO: Retorna o username
  public getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token ; // Retorna true se o token existir, false caso contrário
  }

  /**
   * Remove o token para fazer logout.
   */
  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
     this.router.navigate(['']);
  }
  private setUsername(username: string): void {
    // Usando a constante USERNAME_KEY (que também deve ser declarada)
    localStorage.setItem(this.USERNAME_KEY, username);
  }
   private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  private loadToken(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

}

