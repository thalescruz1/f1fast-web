import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>Painel Admin</h2>
        <p>Gestão do campeonato CV2026.</p>
      </div>
      <div class="admin-layout">
        <div class="card">
          <div class="admin-menu">
            <div class="menu-label">Menu</div>
            <a routerLink="resultado"     routerLinkActive="active" class="menu-item">🏁 Inserir Resultado</a>
            <a routerLink="participantes" routerLinkActive="active" class="menu-item">👥 Participantes</a>
          </div>
        </div>
        <div class="card admin-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { display: grid; grid-template-columns: 200px 1fr; gap: 20px; }
    .admin-menu { padding: 12px; display: flex; flex-direction: column; gap: 2px; }
    .menu-label { font-size: 10px; font-weight: 700; color: #6B6B6B; letter-spacing: 2px; text-transform: uppercase; padding: 8px 12px; }
    .menu-item { padding: 9px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; color: #6B6B6B; cursor: pointer; text-decoration: none; display: block; transition: background 0.12s; }
    .menu-item:hover { background: #F5F5F5; color: #1A1A1A; }
    .menu-item.active { background: rgba(225,6,0,0.07); color: #E10600; font-weight: 600; }
    .admin-content { min-height: 400px; }
    @media (max-width: 768px) { .admin-layout { grid-template-columns: 1fr; } }
  `]
})
export class AdminComponent {}
