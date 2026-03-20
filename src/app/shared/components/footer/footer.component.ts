import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="f-inner">
        <div>
          <div class="f-logo">F1<span>FAST</span></div>
          <div class="f-copy">Campeonato Virtual de Fórmula 1 · CV2026 · © 2026 F1Fast.com.br</div>
        </div>
        <div class="f-links">
          <a routerLink="/regulamento" class="f-link">Regulamento</a>
          <a href="mailto:cvirtual@f1fast.com" class="f-link">Contato</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      position: relative; z-index: 1;
      background: var(--s1);
      border-top: 1px solid var(--b1);
      padding: 32px;
      margin-top: 48px;
    }
    .f-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
    }
    .f-logo {
      font-family: var(--font-orb); font-size: 16px; font-weight: 700;
      color: var(--white); letter-spacing: 2px;
    }
    .f-logo span { color: var(--red); }
    .f-copy { font-size: var(--sz-xs); color: var(--w45); margin-top: 4px; }
    .f-links { display: flex; gap: 20px; }
    .f-link {
      font-size: var(--sz-xs); color: var(--w45);
      text-decoration: none; transition: color .15s;
    }
    .f-link:hover { color: var(--white); }
  `]
})
export class FooterComponent {}
