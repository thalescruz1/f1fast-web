// ============================================================
// COMPONENTE: AdminComponent
// ============================================================
// Responsável pelo layout do painel administrativo (/admin).
// Protegido pelo adminGuard — só acessível por usuários com
// role "Admin".
//
// Este componente serve como "casca" (shell layout) para as
// rotas filhas do admin:
//   /admin/resultado     → ResultadoComponent
//   /admin/participantes → ParticipantesComponent
//   /admin/etapas        → EtapasAdminComponent
//
// RouterOutlet = ponto de inserção das rotas filhas.
// É onde o Angular renderiza o componente filho correspondente
// à URL atual. Quando acessamos /admin/resultado, o
// ResultadoComponent é renderizado DENTRO do <router-outlet />.
//
// RouterLinkActive = diretiva que adiciona uma classe CSS ao
// link quando a rota correspondente está ativa.
// Ex: routerLinkActive="active" → adiciona classe "active"
//     ao link "Inserir Resultado" quando estamos em /admin/resultado.
//
// Nota: a classe está vazia (AdminComponent {}) porque este
// componente não tem lógica própria — só serve como layout.
// ============================================================

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  // RouterOutlet = necessário para renderizar rotas filhas no template
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>Painel Admin</h2>
        <p>Gestão do campeonato CV2026.</p>
      </div>
      <!-- Layout de 2 colunas: menu lateral + conteúdo principal -->
      <div class="admin-layout">
        <!-- Coluna esquerda: menu de navegação entre as seções admin -->
        <div class="card">
          <div class="admin-menu">
            <div class="menu-label">Menu</div>
            <!-- routerLinkActive="active" = adiciona classe "active" quando
                 a rota /admin/resultado ou /admin/participantes estiver ativa -->
            <a routerLink="resultado"     routerLinkActive="active" class="menu-item">🏁 Inserir Resultado</a>
            <a routerLink="participantes" routerLinkActive="active" class="menu-item">👥 Participantes</a>
            <a routerLink="etapas"        routerLinkActive="active" class="menu-item">📅 Gerenciar Prazos</a>
          </div>
        </div>
        <!-- Coluna direita: área de conteúdo onde as rotas filhas são renderizadas -->
        <div class="card admin-content">
          <!-- router-outlet = "slot" onde Angular insere o componente filho.
               Ex: ao acessar /admin/resultado, o ResultadoComponent
               aparece aqui dentro sem recarregar a navbar nem o menu. -->
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
// Classe vazia: este componente é apenas um layout (shell).
// Toda a lógica fica nos componentes filhos (ResultadoComponent, ParticipantesComponent).
export class AdminComponent {}
