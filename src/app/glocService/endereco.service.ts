import { inject, Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';

import {  Observable, map } from 'rxjs';

import { EnderecoModel } from '../glocModel/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private http = inject(HttpClient);
  apiUrl = "http://localhost:3001/endereco";

  private myApiUrl!: string;


 pessoaModel: EnderecoModel[] = []

  constructor() {
  }

  getListEnderecos(): Observable<EnderecoModel[]>{
     return this.http.get<EnderecoModel[]>(`${this.myApiUrl}${this.myApiUrl}`);
  }

  cadastrarEndereco(glocModel: EnderecoModel): Observable<EnderecoModel> {
  //  console.log(" glocModel  =  ",  glocModel)
     return this.http.post<EnderecoModel>(this.apiUrl, glocModel);
  }

   updateEndereco(glocModel: any): Observable<EnderecoModel> {

    const  url = `${this.myApiUrl}${this.myApiUrl}/${glocModel.id}`;
     return this.http.put<EnderecoModel>(url, glocModel);

  }

  deleteEndereco(id: any): Observable<EnderecoModel> {
    const  url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
    console.log("url = ", url)
    return this.http.delete<EnderecoModel>(url)
  }

  readByIdEndereco(id: any): Observable<EnderecoModel>{
    const url = `${this.myApiUrl}${this.myApiUrl}/${id}`
    return this.http.get<EnderecoModel>(url)
  }

}
