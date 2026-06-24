// ============================================================
// INTERCEPTOR: loadingInterceptor
// ============================================================
// Liga/desliga o overlay de carregamento global em TODA
// requisição HTTP. Incrementa o contador no início e o
// decrementa no finalize() (que dispara em sucesso OU erro).
//
// Registrado PRIMEIRO no app.config.ts para envolver toda a
// cadeia de interceptors (auth, error).
// ============================================================

import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.iniciar();

  // finalize() executa quando a requisição completa, erra ou é cancelada
  return next(req).pipe(finalize(() => loading.finalizar()));
};
