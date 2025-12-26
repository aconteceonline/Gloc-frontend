import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { TipoImovelModel} from '../glocModel/tipo-imovel.model';



@Injectable({
  providedIn: 'root'
})
export class TipoImovelService {

  private readonly apiUrl = "http://localhost:3001/tipoImoveis";
  tiposDeImovel: TipoImovelModel[] = [];

  constructor(private http: HttpClient) { }


getTiposImoveis(): Observable<TipoImovelModel[]> {
        // Assume que a API retorna TipoImovelApi[]
        return this.http.get<TipoImovelModel[]>(this.apiUrl);
    }


}
