import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <a routerLink="/" class="nav-logo" (click)="fecharMenu()">
        <img src="logo.png" class="logo-img" alt="F1Fast">
        <span class="nl-f1">F1</span><span class="nl-fast">FAST</span>
      </a>

      <div class="nav-links">
        <a class="nl" routerLink="/"            routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}">Home</a>
        <a class="nl" routerLink="/ranking"     routerLinkActive="on">Ranking</a>
        <a class="nl" routerLink="/palpite"     routerLinkActive="on">Palpite</a>
        <a class="nl" routerLink="/palpites"    routerLinkActive="on">Apostas</a>
        <a class="nl" routerLink="/calendario"  routerLinkActive="on">Calendário</a>
        <a class="nl" routerLink="/regulamento" routerLinkActive="on">Regulamento</a>
        @if (auth.isAdmin()) {
          <a class="nl admin-link" routerLink="/admin" routerLinkActive="on">Admin</a>
        }
      </div>

      <div class="nav-ctas">
        @if (auth.isLoggedIn()) {
          <span class="user-name">{{ auth.currentUser()?.login }}</span>
          <button class="btn-ghost-nav" (click)="auth.logout(); fecharMenu()">Sair</button>
        } @else {
          <a routerLink="/entrar"   class="btn-ghost-nav">Entrar</a>
          <a routerLink="/cadastro" class="btn-red-nav">Cadastrar</a>
        }
      </div>

      <button class="hamburger" (click)="toggleMenu()" [attr.aria-expanded]="menuAberto()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    @if (menuAberto()) {
      <div class="mob-overlay" (click)="fecharMenu()"></div>
      <div class="mob-menu">
        <a class="mob-link" routerLink="/"            routerLinkActive="on" [routerLinkActiveOptions]="{exact:true}" (click)="fecharMenu()">Home</a>
        <a class="mob-link" routerLink="/ranking"     routerLinkActive="on" (click)="fecharMenu()">Ranking</a>
        <a class="mob-link" routerLink="/palpite"     routerLinkActive="on" (click)="fecharMenu()">Palpite</a>
        <a class="mob-link" routerLink="/palpites"    routerLinkActive="on" (click)="fecharMenu()">Apostas</a>
        <a class="mob-link" routerLink="/calendario"  routerLinkActive="on" (click)="fecharMenu()">Calendário</a>
        <a class="mob-link" routerLink="/regulamento" routerLinkActive="on" (click)="fecharMenu()">Regulamento</a>
        @if (auth.isAdmin()) {
          <a class="mob-link admin-link" routerLink="/admin" routerLinkActive="on" (click)="fecharMenu()">Admin</a>
        }
        <div class="mob-auth">
          @if (auth.isLoggedIn()) {
            <span class="mob-user">{{ auth.currentUser()?.login }}</span>
            <button class="btn-red-nav mob-btn" (click)="auth.logout(); fecharMenu()">Sair</button>
          } @else {
            <a routerLink="/entrar"   class="btn-ghost-nav mob-btn" (click)="fecharMenu()">Entrar</a>
            <a routerLink="/cadastro" class="btn-red-nav mob-btn"   (click)="fecharMenu()">Cadastrar</a>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px; height: 64px;
      background: rgba(5,5,7,.97);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--b1);
    }
    .nav-logo {
      font-family: var(--font-orb); font-size: 20px; font-weight: 700;
      letter-spacing: 3px; text-decoration: none;
      display: flex; align-items: center; gap: 8px;
    }
    .logo-img { height: 32px; width: auto; }
    .nl-f1 { color: var(--white); }
    .nl-fast { color: var(--red); }

    .nav-links { display: flex; gap: 4px; }
    .nl {
      font-family: var(--font-display); font-size: var(--sz-sm);
      font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
      color: var(--w45); text-decoration: none; padding: 8px 14px;
      transition: color .15s; position: relative;
    }
    .nl:hover { color: var(--w90); }
    .nl.on { color: var(--white); }
    .nl.on::after {
      content: ''; position: absolute; bottom: -20px;
      left: 10px; right: 10px; height: 2px;
      background: var(--red); border-radius: 2px 2px 0 0;
    }
    .admin-link { color: var(--red) !important; }

    .nav-ctas { display: flex; gap: 10px; align-items: center; }
    .user-name {
      font-family: var(--font-display); font-size: var(--sz-sm);
      font-weight: 600; color: var(--w70);
    }
    .btn-ghost-nav {
      font-family: var(--font-display); font-size: var(--sz-xs);
      font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
      padding: 8px 16px; border-radius: 4px;
      background: transparent; border: 1.5px solid var(--b2);
      color: var(--w70); cursor: pointer; text-decoration: none;
      transition: all .15s;
    }
    .btn-ghost-nav:hover { border-color: var(--w45); color: var(--white); }
    .btn-red-nav {
      font-family: var(--font-display); font-size: var(--sz-xs);
      font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
      padding: 8px 16px; border-radius: 4px;
      background: var(--red); border: none;
      color: white; cursor: pointer; text-decoration: none;
    }
    .btn-red-nav:hover { transform: translateY(-1px); }

    .hamburger { display: none; }

    @media (max-width: 768px) {
      .nav { padding: 0 16px; }
      .nav-links, .nav-ctas { display: none; }
      .hamburger {
        display: flex; flex-direction: column; gap: 5px;
        background: none; border: none; cursor: pointer; padding: 8px;
      }
      .hamburger span {
        display: block; width: 22px; height: 2px;
        background: var(--white); border-radius: 1px;
      }
      .mob-overlay {
        position: fixed; inset: 0; z-index: 98;
        background: rgba(0,0,0,.6);
      }
      .mob-menu {
        position: fixed; top: 64px; left: 0; right: 0; z-index: 99;
        background: var(--s1); border-bottom: 1px solid var(--b1);
        padding: 8px 0 16px;
        animation: slideDown .2s ease;
      }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      .mob-link {
        display: block; padding: 14px 24px;
        font-family: var(--font-display); font-size: var(--sz-base);
        font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
        color: var(--w45); text-decoration: none;
        border-bottom: 1px solid var(--b1);
      }
      .mob-link:hover, .mob-link.on { color: var(--white); }
      .mob-auth { padding: 16px 24px 0; display: flex; flex-direction: column; gap: 8px; }
      .mob-user { font-family: var(--font-display); font-size: var(--sz-sm); font-weight: 600; color: var(--w70); padding: 8px 0; }
      .mob-btn { width: 100%; text-align: center; padding: 12px 16px; }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  menuAberto = signal(false);
  toggleMenu() { this.menuAberto.update(v => !v); }
  fecharMenu() { this.menuAberto.set(false); }
}
