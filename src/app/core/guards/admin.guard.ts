// ============================================================
// GUARD: adminGuard
// ============================================================
// Guard mais restritivo que o authGuard: exige que o usuário
// esteja logado E tenha role "Admin".
//
// Usado para proteger o painel administrativo:
//   { path: 'admin', canActivate: [adminGuard], ... }
//
// Se o usuário não for admin (ou não estiver logado):
//   → redireciona para a home (/)
//   → retorna false (bloqueia o acesso)
//
// Mesmo que alguém tente acessar /admin diretamente pela URL,
// este guard impede que o componente seja carregado.
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Precisa estar logado E ter role "Admin"
  if (auth.isLoggedIn() && auth.isAdmin()) return true;

  // Não é admin → redireciona para home sem expor que a rota existe
  router.navigate(['/']);
  return false;
};
