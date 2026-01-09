import { inject, Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';

import {  Observable, map } from 'rxjs';

import { EnderecoModel } from '../glocModel/endereco.model';

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {
  private http = inject(HttpClient);
  apiUrl = "http://localhost:3001/enderecos";

  private myApiUrl = "http://localhost:3001/editarEndereco";


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

   updateEndereco(id_pessoa_fk: any, endereco:  EnderecoModel): Observable<any> {
      return this.http.put(`${this.apiUrl}/${id_pessoa_fk}`, endereco );
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


  getPorIdPessoaFK(id_pessoa_fk: number): Observable< EnderecoModel> {
     console.log('service id_pessoa_fk   ', id_pessoa_fk)
  return this.http.get< EnderecoModel>(`${this.myApiUrl}/research/${id_pessoa_fk}`);
  }

  atualizar(id: any, endereco: EnderecoModel): Observable<any> {
    return this.http.put(`${this.myApiUrl}/${id}`, endereco);
  }

}
