import { inject, Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';

import {  Observable, map } from 'rxjs';

import { EmpresaModel } from '../glocModel/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  apiUrl = "http://localhost:3001/empresas";

  private myApiUrl!: string;


 empresaModel: EmpresaModel[] = []

  constructor() {
  }

  getListEmpresas(): Observable<EmpresaModel[]>{
     return this.http.get<EmpresaModel[]>(`${this.myApiUrl}${this.myApiUrl}`);
  }

  cadastrarEmpresa(glocModel: EmpresaModel): Observable<EmpresaModel> {
  //  console.log(" glocModel  =  ",  glocModel)
     return this.http.post<EmpresaModel>(this.apiUrl, glocModel);
  }

   updateEmpresa(glocModel: any): Observable<EmpresaModel> {

    const  url = `${this.myApiUrl}${this.myApiUrl}/${glocModel.id}`;
     return this.http.put<EmpresaModel>(url, glocModel);

  }

  deleteEmpresa(id: any): Observable<EmpresaModel> {
    const  url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
    console.log("url = ", url)
    return this.http.delete<EmpresaModel>(url)
  }

  readByIdEmpresa(id: any): Observable<EmpresaModel>{
    const url = `${this.myApiUrl}${this.myApiUrl}/${id}`
    return this.http.get<EmpresaModel>(url)
  }

}
