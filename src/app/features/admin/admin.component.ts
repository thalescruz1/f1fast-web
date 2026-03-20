import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-wrap">
      <div class="page-header">
        <div>
          <div class="ph-eyebrow">Administração</div>
          <h1 class="ph-title">PAINEL ADMIN</h1>
          <div class="ph-sub">Gestão do campeonato CV2026</div>
        </div>
      </div>

      <div class="admin-layout">
        <div class="admin-menu">
          <div class="menu-label">Menu</div>
          <a routerLink="resultado"     routerLinkActive="active" class="menu-item">Inserir Resultado</a>
          <a routerLink="participantes" routerLinkActive="active" class="menu-item">Participantes</a>
          <a routerLink="etapas"        routerLinkActive="active" class="menu-item">Gerenciar Prazos</a>
        </div>
        <div class="admin-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 32px; }

    .admin-layout { display: grid; grid-template-columns: 220px 1fr; gap: 2px; }

    .admin-menu {
      background: var(--s1); border: 1.5px solid var(--b1);
      padding: 16px; display: flex; flex-direction: column; gap: 2px;
    }
    .menu-label {
      font-family: var(--font-orb); font-size: 10px; font-weight: 700;
      color: var(--w45); letter-spacing: 2px; text-transform: uppercase;
      padding: 8px 12px; margin-bottom: 4px;
    }
    .menu-item {
      padding: 10px 14px; font-size: var(--sz-sm); font-weight: 600;
      color: var(--w45); cursor: pointer; text-decoration: none;
      display: block; transition: all .12s;
    }
    .menu-item:hover { background: var(--s2); color: var(--white); }
    .menu-item.active { background: rgba(232,0,26,.08); color: var(--red); border-left: 3px solid var(--red); }

    .admin-content {
      background: var(--s1); border: 1.5px solid var(--b1);
      min-height: 400px; padding: 24px;
    }

    @media (max-width: 768px) {
      .admin-wrap { padding: 24px 16px; }
      .admin-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminComponent {}
