// ============================================================
// GUARD: authGuard
// ============================================================
// Um "Guard" em Angular é um porteiro de rotas — decide se o
// usuário pode acessar uma determinada página ou não.
//
// "CanActivateFn" = função que retorna true (permite) ou false (bloqueia).
//
// Este guard protege rotas que exigem login.
// Exemplo de uso no app.routes.ts:
//   { path: 'palpite', canActivate: [authGuard], ... }
//
// Se o usuário não estiver logado:
//   → redireciona para /entrar (página de login)
//   → retorna false (bloqueia o acesso)
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// "inject()" é a forma moderna de injeção de dependência em Angular
// (em vez de usar constructor). Funciona em funções fora de classes.
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService); // acessa o serviço de autenticação
  const router = inject(Router);      // acessa o roteador para navegar

  if (auth.isLoggedIn()) return true; // usuário logado → permite acesso

  // Usuário não logado → redireciona para login e bloqueia a rota
  router.navigate(['/entrar']);
  return false;
};
