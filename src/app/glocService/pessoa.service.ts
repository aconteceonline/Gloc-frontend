import { inject, Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {  Observable, map } from 'rxjs';

import { PessoaModel } from '../glocModel/pessoa.model';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {
  private http = inject(HttpClient);
  apiUrl = "http://localhost:3001/pessoas";

  private myApiUrl!: string;


 pessoaModel: PessoaModel[] = []

  constructor() {
  }

  getListPessoas(): Observable<PessoaModel[]>{
     return this.http.get<PessoaModel[]>(`${this.apiUrl}`);
  }

  getIdCelPessoa(cel: any): Observable<PessoaModel>{
    const url = `${this.myApiUrl}${this.myApiUrl}/${cel}`
    return this.http.get<PessoaModel>(url)
  }

  getListNomePessoa(): Observable<PessoaModel[]>{
    return this.http.get<PessoaModel[]>(`${this.myApiUrl}${this.myApiUrl}`);

  }

  cadastrarPessoa(glocModel: PessoaModel): Observable<PessoaModel> {
    console.log(" glocModel  =  ",  glocModel)
     return this.http.post<PessoaModel>(this.apiUrl, glocModel);
  }

  // getLead(id: string): Observable<LeadModel> {
  //   return this.http.get<LeadModel>(`${this.baseUrl}/${id}`)
  // }

  updatePessoa(glocModel: any): Observable<PessoaModel> {

    const  url = `${this.myApiUrl}${this.myApiUrl}/${glocModel.id}`;
     return this.http.put<PessoaModel>(url, glocModel);

  }

  deletePessoa(id: any): Observable<PessoaModel> {
    const  url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
    console.log("url = ", url)
    return this.http.delete<PessoaModel>(url)
  }

  readByIdPessoa(id: any): Observable<PessoaModel>{
    const url = `${this.myApiUrl}${this.myApiUrl}/${id}`
    return this.http.get<PessoaModel>(url)
  }

}
