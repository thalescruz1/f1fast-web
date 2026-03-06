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
      <a routerLink="/" class="logo">F1<span>FAST</span></a>

      <div class="nav-links">
        <a routerLink="/"            routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a routerLink="/ranking"     routerLinkActive="active">Ranking</a>
        <a routerLink="/palpite"     routerLinkActive="active">Palpite</a>
        <a routerLink="/calendario"  routerLinkActive="active">Calendário</a>
        <a routerLink="/regulamento" routerLinkActive="active">Regulamento</a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a>
        }
      </div>

      <div class="nav-auth">
        @if (auth.isLoggedIn()) {
          <span class="user-name">👤 {{ auth.currentUser()?.nome }}</span>
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
  auth = inject(AuthService);
}
