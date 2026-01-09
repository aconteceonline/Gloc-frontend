import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { EconomicoModel } from '../glocModel/economico.model'



@Injectable({
  providedIn: 'root'
})
export class EconomicoService {

  private readonly apiUrl = "http://localhost:3001/perfilecon";
    private readonly apiUrl2 = "http://localhost:3001/editarEconomico";

  constructor(private http: HttpClient) { }


  cadastrarEconomico(glocModel: EconomicoModel): Observable<EconomicoModel> {
       return this.http.post<EconomicoModel>(this.apiUrl, glocModel);
  }


    getPorIdPessoaFK(id_pessoa_fk: number): Observable< EconomicoModel> {
       console.log('service id_pessoa_fk   ', id_pessoa_fk)
    return this.http.get<EconomicoModel>(`${this.apiUrl2}/research/${id_pessoa_fk}`);
    }

    atualizar(id: any, economico: EconomicoModel): Observable<any> {
      return this.http.put(`${this.apiUrl2}/${id}`, economico);
    }

}
