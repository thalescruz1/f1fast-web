// ============================================================
// COMPONENTE: NavbarComponent
// ============================================================
// Barra de navegação superior fixa — presente em todas as páginas.
// Renderizada no app.component.html ou no layout principal.
//
// Comportamento dinâmico baseado no estado de autenticação:
//   - Usuário DESLOGADO → mostra botões "Entrar" e "Cadastrar"
//   - Usuário LOGADO    → mostra nome do usuário + botão "Sair"
//   - Usuário ADMIN     → mostra também o link "Admin" em vermelho
//
// RouterLinkActive = diretiva que adiciona uma classe CSS ao link
// quando a rota correspondente está ativa (URL atual).
//
// position: sticky; top: 0 = a navbar fica fixada no topo da
// página mesmo ao rolar o conteúdo.
// ============================================================

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <!-- Logo clicável que leva para a home -->
      <a routerLink="/" class="logo">F1<span>FAST</span></a>

      <div class="nav-links">
        <!-- [routerLinkActiveOptions]="{exact:true}" é necessário para o link "Home"
             porque "/" é prefixo de TODAS as rotas. Sem "exact:true", o link "Home"
             ficaria ativo mesmo em /ranking, /palpite etc. -->
        <a routerLink="/"            routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a routerLink="/ranking"     routerLinkActive="active">Ranking</a>
        <a routerLink="/palpite"     routerLinkActive="active">Palpite</a>
        <a routerLink="/calendario"  routerLinkActive="active">Calendário</a>
        <a routerLink="/regulamento" routerLinkActive="active">Regulamento</a>
        <!-- Link Admin: só aparece se o usuário for administrador.
             auth.isAdmin() lê o signal do AuthService — atualiza automaticamente
             quando o login/logout muda o estado. -->
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a>
        }
      </div>

      <div class="nav-auth">
        <!-- auth.isLoggedIn() = lê o signal do AuthService.
             Se logado, mostra nome e botão Sair.
             Se não logado, mostra Entrar e Cadastrar. -->
        @if (auth.isLoggedIn()) {
          <!-- auth.currentUser()?.nome = acessa o nome do usuário logado.
               "?." = optional chaining: não dá erro se currentUser() for null -->
          <span class="user-name">👤 {{ auth.currentUser()?.nome }}</span>
          <!-- (click)="auth.logout()" = chama o logout diretamente do AuthService
               sem precisar de um método intermediário no componente -->
          <button class="btn btn-ghost" (click)="auth.logout()">Sair</button>
        } @else {
          <a routerLink="/entrar"  class="btn btn-ghost">Entrar</a>
          <a routerLink="/cadastro" class="btn btn-red">Cadastrar</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #1A1A1A;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px; height: 56px;
      position: sticky; top: 0; z-index: 100;
    }
    .logo { font-family: 'Orbitron', monospace; font-size: 18px; color: white; letter-spacing: 2px; text-decoration: none; }
    .logo span { color: #E10600; }
    .nav-links { display: flex; gap: 2px; }
    .nav-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 4px; transition: color 0.15s; }
    .nav-links a:hover, .nav-links a.active { color: white; }
    .admin-link { color: #E10600 !important; }
    .nav-auth { display: flex; gap: 8px; align-items: center; }
    .user-name { font-size: 13px; color: rgba(255,255,255,0.7); }
    .btn { padding: 7px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-block; }
    .btn-ghost { background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); }
    .btn-red { background: #E10600; color: white; }
  `]
})
export class NavbarComponent {
  // auth é público (sem "private") porque o template acessa
  // auth.isLoggedIn(), auth.isAdmin(), auth.currentUser() e auth.logout()
  // diretamente no HTML. Em Angular, templates só acessam membros públicos.
  auth = inject(AuthService);
}
