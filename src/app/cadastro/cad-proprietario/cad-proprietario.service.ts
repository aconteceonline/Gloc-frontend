import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CadProprietarioBook } from './cadproprietariobook';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CadproprietarioService {

    constructor(private http: HttpClient){}

    salvar(cadproprietario: CadProprietarioBook) : Observable<CadProprietarioBook>{
      return this.http.post<CadProprietarioBook>('http://localhost:3000/proprietarios', cadproprietario);
    }
  

     obterTodos() : Observable<CadProprietarioBook[]> {
          return this.http.get<CadProprietarioBook[]>('http://localhost:300/proprietarios');
        }
  
}
