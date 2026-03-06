import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer>
      <div class="footer-inner">
        <div>
          <div class="footer-logo">F1<span>FAST</span></div>
          <div class="footer-sub">Campeonato Virtual de Fórmula 1 · CV2026</div>
        </div>
        <div class="footer-links">
          <a routerLink="/regulamento">Regulamento</a>
          <a href="mailto:cvirtual@f1fast.com">Contato</a>
        </div>
      </div>
      <div class="footer-copy">© 2026 F1Fast.com.br</div>
    </footer>
  `,
  styles: [`
    footer { background: #1A1A1A; padding: 32px; margin-top: 48px; }
    .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .footer-logo { font-family: 'Orbitron', monospace; font-size: 16px; color: white; letter-spacing: 2px; }
    .footer-logo span { color: #E10600; }
    .footer-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: none; }
    .footer-links a:hover { color: white; }
    .footer-copy { max-width: 1100px; margin: 16px auto 0; font-size: 11px; color: #444; }
  `]
})
export class FooterComponent {}
