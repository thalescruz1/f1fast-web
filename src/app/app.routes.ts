// ============================================================
// ROTAS: app.routes.ts
// ============================================================
// Define o mapa de URLs da aplicação Angular.
// Cada "path" liga uma URL a um componente específico.
//
// "loadComponent" = lazy loading (carregamento preguiçoso):
// O componente SÓ é baixado quando o usuário visitar aquela rota.
// Isso melhora o tempo de carregamento inicial da aplicação.
//
// "canActivate" = guards que protegem a rota.
// Se o guard retornar false, o componente não é carregado.
//
// "children" = rotas filhas (aninhadas dentro de outra rota).
// Ex: /admin/resultado e /admin/participantes ficam dentro de /admin.
// ============================================================

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Página inicial — pública (qualquer um pode ver)
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  // Ranking geral — público
  {
    path: 'ranking',
    loadComponent: () => import('./features/ranking/ranking.component').then(m => m.RankingComponent)
  },

  // Calendário das 30 corridas — público
  {
    path: 'calendario',
    loadComponent: () => import('./features/calendario/calendario.component').then(m => m.CalendarioComponent)
  },

  // Fazer palpite — PROTEGIDO: requer login (authGuard)
  {
    path: 'palpite',
    canActivate: [authGuard],
    loadComponent: () => import('./features/palpite/palpite.component').then(m => m.PalpiteComponent)
  },

  // Índice de palpites de todas as etapas — público
  // Exibe os 30 cards de corrida; clicáveis apenas após o prazo expirar.
  // IMPORTANTE: esta rota DEVE vir ANTES de 'palpites/:etapaId'.
  // Angular avalia rotas em ordem: se ':etapaId' viesse primeiro,
  // a URL "/palpites" poderia ser tratada como parâmetro vazio.
  {
    path: 'palpites',
    loadComponent: () => import('./features/palpites/palpites.component').then(m => m.PalpitesComponent)
  },

  // Ver palpites de uma corrida — público (após prazo)
  // ":etapaId" é um parâmetro dinâmico na URL (ex: /palpites/5)
  {
    path: 'palpites/:etapaId',
    loadComponent: () => import('./features/palpites-corrida/palpites-corrida.component').then(m => m.PalpitesCorridaComponent)
  },

  // Regulamento do campeonato — público
  {
    path: 'regulamento',
    loadComponent: () => import('./features/regulamento/regulamento.component').then(m => m.RegulamentoComponent)
  },

  // Página de login — pública
  {
    path: 'entrar',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },

  // Página de cadastro — pública
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/cadastro.component').then(m => m.CadastroComponent)
  },

  // Solicitar recuperação de senha — pública
  {
    path: 'esqueci-senha',
    loadComponent: () => import('./features/auth/esqueci-senha.component').then(m => m.EsqueciSenhaComponent)
  },

  // Redefinir senha (vem do link do e-mail) — pública
  {
    path: 'redefinir-senha',
    loadComponent: () => import('./features/auth/redefinir-senha.component').then(m => m.RedefinirSenhaComponent)
  },

  // Painel admin — PROTEGIDO: requer login + ser Admin (adminGuard)
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    // Rotas filhas: renderizadas DENTRO do AdminComponent (onde tem <router-outlet>)
    children: [
      // /admin → redireciona automaticamente para /admin/resultado
      { path: '', redirectTo: 'resultado', pathMatch: 'full' },
      {
        path: 'resultado',      // /admin/resultado → lançar resultados
        loadComponent: () => import('./features/admin/resultado/resultado.component').then(m => m.ResultadoComponent)
      },
      {
        path: 'participantes',  // /admin/participantes → gerenciar usuários
        loadComponent: () => import('./features/admin/participantes/participantes.component').then(m => m.ParticipantesComponent)
      },
      {
        path: 'etapas',         // /admin/etapas → gerenciar prazos de apostas
        loadComponent: () => import('./features/admin/etapas/etapas.component').then(m => m.EtapasAdminComponent)
      }
    ]
  },

  // Rota "coringa": qualquer URL não reconhecida → home
  // Deve sempre ser a ÚLTIMA rota (Angular verifica em ordem)
  { path: '**', redirectTo: '' }
];
