import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { OrigemRendaModel} from '../glocModel/origem-renda.model';



@Injectable({
  providedIn: 'root'
})
export class OrigemRendaService {

  private readonly apiUrl = "http://localhost:3001/origemRenda";


  constructor(private http: HttpClient) { }


  getOrigemRenda(): Observable<OrigemRendaModel[]> {

        return this.http.get<OrigemRendaModel[]>(this.apiUrl);
    }

  cadastrarOrigemRenda(glocModel: OrigemRendaModel): Observable<OrigemRendaModel> {
     return this.http.post<OrigemRendaModel>(this.apiUrl, glocModel);
  }
 getPorIdPessoaFK(id: number): Observable< OrigemRendaModel> {
     console.log('service id Origem Renda   ', id)
  return this.http.get< OrigemRendaModel>(`${this.apiUrl}/research/${id}`);
  }

}
