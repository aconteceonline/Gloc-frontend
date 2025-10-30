import { inject, Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';

import {  Observable, map } from 'rxjs';

import { ContatoModel } from '../glocModel/contato.model';

@Injectable({
  providedIn: 'root'
})
export class ContatoService {
  private http = inject(HttpClient);
  apiUrl = "http://localhost:3001/endereco";

  private myApiUrl!: string;


 ContatoModel: ContatoModel[] = []

  constructor() {
  }

  getListContatos(): Observable<ContatoModel[]>{
     return this.http.get<ContatoModel[]>(`${this.myApiUrl}${this.myApiUrl}`);
  }

  cadastrarContato(glocModel: ContatoModel): Observable<ContatoModel> {
  //  console.log(" glocModel  =  ",  glocModel)
     return this.http.post<ContatoModel>(this.apiUrl, glocModel);
  }

   updateContato(glocModel: any): Observable<ContatoModel> {

    const  url = `${this.myApiUrl}${this.myApiUrl}/${glocModel.id}`;
     return this.http.put<ContatoModel>(url, glocModel);

  }

  deleteContato(id: any): Observable<ContatoModel> {
    const  url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
    console.log("url = ", url)
    return this.http.delete<ContatoModel>(url)
  }

  readByIdContato(id: any): Observable<ContatoModel>{
    const url = `${this.myApiUrl}${this.myApiUrl}/${id}`
    return this.http.get<ContatoModel>(url)
  }

}
