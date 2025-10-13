import { AuthService } from '../services/auth.service';
import {  CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';


// O tipo CanActivateFn é a assinatura de um Guard Funcional
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  // 1. Injeta as dependências necessárias
  const authService = inject(AuthService);
  const router = inject(Router);

  // 2. Chama a lógica de autenticação do Service
  if (authService.isAuthenticated()) {
    // Retorna true se autenticado (permite a navegação)
    return true;
  } else {
    // Retorna um UrlTree para redirecionar o usuário para a página de login
    // Esta é a melhor forma de fazer o redirecionamento dentro de um Guard.
    console.warn('Acesso negado. Redirecionando para /login');
    return router.createUrlTree(['']);
  }
};
