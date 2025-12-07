import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { SituacaoImovelModel } from '../glocModel/situacao-imovel.model';



@Injectable({
  providedIn: 'root'
})
export class SituacaoImovelService {

  private readonly apiUrl = "http://localhost:3001/sitImoveis";
  situacaoImovel: SituacaoImovelModel[] = [];

  constructor(private http: HttpClient) { }


getSituacaoImoveis(): Observable<SituacaoImovelModel[]> {
        // Assume que a API retorna TipoImovelApi[]
        return this.http.get<SituacaoImovelModel[]>(this.apiUrl);
    }


}
