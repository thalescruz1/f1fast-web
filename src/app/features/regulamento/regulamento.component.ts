import { Component } from '@angular/core';

@Component({
  selector: 'app-regulamento',
  standalone: true,
  template: `
    <div class="page">
      <div class="section-head">
        <h2>Regulamento CV2026</h2>
        <p>Campeonato Virtual F1Fast 2026</p>
      </div>

      <div class="card reg-card">
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
          Em caso de dúvidas: <a href="mailto:cvirtual@f1fast.com">cvirtual@f1fast.com</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reg-card { padding: 32px; max-width: 720px; }
    .reg-card h3 { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700; margin: 24px 0 10px; color: #E10600; border-left: 3px solid #E10600; padding-left: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .reg-card h3:first-child { margin-top: 0; }
    .reg-card p { font-size: 14px; color: #444; line-height: 1.7; margin-bottom: 10px; }
    .reg-card ul, .reg-card ol { padding-left: 20px; margin-bottom: 10px; }
    .reg-card li { font-size: 14px; color: #444; line-height: 1.8; }
    .pts-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .pts-table th { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; text-align: left; border-bottom: 2px solid #E10600; background: #1A1A1A; }
    .pts-table td { padding: 10px 12px; border-bottom: 1px solid #E0E0E0; font-size: 14px; }
    .pts-table td:last-child { font-weight: 700; color: #E10600; }
    .contact { margin-top: 24px; padding-top: 20px; border-top: 1px solid #E0E0E0; font-size: 13px; color: #6B6B6B; }
    .contact a { color: #0057E1; }
  `]
})
export class RegulamentoComponent {}
