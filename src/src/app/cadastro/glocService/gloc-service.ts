import { Injectable } from '@angular/core';

import { environment } from './../../../environments/environment';
import { HttpClient } from '@angular/common/http';

import {  Observable, map } from 'rxjs';

import { GlocModel } from './glocModel';

@Injectable({
  providedIn: 'root'
})
export class GlocService {
  baseUrl = "http://localhost:3001";
  private myAppUrl: string;
  private myApiUrl: string;
  private myApiUrlC: string;
  private myApiUrlCJ: string;

 glocModel: GlocModel[] = []

  constructor( private http: HttpClient) {
      this.myAppUrl = environment.endpoint;
      this.myApiUrl = '';
      this.myApiUrlC = '/nome';
      this.myApiUrlCJ = '/contato';
  }

  getListInquilinos(): Observable<GlocModel[]>{
     return this.http.get<GlocModel[]>(`${this.myAppUrl}${this.myApiUrl}`);
  }

  getIdCelInquilino(cel: any): Observable<GlocModel>{
    const url = `${this.myAppUrl}${this.myApiUrlCJ}/${cel}`
    return this.http.get<GlocModel>(url)
  }

  getListNomeInquilino(): Observable<GlocModel[]>{
    return this.http.get<GlocModel[]>(`${this.myAppUrl}${this.myApiUrlC}`);
  }

  createInquilino(glocModel: GlocModel): Observable<void> {
    console.log(" glocModel  =  ",  glocModel)
    return this.http.post<void>(`${this.myAppUrl}${this.myApiUrl}`, glocModel)

  }

  // getLead(id: string): Observable<LeadModel> {
  //   return this.http.get<LeadModel>(`${this.baseUrl}/${id}`)
  // }

  updateInquilino(glocModel: any): Observable<GlocModel> {

    const  url = `${this.myAppUrl}${this.myApiUrl}/${glocModel.id}`;
     return this.http.put<GlocModel>(url, glocModel);

  }

  deleteInquilino(id: any): Observable<GlocModel> {
    const  url = `${this.myAppUrl}${this.myApiUrl}/${id}`;
    console.log("url = ", url)
    return this.http.delete<GlocModel>(url)
  }

  readByIdInquilino(id: any): Observable<GlocModel>{
    const url = `${this.myAppUrl}${this.myApiUrl}/${id}`
    return this.http.get<GlocModel>(url)
  }

}
