import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { InteresseModel } from '../glocModel/interesse.model';



@Injectable({
  providedIn: 'root'
})
export class InteresseService {

    private readonly apiUrl = "http://localhost:3001/perfilinteresse";
    private readonly apiUrl2 = "http://localhost:3001/editarInteresse";


    constructor(private http: HttpClient) { }


    cadastrarInteresse(glocModel: InteresseModel): Observable<InteresseModel> {
         return this.http.post<InteresseModel>(this.apiUrl, glocModel);
    }

// Método corrigido
    atualizarObservacao(id: number, observacao: string): Observable<any> {
    console.log("Iniciando atualização do interesse ID:", id);

    // Montamos a URL dinamicamente aqui dentro usando crases (backticks)
    // A rota final será: http://localhost:3001/perfilinteresse/48
    return this.http.patch(`${this.apiUrl}/${id}`, {
      obs_interesse: observacao
    });
    }


    getPorIdPessoaFK(id_pessoa_fk: number): Observable< InteresseModel> {
  //     console.log('service id_pessoa_fk   ', id_pessoa_fk)
    return this.http.get<InteresseModel>(`${this.apiUrl2}/research/${id_pessoa_fk}`);
    }

    atualizar(id_pessoa_fk: any, interesse: InteresseModel): Observable<any> {
             console.log('service id_pessoa_fk   ', id_pessoa_fk)
      return this.http.put(`${this.apiUrl2}/${id_pessoa_fk}`, interesse);
    }

}
