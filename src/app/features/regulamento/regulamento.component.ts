import { Component } from '@angular/core';

@Component({
  selector: 'app-regulamento',
  standalone: true,
  template: `
    <div class="reg-wrap">
      <div class="page-header">
        <div>
          <div class="ph-eyebrow">Regras</div>
          <h1 class="ph-title">REGULAMENTO</h1>
          <div class="ph-sub">Campeonato Virtual F1Fast 2026</div>
        </div>
      </div>

      <div class="reg-card">
        <h3>Objetivo</h3>
        <p>O CV2026 tem como objetivo levar aos fãs da Fórmula 1 mais diversão com a disputa de quem conhece mais e tem melhor faro para acertar a classificação de cada etapa do mundial.</p>

        <h3>Palpites</h3>
        <p>Para cada corrida o participante deve enviar seu palpite antes do treino classificatório. O sistema bloqueará automaticamente após o prazo. Caso envie um segundo palpite para o mesmo evento, o anterior será substituído.</p>
        <p>Para cada corrida (Sprint ou Feature) o participante deve escolher:</p>
        <ul>
          <li>O piloto que conquistará a <strong>Pole Position</strong></li>
          <li>Os <strong>10 primeiros colocados</strong> na classificação final</li>
          <li>Quem fará a <strong>Melhor Volta</strong> da corrida</li>
        </ul>

        <h3>Pontuação</h3>
        <table class="pts-table">
          <thead>
            <tr><th>Acerto</th><th>Pontos</th></tr>
          </thead>
          <tbody>
            <tr><td>Pole Position exata</td><td>2 pts</td></tr>
            <tr><td>Melhor Volta exata</td><td>3 pts</td></tr>
            <tr><td>Posição exata (1° ao 10°)</td><td>3 pts</td></tr>
            <tr><td>Erro de 1 posição para cima ou baixo</td><td>2 pts</td></tr>
            <tr><td>Piloto certo, posição errada (>1 pos.)</td><td>1 pt</td></tr>
          </tbody>
        </table>
        <p><strong>Máximo por etapa: 35 pontos.</strong> Em fins de semana com Sprint, o máximo é 70 pontos.</p>

        <h3>Critérios de Desempate</h3>
        <ol>
          <li>Maior número de acertos de Melhor Volta</li>
          <li>Maior número de acertos de Pole Position</li>
          <li>Maior número de acertos exatos dos 10</li>
          <li>Quem participou de mais etapas</li>
        </ol>

        <h3>Resultados</h3>
        <p>Após cada GP, no prazo máximo de 1 dia útil, os resultados serão atualizados e os pontos calculados automaticamente.</p>

        <div class="contact">
          Em caso de dúvidas: <a href="mailto:cvirtual@f1fast.com">cvirtual&#64;f1fast.com</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reg-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 32px; }
    .reg-card {
      background: var(--s1); border: 1.5px solid var(--b1);
      padding: 36px; max-width: 720px;
    }
    .reg-card h3 {
      font-family: var(--font-orb); font-size: 11px; font-weight: 700;
      margin: 28px 0 12px; color: var(--red);
      border-left: 3px solid var(--red); padding-left: 12px;
      text-transform: uppercase; letter-spacing: 2px;
    }
    .reg-card h3:first-child { margin-top: 0; }
    .reg-card p { font-size: var(--sz-base); color: var(--w70); line-height: 1.7; margin-bottom: 12px; }
    .reg-card strong { color: var(--white); }
    .reg-card ul, .reg-card ol { padding-left: 20px; margin-bottom: 12px; }
    .reg-card li { font-size: var(--sz-base); color: var(--w70); line-height: 1.8; }

    .pts-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .pts-table th {
      font-size: var(--sz-sm); font-weight: 700; color: var(--w45);
      text-transform: uppercase; letter-spacing: 1px; padding: 10px 14px;
      text-align: left; border-bottom: 2px solid var(--red); background: var(--s2);
    }
    .pts-table td { padding: 12px 14px; border-bottom: 1px solid var(--b1); font-size: var(--sz-base); color: var(--w70); }
    .pts-table td:last-child { font-weight: 700; color: var(--red); }

    .contact {
      margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--b1);
      font-size: var(--sz-sm); color: var(--w45);
    }
    .contact a { color: var(--red); text-decoration: none; font-weight: 600; }
    .contact a:hover { text-decoration: underline; }
  `]
})
export class RegulamentoComponent {}
