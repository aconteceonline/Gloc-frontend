import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IbgeService {
  private http = inject(HttpClient);

 getEstados(): Observable<any[]> {
  return this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
}

getMunicipios(uf: string): Observable<any[]> {
  // Verifique se a UF está vindo correta (ex: 'SP')
  return this.http.get<any[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
}
}
