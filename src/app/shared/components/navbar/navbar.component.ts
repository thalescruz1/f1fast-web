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

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">

      <!-- ── Linha superior: logo + botão hambúrguer ── -->
      <!-- Em desktop: logo fica alinhado normalmente no flex da navbar.
           Em mobile: esta div vira uma "barra" com logo à esquerda e ☰ à direita. -->
      <div class="navbar-top">
        <a routerLink="/" class="logo" (click)="fecharMenu()">
          <img src="logo.png" class="logo-img" alt="F1Fast">
          F1<span>FAST</span>
        </a>

        <!-- Botão hambúrguer — VISÍVEL APENAS em mobile (≤768px).
             "menuAberto()" lê o signal para mostrar ☰ ou ✕.
             [attr.aria-expanded] = acessibilidade: informa ao leitor de tela se está aberto. -->
        <button class="hamburger" (click)="toggleMenu()" [attr.aria-expanded]="menuAberto()">
          {{ menuAberto() ? '✕' : '☰' }}
        </button>
      </div>

      <!-- ── Links de navegação ──
           Desktop: display flex horizontal, sempre visível.
           Mobile:  oculto por padrão; classe ".aberto" o torna visível como coluna. -->
      <div class="nav-links" [class.aberto]="menuAberto()">
        <!-- [routerLinkActiveOptions]="{exact:true}" é necessário para o link "Home"
             porque "/" é prefixo de TODAS as rotas. Sem "exact:true", o link "Home"
             ficaria ativo mesmo em /ranking, /palpite etc. -->
        <a routerLink="/"            routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="fecharMenu()">Home</a>
        <a routerLink="/ranking"     routerLinkActive="active" (click)="fecharMenu()">Ranking</a>
        <a routerLink="/palpite"     routerLinkActive="active" (click)="fecharMenu()">Palpite</a>
        <!-- routerLinkActive="active" no link "/palpites" ficaria ativo também em
             "/palpites/5" (sub-rota), o que é o comportamento desejado aqui. -->
        <a routerLink="/palpites"    routerLinkActive="active" (click)="fecharMenu()">Apostas</a>
        <a routerLink="/calendario"  routerLinkActive="active" (click)="fecharMenu()">Calendário</a>
        <a routerLink="/regulamento" routerLinkActive="active" (click)="fecharMenu()">Regulamento</a>
        <!-- Link Admin: só aparece se o usuário for administrador.
             auth.isAdmin() lê o signal do AuthService — atualiza automaticamente
             quando o login/logout muda o estado. -->
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active" class="admin-link" (click)="fecharMenu()">Admin</a>
        }
      </div>

      <!-- ── Área de autenticação ──
           Desktop: botões à direita, sempre visíveis.
           Mobile:  oculta por padrão; aparece abaixo dos links quando o menu está aberto. -->
      <div class="nav-auth" [class.aberto]="menuAberto()">
        <!-- auth.isLoggedIn() = lê o signal do AuthService.
             Se logado, mostra nome e botão Sair.
             Se não logado, mostra Entrar e Cadastrar. -->
        @if (auth.isLoggedIn()) {
          <!-- auth.currentUser()?.nome = acessa o nome do usuário logado.
               "?." = optional chaining: não dá erro se currentUser() for null -->
          <span class="user-name">👤 {{ auth.currentUser()?.nome }}</span>
          <!-- fecharMenu() fecha o drawer antes de redirecionar após logout -->
          <button class="btn btn-ghost" (click)="auth.logout(); fecharMenu()">Sair</button>
        } @else {
          <a routerLink="/entrar"   class="btn btn-ghost" (click)="fecharMenu()">Entrar</a>
          <a routerLink="/cadastro" class="btn btn-red"   (click)="fecharMenu()">Cadastrar</a>
        }
      </div>

    </nav>
  `,
  styles: [`
    /* ═══════════════════════════════════════════════════
       DESKTOP (padrão — tela grande)
       Tudo numa linha horizontal, altura fixa de 56px.
    ═══════════════════════════════════════════════════ */
    .navbar {
      background: #1A1A1A;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 32px; height: 56px;
      position: sticky; top: 0; z-index: 100;
    }

    /* "display: contents" faz a div desaparecer do layout:
       seus filhos (logo e hamburger) participam diretamente
       do flex da .navbar — como se a div não existisse. */
    .navbar-top { display: contents; }

    .logo { font-family: 'Orbitron', monospace; font-size: 18px; color: white; letter-spacing: 2px; text-decoration: none; display: flex; align-items: center; gap: 10px; }
    .logo span { color: #0057E1; }
    .logo-img { height: 30px; width: auto; display: block; }

    /* Hambúrguer invisível em desktop */
    .hamburger { display: none; }

    .nav-links { display: flex; gap: 2px; }
    .nav-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 4px; transition: color 0.15s; }
    .nav-links a:hover, .nav-links a.active { color: white; }
    .admin-link { color: #0057E1 !important; }

    .nav-auth { display: flex; gap: 8px; align-items: center; }
    .user-name { font-size: 13px; color: rgba(255,255,255,0.7); }
    .btn { padding: 7px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-block; }
    .btn-ghost { background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); }
    .btn-red { background: #0057E1; color: white; }

    /* ═══════════════════════════════════════════════════
       MOBILE (≤ 768px)
       Navbar vira um drawer vertical com hambúrguer.
    ═══════════════════════════════════════════════════ */
    @media (max-width: 768px) {

      /* Navbar em mobile: empilha as seções verticalmente */
      .navbar {
        flex-wrap: wrap;
        height: auto;
        padding: 0;
      }

      /* Linha do topo: logo à esquerda, ☰ à direita */
      .navbar-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0 16px;
        height: 56px;
      }

      /* Botão hambúrguer — aparece só em mobile */
      .hamburger {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: white;
        font-size: 22px;
        cursor: pointer;
        padding: 8px;
        line-height: 1;
      }

      /* Links: ocultos por padrão; ".aberto" os exibe em coluna */
      .nav-links {
        display: none;
        width: 100%;
        flex-direction: column;
        gap: 0;
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      .nav-links.aberto { display: flex; }
      .nav-links a {
        padding: 14px 20px;
        font-size: 15px;
        border-radius: 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      /* Auth: oculto por padrão; ".aberto" o exibe em coluna */
      .nav-auth {
        display: none;
        width: 100%;
        flex-direction: column;
        padding: 12px 16px;
        gap: 8px;
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      .nav-auth.aberto { display: flex; }

      /* Botões ocupam largura total em mobile */
      .btn { width: 100%; text-align: center; }
      .user-name { font-size: 14px; }
    }
  `]
})
export class NavbarComponent {
  // auth é público (sem "private") porque o template acessa
  // auth.isLoggedIn(), auth.isAdmin(), auth.currentUser() e auth.logout()
  // diretamente no HTML. Em Angular, templates só acessam membros públicos.
  auth = inject(AuthService);

  // Signal booleano que controla se o menu mobile está aberto ou fechado.
  // "signal(false)" = começa fechado. A classe CSS ".aberto" é adicionada
  // dinamicamente via [class.aberto]="menuAberto()" no template.
  menuAberto = signal(false);

  // Alterna entre aberto/fechado a cada clique no hambúrguer.
  // ".update(v => !v)" = inverte o valor atual do signal.
  toggleMenu() { this.menuAberto.update(v => !v); }

  // Fecha o menu (chamado ao clicar em qualquer link ou ao fazer logout).
  fecharMenu() { this.menuAberto.set(false); }
}
