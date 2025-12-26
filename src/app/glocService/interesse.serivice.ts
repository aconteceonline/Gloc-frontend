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

}
