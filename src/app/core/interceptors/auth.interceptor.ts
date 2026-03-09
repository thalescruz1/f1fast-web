// ============================================================
// INTERCEPTOR: authInterceptor
// ============================================================
// Um "Interceptor" em Angular intercepta TODAS as requisições
// HTTP antes de serem enviadas — como um "middleware" do frontend.
//
// Este interceptor adiciona o token JWT automaticamente no
// header "Authorization" de toda requisição HTTP.
//
// Sem ele, teríamos que passar o token manualmente em cada
// chamada da ApiService. Com ele, é automático!
//
// Formato do header adicionado:
//   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
//
// A API .NET lê este header e valida o token JWT.
// Registrado no app.config.ts via withInterceptors([authInterceptor]).
// ============================================================

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

// "HttpInterceptorFn" = tipo de função interceptadora do Angular moderno
// "req" = a requisição original | "next" = função para passar adiante
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Lê o token JWT do localStorage
  const token = inject(AuthService).getToken();

  if (token) {
    // req.clone() = cria uma CÓPIA da requisição (requisições são imutáveis)
    // setHeaders = adiciona/substitui headers na cópia
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  // next(req) = passa a requisição (possivelmente modificada) para o próximo passo
  return next(req);
};
