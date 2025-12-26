// src/app/services/cep-busca.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { BucaEnderecoModel as Endereco } from '../glocModel/busca-endereco.model';
import { EnderecoModel } from '../glocModel/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class CepBuscaService {
 private readonly API_URL = 'https://brasilapi.com.br/api/cep/v2/';

 constructor(private http: HttpClient) { }

  buscarEndereco(cep: string): Observable<Endereco> {
    // 1. Limpa o CEP (remove traço e outros)
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      // Retorna um Observable com erro se o CEP for inválido
      return of({ erro: true } as Endereco);
    }

    // 2. Monta a URL e faz a requisição
    const url = `${this.API_URL}${cepLimpo}`;
    console.log(' ==== url ======', url)
    // 3. O 'pipe' trata o Observable
    return this.http.get<any>(url).pipe(
      // Verifica se a API retornou o campo 'erro'
      map(data => {
        if (data && data.hasOwnProperty('erro') && data.erro === true) {
          return { erro: true } as Endereco;
        }

        const enderecoFormatado: Endereco = {
            cep: data.cep,               // <--- Faltava esta linha!
            logradouro: data.street,
            bairro: data.neighborhood,
            localidade: data.city,
            uf: data.state,
            ibge: data.service,          // Ou o campo que você usa para IBGE
            erro: false
        };
        return enderecoFormatado; // Retorna o endereço se for válido
      }),
      // Trata erros de rede (ex: servidor fora do ar)
      catchError(error => {
        console.error('Erro ao buscar CEP:', error);
        return of({ erro: true } as Endereco);
      })
    );
  }



}
