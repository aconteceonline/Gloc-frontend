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



  pessoaModel: PessoaModel[] = []

  constructor() {
  }

  getListPessoas(): Observable<PessoaModel[]>{
     return this.http.get<PessoaModel[]>(`${this.apiUrl}`);
  }

  cadastrarPessoa(glocModel: PessoaModel): Observable<PessoaModel> {
     return this.http.post<PessoaModel>(this.apiUrl, glocModel);
  }

  getPorId(id: number): Observable< PessoaModel> {
  return this.http.get< PessoaModel>(`${this.apiUrl}/buscar/${id}`);
  }

  atualizar(id: any, pessoa:  PessoaModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, pessoa);
  }

  atualizarStatus(id: any, pessoa:  PessoaModel): Observable<any> {
    return this.http.put(`${this.apiUrl}/status/${id}`, pessoa);
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
  return this.http.get<PessoaModel[]>(`${this.apiUrl}termo/${busca}`)


}

}
