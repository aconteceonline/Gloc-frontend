import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { EconomicoModel } from '../glocModel/economico.model'



@Injectable({
  providedIn: 'root'
})
export class EconomicoService {

  private readonly apiUrl = "http://localhost:3001/perfilecon";


  constructor(private http: HttpClient) { }


  cadastrarEconomico(glocModel: EconomicoModel): Observable<EconomicoModel> {
       return this.http.post<EconomicoModel>(this.apiUrl, glocModel);
  }

}
