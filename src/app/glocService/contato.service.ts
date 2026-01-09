import { inject, Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';

import {  Observable, map } from 'rxjs';

import { ContatoModel } from '../glocModel/contato.model';

@Injectable({
  providedIn: 'root'
})
export class ContatoService {
 // private http = inject(HttpClient);
  apiUrl = "http://localhost:3001/contatos";

  private myApiUrl!: string;


 ContatoModel: ContatoModel[] = []

  constructor(private http: HttpClient) {
  }

  getListContatos(): Observable<ContatoModel[]>{
     return this.http.get<ContatoModel[]>(`${this.myApiUrl}${this.myApiUrl}`);
  }

  cadastrarContato(glocModel: ContatoModel): Observable<ContatoModel> {
     return this.http.post<ContatoModel>(this.apiUrl, glocModel);
  }

   updateContato(id_pessoa_fk: any, contato:  ContatoModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id_pessoa_fk}`, contato );

  }
  deleteContato(id: any): Observable<ContatoModel> {
    const  url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
  //  console.log("url = ", url)
    return this.http.delete<ContatoModel>(url)
  }

  readByIdContato(id: any): Observable<ContatoModel>{
    const url = `${this.apiUrl}/${id}`
    return this.http.get<ContatoModel>(url)
  }

  listarCelularPorPessoa(pessoaId: number): Observable<string | null> {
  return this.http.get<ContatoModel[]>(`${this.apiUrl}?pessoaId=${pessoaId}`)
    .pipe(
      map(contatos => {
        const celular = contatos.find(c => c.nr_contato === 'celular');
        return celular?.nr_contato ?? null;
      })
    );
}

}
