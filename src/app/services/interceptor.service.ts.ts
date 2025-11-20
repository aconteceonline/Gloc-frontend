import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class CpfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Intercepta apenas chamadas para /pessoas/:cpf com erro 404
        if (
          error.status === 404 &&
          req.method === 'GET' &&
          req.url.includes('/pessoas/')
        ) {
          // Retorna um valor nulo como resposta válida
          return of(new HttpResponse({ status: 200, body: null }));
        }

        // Outros erros continuam sendo tratados normalmente
        return throwError(() => error);
      })
    );
  }
}
