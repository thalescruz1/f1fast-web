import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'ranking',
    loadComponent: () => import('./features/ranking/ranking.component').then(m => m.RankingComponent)
  },
  {
    path: 'calendario',
    loadComponent: () => import('./features/calendario/calendario.component').then(m => m.CalendarioComponent)
  },
  {
    path: 'palpite',
    canActivate: [authGuard],
    loadComponent: () => import('./features/palpite/palpite.component').then(m => m.PalpiteComponent)
  },
  {
    path: 'palpites/:etapaId',
    loadComponent: () => import('./features/palpites-corrida/palpites-corrida.component').then(m => m.PalpitesCorridaComponent)
  },
  {
    path: 'regulamento',
    loadComponent: () => import('./features/regulamento/regulamento.component').then(m => m.RegulamentoComponent)
  },
  {
    path: 'entrar',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/cadastro.component').then(m => m.CadastroComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'resultado', pathMatch: 'full' },
      {
        path: 'resultado',
        loadComponent: () => import('./features/admin/resultado/resultado.component').then(m => m.ResultadoComponent)
      },
      {
        path: 'participantes',
        loadComponent: () => import('./features/admin/participantes/participantes.component').then(m => m.ParticipantesComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
