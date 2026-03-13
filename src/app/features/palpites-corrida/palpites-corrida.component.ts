// ============================================================
// COMPONENTE: PalpitesCorridaComponent
// ============================================================
// Responsável pela página /palpites/:etapaId.
// Exibe todos os palpites enviados por todos os participantes
// para uma corrida específica — fica visível após o prazo.
//
// Modificações:
//   - Exibe login apenas (sem nome completo)
//   - Coluna de login fixa durante scroll horizontal
//   - Resultado oficial exibido em seção separada acima da tabela
//   - Nome da etapa e circuito no cabeçalho
//   - Pontos ganhos por posição exibidos em badge colorido
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PalpitePublico, ResultadoPublico, Etapa } from '../../core/models';

@Component({
  selector: 'app-palpites-corrida',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>
          @if (etapa()) {
            {{ etapa()!.pais }} {{ etapa()!.nome }}
          } @else {
            Palpites da Corrida
          }
        </h2>
        @if (etapa()) {
          <p>{{ etapa()!.circuito }} · {{ etapa()!.cidade }}</p>
        } @else {
          <p>Todos os palpites enviados para esta etapa.</p>
        }
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (erro()) {
        <div class="card empty">{{ erro() }}</div>
      } @else {

        <!-- Resultado oficial em seção separada -->
        @if (resultado()) {
          <div class="card resultado-card">
            <div class="resultado-title">Resultado Oficial</div>
            <div class="resultado-grid">
              <div class="res-item pole">
                <span class="res-label">Pole</span>
                <span class="res-value">{{ abreviar(resultado()!.posicoes[0]) }}</span>
              </div>
              @for (i of posIndices; track i) {
                <div class="res-item">
                  <span class="res-label">{{ i + 1 }}°</span>
                  <span class="res-value">{{ abreviar(resultado()!.posicoes[i + 1]) }}</span>
                </div>
              }
              <div class="res-item mv">
                <span class="res-label">Mel. Volta</span>
                <span class="res-value">{{ abreviar(resultado()!.posicoes[11]) }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Legenda de pontos (só aparece quando há resultado) -->
        @if (resultado()) {
          <div class="legenda">
            <span class="leg-item pts3">+3 exato</span>
            <span class="leg-item pts2">+2 ±1 pos</span>
            <span class="leg-item pts1">+1 piloto certo</span>
            <span class="leg-item pts0">0</span>
          </div>
        }

        <!-- Tabela de palpites -->
        <div class="card">
          <div class="table-wrapper">
            <table class="palpites-table">
              <thead>
                <tr>
                  <th class="col-fixed">Participante</th>
                    <th>Enviado em</th>
                  <th>Pole</th>
                  <th>1°</th><th>2°</th><th>3°</th><th>4°</th><th>5°</th>
                  <th>6°</th><th>7°</th><th>8°</th><th>9°</th><th>10°</th>
                  <th>MV</th>
                  <th>Pontos</th>
                
                </tr>
              </thead>
              <tbody>
                @for (p of palpites(); track p.login) {
                  <tr>
                    <td class="col-fixed login-cell">{{ p.login }}</td>

                    <td class="enviado-em">{{ p.enviadoEm | date:'dd/MM HH:mm' }}</td>
                    <!-- Para cada posição, calcula e exibe os pontos ganhos -->
                    @for (pos of p.posicoes; track $index) {
                      <td class="piloto-cell" [class]="classeCell($index, p.posicoes)">
                        <span class="driver-name">{{ abreviar(pos) }}</span>
                        @if (resultado()) {
                          @let pts = pontosNaPosicao($index, p.posicoes);
                          @if (pts > 0) {
                            <span class="pts-badge" [class]="'badge-' + pts">+{{ pts }}</span>
                          }
                        }
                      </td>
                    }
                    <td class="pts-total">{{ p.pontosObtidos ?? '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .palpites-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    /* Timing board header — estilo F1 escuro */
    .palpites-table th { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; padding: 10px 8px; text-align: left; border-bottom: 2px solid #E10600; white-space: nowrap; background: #1A1A1A; }
    .palpites-table th.col-fixed { background: #1A1A1A; color: rgba(255,255,255,0.9); }
    .palpites-table td { padding: 8px; border-bottom: 1px solid #E0E0E0; vertical-align: middle; }
    .palpites-table tbody tr:hover { background: #FAFAFA; }
    /* Coluna fixa */
    .col-fixed { position: sticky; left: 0; background: white; z-index: 2; box-shadow: 2px 0 4px rgba(0,0,0,0.06); }
    .palpites-table tbody tr:hover .col-fixed { background: #FAFAFA; }
    .login-cell { font-weight: 600; font-size: 13px; white-space: nowrap; }
    /* Célula de posição com badge de pontos */
    .piloto-cell { white-space: nowrap; }
    .driver-name { font-size: 12px; color: #444; display: block; }
    /* Coloração de fundo por pontuação */
    .piloto-cell.cell-3 { background: rgba(22,163,74,0.08); }
    .piloto-cell.cell-2 { background: rgba(0,87,225,0.07); }
    .piloto-cell.cell-1 { background: rgba(229,168,0,0.10); }
    /* Badge de pontos */
    .pts-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 8px; margin-top: 2px; }
    .badge-3 { background: #dcfce7; color: #166534; }
    .badge-2 { background: rgba(0,87,225,0.12); color: #0057E1; }
    .badge-1 { background: rgba(229,168,0,0.15); color: #996F00; }
    /* Total de pontos */
    .pts-total { font-weight: 700; color: #0057E1; }
    /* Data do palpite */
    .enviado-em { font-size: 11px; color: #6B6B6B; white-space: nowrap; }
    .loading, .empty { text-align: center; padding: 40px; color: #6B6B6B; }
    .table-wrapper { width: 100%; overflow-x: auto; }
    /* Resultado oficial — estilo F1 escuro */
    .resultado-card { margin-bottom: 8px; padding: 16px 20px; background: #1A1A1A !important; border-top: 3px solid #E10600 !important; }
    .resultado-title { font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: white; margin-bottom: 12px; }
    .resultado-grid { display: flex; flex-wrap: nowrap; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .res-item { display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 8px 10px; min-width: 90px; flex-shrink: 0; }
    .res-item.pole { border-top: 2px solid #E5A800; }
    .res-item.mv   { border-top: 2px solid #16A34A; }
    .res-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5); text-transform: uppercase; margin-bottom: 4px; }
    .res-value { font-size: 12px; font-weight: 600; text-align: center; color: white; }
    /* Legenda */
    .legenda { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
    .leg-item { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 10px; }
    .leg-item.pts3 { background: #dcfce7; color: #166534; }
    .leg-item.pts2 { background: rgba(0,87,225,0.12); color: #0057E1; }
    .leg-item.pts1 { background: rgba(229,168,0,0.15); color: #996F00; }
    .leg-item.pts0 { background: #F5F5F5; color: #6B6B6B; }
  `]
})
export class PalpitesCorridaComponent implements OnInit {
  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);

  palpites  = signal<PalpitePublico[]>([]);
  resultado = signal<ResultadoPublico | null>(null);
  etapa     = signal<Etapa | null>(null);
  loading   = signal(true);
  erro      = signal('');

  // Índices 0–9 para gerar as 10 posições no template do resultado
  posIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  ngOnInit() {
    const etapaId = Number(this.route.snapshot.paramMap.get('etapaId'));

    this.api.getPalpitesPublicos(etapaId).subscribe({
      next:  p => { this.palpites.set(p); this.loading.set(false); },
      error: e => { this.erro.set(e.error || 'Erro ao carregar palpites.'); this.loading.set(false); }
    });

    this.api.getResultadoPublico(etapaId).subscribe({
      next:  r => this.resultado.set(r),
      error: () => {}
    });

    this.api.getEtapas().subscribe({
      next: etapas => this.etapa.set(etapas.find(x => x.id === etapaId) ?? null),
      error: () => {}
    });
  }

  /**
   * Abrevia o nome do piloto para o formato "NUM — SOB"
   * onde SOB = 3 primeiras letras do sobrenome em maiúsculas.
   * Ex: "3 — Max Verstappen" → "3 — VER"
   *     "44 — Lewis Hamilton" → "44 — HAM"
   */
  abreviar(piloto: string): string {
    if (!piloto || piloto === '?') return piloto;
    const partes = piloto.split(' — ');
    if (partes.length < 2) return piloto;
    const palavras = partes[1].trim().split(' ');
    const sobrenome = palavras[palavras.length - 1];
    return `${partes[0]} — ${sobrenome.substring(0, 3).toUpperCase()}`;
  }

  /**
   * Calcula os pontos ganhos em uma posição específica.
   *
   * posIndex = índice no array posicoes:
   *   0       → Pole Position (+2 se acertar)
   *   1 a 10  → Posições da corrida (+3 exato, +2 ±1 pos, +1 piloto certo)
   *   11      → Melhor Volta (+3 se acertar)
   */
  pontosNaPosicao(posIndex: number, palpitePosicoes: string[]): number {
    const res = this.resultado();
    if (!res) return 0;

    const driver     = palpitePosicoes[posIndex];
    const resDriver  = res.posicoes[posIndex];

    // Pole (índice 0)
    if (posIndex === 0) return driver === resDriver ? 2 : 0;

    // Melhor Volta (índice 11)
    if (posIndex === 11) return driver === resDriver ? 3 : 0;

    // Posições 1–10: índices 1 a 10 no array
    if (driver === resDriver) return 3; // acerto exato

    // Caso especial: chutou 10° (posIndex=10) e o piloto chegou 11° → erro de 1 posição → +2
    if (posIndex === 10 && driver === res.pos11) return 2;

    // Verifica se o piloto está em alguma posição do top-10 real (índices 1–10)
    const resPosicoes = res.posicoes.slice(1, 11); // posições reais [1..10]
    const realIdx     = resPosicoes.indexOf(driver);   // posição real do piloto (-1 se não está)
    if (realIdx === -1) return 0; // piloto não está no top-10 real nem no 11°

    // Diferença entre o índice real do piloto e o índice do palpite
    // Ambos usam base 0 dentro do slice de posições (0 = 1°, 9 = 10°)
    const palpiteIdx = posIndex - 1; // converte índice do array para índice de posição (base 0)
    return Math.abs(realIdx - palpiteIdx) === 1 ? 2 : 1;
  }

  /**
   * Retorna a classe CSS de fundo da célula conforme os pontos ganhos.
   * Só colore quando há resultado disponível.
   */
  classeCell(posIndex: number, palpitePosicoes: string[]): string {
    if (!this.resultado()) return 'piloto-cell';
    const pts = this.pontosNaPosicao(posIndex, palpitePosicoes);
    return pts > 0 ? `piloto-cell cell-${pts}` : 'piloto-cell';
  }
}
