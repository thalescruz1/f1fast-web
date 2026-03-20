// ============================================================
// INTERCEPTOR: errorInterceptor
// ============================================================
// Intercepta TODAS as respostas HTTP de erro e exibe um toast
// com a mensagem tratada vinda do backend (campo "mensagem"
// do ApiError) ou uma mensagem genérica de fallback.
//
// Erros 401 (não autenticado) redirecionam para o login.
// Erros 404 em GETs são silenciosos (componente trata localmente).
//
// Registrado no app.config.ts via withInterceptors([...]).
// ============================================================

import { inject, Injector, runInInjectionContext } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Captura o Injector no contexto de injeção (síncrono, sem dependência circular)
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Resolve os serviços lazily dentro do callback para evitar
      // dependência circular (AuthService → HttpClient → interceptors)
      runInInjectionContext(injector, () => {
        const toast = inject(ToastService);
        const mensagem = extrairMensagem(err);

        switch (err.status) {
          case 0:
            toast.erro('Sem conexão com o servidor. Verifique sua internet.');
            break;

          case 401:
            if (!req.url.includes('/auth/login')) {
              const auth = inject(AuthService);
              auth.logout();
              toast.aviso('Sua sessão expirou. Faça login novamente.');
            }
            break;

          case 403:
            toast.erro('Você não tem permissão para realizar esta ação.');
            break;

          case 404:
            if (req.method !== 'GET') {
              toast.erro(mensagem);
            }
            break;

          case 408:
          case 409:
            toast.aviso(mensagem);
            break;

          case 500:
          case 502:
          case 503:
            toast.erro(mensagem);
            break;

          default:
            break;
        }
      });

      return throwError(() => err);
    })
  );
};

/**
 * Extrai a mensagem de erro da resposta HTTP.
 * Prioridade: ApiError.mensagem > string > fallback genérico.
 */
export function extrairMensagem(err: HttpErrorResponse): string {
  if (err.error && typeof err.error === 'object' && err.error.mensagem) {
    return err.error.mensagem;
  }

  if (typeof err.error === 'string' && err.error.length > 0 && err.error.length < 200) {
    return err.error;
  }

  switch (err.status) {
    case 0:   return 'Sem conexão com o servidor.';
    case 400: return 'Dados inválidos. Verifique e tente novamente.';
    case 401: return 'Credenciais inválidas.';
    case 403: return 'Acesso negado.';
    case 404: return 'Recurso não encontrado.';
    case 408: return 'A operação demorou demais.';
    case 409: return 'Registro duplicado.';
    case 500: return 'Erro interno do servidor. Tente novamente.';
    default:  return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
