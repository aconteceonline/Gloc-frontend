import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { InteresseModel } from '../glocModel/interesse.model';



@Injectable({
  providedIn: 'root'
})
export class InteresseService {

  private readonly apiUrl = "http://localhost:3001/perfilinteresse";



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
}
