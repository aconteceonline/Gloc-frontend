// services/cep.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';

export interface EnderecoOpenCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // Cidade
  uf: string;         // Estado
  ibge: string;
}

@Injectable({
  providedIn: 'root'
})
export class Cep_Service {
// Usando ViaCEP que não dá erro de CORS
  private readonly API_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) { }

  buscarCep(cep: string): Observable<any> {
    // Limpa o CEP (deixa só números)
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      return of({ erro: true });
    }

    return this.http.get(`${this.API_URL}/${cepLimpo}/json/`).pipe(
      catchError(error => {
        console.error('Erro na requisição:', error);
        return of({ erro: true });
      })
    );
  }
}
