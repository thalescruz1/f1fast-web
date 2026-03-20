// ============================================================
// CONFIGURAÇÃO DA APLICAÇÃO: app.config.ts
// ============================================================
// Este arquivo é o equivalente Angular do Program.cs do .NET:
// configura e inicializa os serviços essenciais da aplicação.
//
// Em Angular moderno (v17+) sem NgModules, toda configuração
// global fica aqui em vez de ficar no AppModule.
//
// Este objeto "appConfig" é passado para o bootstrapApplication()
// no main.ts, que inicia a aplicação Angular.
// ============================================================

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Registra o sistema de roteamento com as rotas definidas em app.routes.ts
    provideRouter(routes),

    // Registra o HttpClient (necessário para fazer chamadas HTTP)
    // withInterceptors: interceptors executam na ORDEM do array:
    //   1. authInterceptor → adiciona o token JWT no header
    //   2. errorInterceptor → captura erros e exibe toasts
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
};
