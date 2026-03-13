// ============================================================
// COMPONENTE: FooterComponent
// ============================================================
// Rodapé da aplicação — presente em todas as páginas.
// É um componente puramente visual (presentacional):
// não tem lógica, não consome serviços, não tem estados.
// Por isso a classe está completamente vazia (FooterComponent {}).
//
// Exibe:
//   - Logo e subtítulo do campeonato
//   - Links para Regulamento e Contato por e-mail
//   - Linha de copyright
//
// Nota: "shared/components" = pasta de componentes reutilizáveis
// que são usados em múltiplas partes da aplicação (navbar, footer).
// Diferente de "features", que contém componentes de uma feature
// específica (login, ranking, palpite...).
// ============================================================

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  // RouterLink = necessário para o link interno /regulamento
  imports: [RouterLink],
  template: `
    <div class="checkered-top"></div>
    <footer>
      <div class="footer-inner">
        <div>
          <div class="footer-logo">F1<span>FAST</span></div>
          <div class="footer-sub">Campeonato Virtual de Fórmula 1 · CV2026</div>
        </div>
        <div class="footer-links">
          <!-- routerLink = navegação interna (sem recarregar a página) -->
          <a routerLink="/regulamento">Regulamento</a>
          <!-- href="mailto:..." = link nativo de e-mail do browser -->
          <a href="mailto:cvirtual@f1fast.com">Contato</a>
        </div>
      </div>
      <div class="footer-copy">© 2026 F1Fast.com.br</div>
    </footer>
  `,
  styles: [`
    .checkered-top { height: 8px; background: repeating-conic-gradient(#1A1A1A 0% 25%, #333 0% 50%) 0 0 / 8px 8px; margin-top: 48px; }
    footer { background: #1A1A1A; padding: 32px; margin-top: 0; }
    .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .footer-logo { font-family: 'Orbitron', monospace; font-size: 16px; color: white; letter-spacing: 2px; }
    .footer-logo span { color: #0057E1; }
    .footer-sub { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a { font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: none; }
    .footer-links a:hover { color: white; }
    .footer-copy { max-width: 1100px; margin: 16px auto 0; font-size: 11px; color: #444; }
  `]
})
// Classe vazia = componente puramente visual (sem lógica).
// Todo o conteúdo está no template acima.
export class FooterComponent {}
