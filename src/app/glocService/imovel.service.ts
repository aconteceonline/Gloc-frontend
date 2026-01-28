import { inject, Injectable, signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { ImovelModel } from '../glocModel/imovel.model';

const STORAGE_KEY = 'imoveis';

@Injectable({
  providedIn: 'root',
})
export class ImovelService {
  private http = inject(HttpClient);
  apiUrl = 'http://localhost:3001/imoveis';

  private myApiUrl!: string;

  imovelModel: ImovelModel[] = [];

  constructor() {}

  private _imoveis = signal<ImovelModel[]>(this.load());

  imoveis = this._imoveis.asReadonly();

  private load(): ImovelModel[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._imoveis()));
  }

  add(imovel: ImovelModel) {
    this._imoveis.update((list) => [imovel, ...list]);
    this.save();
  }

  remove(id: string) {
    this._imoveis.update((list) => list.filter((i) => i.id !== id));
    this.save();
  }

  getListEnderecos(): Observable<ImovelModel[]> {
    return this.http.get<ImovelModel[]>(`${this.myApiUrl}${this.myApiUrl}`);
  }

  cadastrarImovel(glocModel: ImovelModel): Observable<ImovelModel> {
    console.log(' glocModel  =  ', glocModel);
    return this.http.post<ImovelModel>(this.apiUrl, glocModel);
  }

  updateImovel(glocModel: any): Observable<ImovelModel> {
    const url = `${this.myApiUrl}${this.myApiUrl}/${glocModel.id}`;
    return this.http.put<ImovelModel>(url, glocModel);
  }

  deleteImovel(id: any): Observable<ImovelModel> {
    const url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
    console.log('url = ', url);
    return this.http.delete<ImovelModel>(url);
  }

  readByIdImovel(id: any): Observable<ImovelModel> {
    const url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
    return this.http.get<ImovelModel>(url);
  }
}
