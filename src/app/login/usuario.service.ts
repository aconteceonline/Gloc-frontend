// src/app/tws-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  // Substitua pela URL do seu backend que se comunica com a TWS
  private backendUrl = 'http://localhost:3001/tokens'; // Exemplo de URL do backend
// Chave usada para armazenar o nome de usuário no localStorage
  private readonly USERNAME_STORAGE_KEY = 'user_name';

  constructor(private http: HttpClient) {

   }

  /**
   * Método para iniciar o processo de login na TWS via backend.
   * @param credentials - Objeto contendo as credenciais de login (ex: username, nome, password, host, port).
   * @returns Um Observable que emite a resposta do backend.
   */
  login(credentials: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'

      })

    };

    return this.http.post<any>(`${this.backendUrl}`, credentials, httpOptions)
      .pipe(
        tap(response => {
           console.log('Serviços Login TWS bem-sucedido:', response);
          // Aqui você pode, por exemplo, armazenar um token de autenticação retornado pelo backend
          // ou qualquer outra informação de sessão necessária.
         if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
        }),
        catchError(this.handleError)

      );
  }

/**
   * **NOVO MÉTODO:** Obtém o nome de usuário armazenado.
   * @returns O nome de usuário, ou null se não estiver logado.
   */
  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_STORAGE_KEY);
  }


  /**
   * Método para verificar o status da conexão com a TWS via backend.
   * @returns Um Observable com o status da conexão.
   */
  getConnectionStatus(): Observable<any> {
    return this.http.get<any>(`${this.backendUrl}/status`)
      .pipe(
        tap(response => console.log('Status da conexão TWS:', response)),
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento de erros HTTP.
   * @param error - O erro HTTP retornado.
   * @returns Um Observable que lança o erro.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou da rede
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro retornado pelo servidor (status code)
      errorMessage = `Código de Erro: ${error.status}, Mensagem: ${error.message}`;
      if (error.error && typeof error.error === 'object') {
        // Tenta extrair mensagens de erro mais específicas do corpo da resposta JSON
        errorMessage += `, Detalhes: ${JSON.stringify(error.error)}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
   logout(): void {
    // Remove o token para deslogar
    localStorage.clear();
  }
}
