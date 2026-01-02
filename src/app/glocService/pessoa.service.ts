import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {  Observable, catchError, map, of, throwError } from 'rxjs';
import { PessoaModel } from '../glocModel/pessoa.model';

const STORAGE_KEY = 'pessoas';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {

  private _pessoas = signal<PessoaModel[]>(this.load());
  pessoas = this._pessoas.asReadonly();

    private load(): PessoaModel[] {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

  private http = inject(HttpClient);
  apiUrl = "http://localhost:3001/pessoas";

  private myApiUrl = "http://localhost:3001/";


  pessoaModel: PessoaModel[] = []

  constructor() {
  }

  getListPessoas(): Observable<PessoaModel[]>{
     return this.http.get<PessoaModel[]>(`${this.apiUrl}`);
  }

  getIdCelPessoa(cel: any): Observable<PessoaModel>{
    const url = `${this.myApiUrl}${this.myApiUrl}/${cel}`
    return this.http.get<PessoaModel>(url)
  }

  getListNomePessoa(): Observable<PessoaModel[]>{
    return this.http.get<PessoaModel[]>(`${this.myApiUrl}${this.apiUrl}`);

  }

  cadastrarPessoa(glocModel: PessoaModel): Observable<PessoaModel> {
     return this.http.post<PessoaModel>(this.apiUrl, glocModel);
  }

  updatePessoa(glocModel: any): Observable<PessoaModel> {

    const  url = `${this.myApiUrl}${this.myApiUrl}/${glocModel.id}`;
     return this.http.put<PessoaModel>(url, glocModel);

  }

  deletePessoa(id: any): Observable<PessoaModel> {
    const  url = `${this.myApiUrl}${this.myApiUrl}/${id}`;
    return this.http.delete<PessoaModel>(url)
  }

  readByIdPessoa(id: any): Observable<PessoaModel>{
    const url = `${this.myApiUrl}${this.myApiUrl}/${id}`
    return this.http.get<PessoaModel>(url)
  }

 readByCPF(cpf: any): Observable<PessoaModel | null> {
  const url = `${this.apiUrl}/${cpf}`;
  return this.http.get<PessoaModel>(url).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 404) {
        // CPF não cadastrado — retorna null silenciosamente
        return of(null);
      }
      // Outros erros — propaga o erro
      return throwError(() => error);
    })
  );
}

readByCNPJ(cnpj: any): Observable<PessoaModel>{
    const url = `${this.apiUrl}/${cnpj}`
    return this.http.get<PessoaModel>(url)
}
/* usado pelo app-pessoa-modal */
  buscarPorTermo(busca: string): Observable<PessoaModel[]> {
 //  console.log(' buscar por cpf cnpj/;  ', (`${this.myApiUrl}termo/${busca}`))
  return this.http.get<PessoaModel[]>(`${this.myApiUrl}termo/${busca}`)


}

}
