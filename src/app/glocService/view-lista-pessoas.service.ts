import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import {  ViewListaPessoasModel } from '../glocModel/view-lista-pessoas.model';



@Injectable({
  providedIn: 'root'
})
export class ViewListarPessoasService {

  private readonly apiUrl = "http://localhost:3001/listPessoas";
  pessoaModel:  ViewListaPessoasModel[] = [];

  constructor(private http: HttpClient) { }


getListaPessoas(): Observable< ViewListaPessoasModel[]> {

        return this.http.get< ViewListaPessoasModel[]>(this.apiUrl);
    }


}
