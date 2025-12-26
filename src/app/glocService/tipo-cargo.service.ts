import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, map } from 'rxjs';
import { TipoCargoModel} from '../glocModel/tipo-cargo.model';



@Injectable({
  providedIn: 'root'
})
export class TipoCargoService {

  private readonly apiUrl = "http://localhost:3001/tipoCargo";
  tiposDeCargo: TipoCargoModel[] = [];

  constructor(private http: HttpClient) { }


getTiposCargos(): Observable<TipoCargoModel[]> {

        return this.http.get<TipoCargoModel[]>(this.apiUrl);
    }


}
