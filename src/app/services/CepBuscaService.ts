// src/app/services/cep-busca.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { Endereco } from '../models/Endereco.model';

@Injectable({
  providedIn: 'root'
})
export class CepBuscaService {
  private readonly API_URL = 'https://viacep.com.br/ws/';

  constructor(private http: HttpClient) { }

  buscarEndereco(cep: string): Observable<Endereco> {
    // 1. Limpa o CEP (remove traço e outros)
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      // Retorna um Observable com erro se o CEP for inválido
      return of({ erro: true } as Endereco);
    }

    // 2. Monta a URL e faz a requisição
    const url = `${this.API_URL}${cepLimpo}/json/`;

    // 3. O 'pipe' trata o Observable
    return this.http.get<Endereco>(url).pipe(
      // Verifica se a API retornou o campo 'erro'
      map(data => {
        if (data && data.hasOwnProperty('erro') && data.erro === true) {
          return { erro: true } as Endereco;
        }
        return data; // Retorna o endereço se for válido
      }),
      // Trata erros de rede (ex: servidor fora do ar)
      catchError(error => {
        console.error('Erro ao buscar CEP:', error);
        return of({ erro: true } as Endereco);
      })
    );
  }
}
