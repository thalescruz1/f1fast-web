import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { RankingItem, HistoricoEtapa } from '../../core/models';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="ranking-wrap">
      <div class="page-header">
        <div>
          <div class="ph-eyebrow">Classificação Geral</div>
          <h1 class="ph-title">RANKING</h1>
          @if (ultimoGp()) {
            <div class="ph-sub">Atualizado após o {{ ultimoGp() }}</div>
          } @else {
            <div class="ph-sub">Atualizado após cada Grande Prêmio</div>
          }
        </div>
        <div class="ph-right">
          <div class="ph-badge">CV<span>2026</span></div>
          <div class="ph-meta">30 etapas · 35 pts máx</div>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (ranking().length === 0) {
        <div class="card empty">Nenhum resultado ainda. Aguarde o primeiro GP!</div>
      } @else {
        <!-- Podium -->
        @if (ranking().length >= 3) {
          <div class="podium">
            <div class="pod-card g2" (click)="abrirHistorico(ranking()[1])">
              <span class="pod-badge s">2</span>
              <div class="pod-name">{{ ranking()[1].nome }}</div>
              <div class="pod-handle">{{ ranking()[1].login }}</div>
              <div class="pod-pts s">{{ ranking()[1].totalPontos }}</div>
              <div class="pod-pts-lbl">Pontos</div>
              <div class="pod-stats">
                {{ ranking()[1].acertosExatos }} exatos · {{ ranking()[1].acertosPole }} poles · {{ ranking()[1].acertosMelhorVolta }} MV
              </div>
            </div>
            <div class="pod-card g1" (click)="abrirHistorico(ranking()[0])">
              <span class="pod-badge g">1</span>
              <div class="pod-name">{{ ranking()[0].nome }}</div>
              <div class="pod-handle">{{ ranking()[0].login }}</div>
              <div class="pod-pts g">{{ ranking()[0].totalPontos }}</div>
              <div class="pod-pts-lbl">Pontos</div>
              <div class="pod-stats">
                {{ ranking()[0].acertosExatos }} exatos · {{ ranking()[0].acertosPole }} poles · {{ ranking()[0].acertosMelhorVolta }} MV
              </div>
            </div>
            <div class="pod-card g3" (click)="abrirHistorico(ranking()[2])">
              <span class="pod-badge b">3</span>
              <div class="pod-name">{{ ranking()[2].nome }}</div>
              <div class="pod-handle">{{ ranking()[2].login }}</div>
              <div class="pod-pts b">{{ ranking()[2].totalPontos }}</div>
              <div class="pod-pts-lbl">Pontos</div>
              <div class="pod-stats">
                {{ ranking()[2].acertosExatos }} exatos · {{ ranking()[2].acertosPole }} poles · {{ ranking()[2].acertosMelhorVolta }} MV
              </div>
            </div>
          </div>
        }

        <!-- Table -->
        <table class="rank-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Participante</th>
              <th>Etapas</th>
              <th>Acertos</th>
              <th>Pontos</th>
            </tr>
          </thead>
          <tbody>
            @for (item of ranking(); track item.usuarioId) {
              <tr (click)="abrirHistorico(item)"
                  [class.row-active]="selecionado()?.usuarioId === item.usuarioId">
                <td><span class="td-posnum">{{ item.posicao }}°</span></td>
                <td>
                  <div class="td-name">{{ item.nome }}</div>
                  <div class="td-handle">{{ item.login }}</div>
                </td>
                <td class="td-data">{{ item.etapasParticipadas }} / 30</td>
                <td class="td-data">{{ item.acertosExatos }} exatos · {{ item.acertosPole }} poles · {{ item.acertosMelhorVolta }} MV</td>
                <td><span class="td-pts">{{ item.totalPontos }}</span></td>
              </tr>
            }
          </tbody>
        </table>

        <div class="ver-apostas">
          <a routerLink="/palpites" class="btn-outline">Ver apostas detalhadas →</a>
        </div>
      }
    </div>

    <!-- Drawer -->
    @if (selecionado()) {
      <div class="overlay" (click)="fecharHistorico()"></div>
      <div class="drawer">
        <div class="drawer-header">
          <div>
            <div class="drawer-title">{{ selecionado()!.nome }}</div>
            <div class="drawer-sub">{{ selecionado()!.posicao }}° no geral · {{ selecionado()!.totalPontos }} pts</div>
          </div>
          <button class="btn-close" (click)="fecharHistorico()">✕</button>
        </div>

        <div class="drawer-body">
          @if (loadingHistorico()) {
            <div class="hist-loading">Carregando...</div>
          } @else if (historico().length === 0) {
            <div class="hist-vazio">Nenhuma etapa pontuada ainda.</div>
          } @else {
            @for (h of historico(); track h.etapaNumero) {
              <div class="hist-item">
                <div class="hist-meta">
                  <span class="hist-etapa">{{ h.etapaNumero }}. {{ h.etapaNome }}</span>
                  <span class="hist-pts">{{ h.pontos }} pts</span>
                </div>
                <div class="hist-bar-bg">
                  <div class="hist-bar"
                       [style.width.%]="(h.pontos / 35) * 100"
                       [class.bar-full]="h.pontos === 35"
                       [class.bar-good]="h.pontos >= 20 && h.pontos < 35"
                       [class.bar-mid]="h.pontos >= 10 && h.pontos < 20"
                       [class.bar-low]="h.pontos < 10">
                  </div>
                </div>
                <div class="hist-badges">
                  @if (h.acertouPole)        { <span class="badge pole">Pole</span> }
                  @if (h.acertouMelhorVolta) { <span class="badge mv">MV</span> }
                  @if (h.acertosExatos > 0)  { <span class="badge exato">{{ h.acertosExatos }} exatos</span> }
                </div>
              </div>
            }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .ranking-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 32px; }

    /* Podium */
    .podium { display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 2px; margin-bottom: 2px; }
    .pod-card {
      padding: 24px 20px; border: 1.5px solid var(--b1);
      position: relative; overflow: hidden; background: var(--s1);
      transition: background .2s; cursor: pointer;
    }
    .pod-card:hover { background: var(--s2); }
    .pod-card.g1 { border-color: rgba(240,192,64,.3); background: rgba(240,192,64,.04); }
    .pod-card.g1::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--gold); }
    .pod-card.g2 { background: rgba(184,184,200,.03); }
    .pod-card.g2::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--silver); }
    .pod-card.g3 { background: rgba(200,120,64,.03); }
    .pod-card.g3::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--bronze); }
    .pod-badge {
      width: 36px; height: 36px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-family: var(--font-orb); font-size: 14px; font-weight: 900; margin-bottom: 14px;
    }
    .pod-badge.g { background: var(--gold); color: #000; }
    .pod-badge.s { background: var(--silver); color: #000; }
    .pod-badge.b { background: var(--bronze); color: #000; }
    .pod-name { font-family: var(--font-display); font-weight: 700; font-size: var(--sz-xl); text-transform: uppercase; }
    .pod-handle { font-size: var(--sz-sm); color: var(--w45); margin: 3px 0 16px; }
    .pod-pts { font-family: var(--font-orb); font-size: 40px; font-weight: 900; line-height: 1; }
    .pod-pts.g { color: var(--gold); }
    .pod-pts.s { color: var(--silver); }
    .pod-pts.b { color: var(--bronze); }
    .pod-pts-lbl { font-size: var(--sz-sm); font-weight: 600; color: var(--w45); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    .pod-stats { font-size: var(--sz-sm); color: var(--w45); margin-top: 14px; line-height: 2; }

    /* Table */
    .rank-table { width: 100%; border-collapse: collapse; border: 1.5px solid var(--b1); }
    .rank-table thead { background: var(--s2); border-bottom: 1px solid var(--b2); }
    .rank-table th {
      font-size: var(--sz-sm); font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: var(--w45); padding: 13px 18px; text-align: left;
    }
    .rank-table tbody tr {
      border-bottom: 1px solid var(--b1); cursor: pointer; transition: background .15s;
    }
    .rank-table tbody tr:hover { background: var(--s2); }
    .row-active { background: var(--s2) !important; }
    .rank-table td { padding: 16px 18px; vertical-align: middle; }
    .td-posnum { font-family: var(--font-orb); font-size: var(--sz-base); font-weight: 700; color: var(--w45); }
    .rank-table tbody tr:hover .td-posnum { color: var(--red); }
    .td-name { font-family: var(--font-display); font-size: var(--sz-lg); font-weight: 700; text-transform: uppercase; }
    .td-handle { font-size: var(--sz-sm); color: var(--w45); }
    .td-data { font-size: var(--sz-base); color: var(--w70); }
    .td-pts { font-family: var(--font-orb); font-size: var(--sz-lg); font-weight: 700; }

    .ver-apostas { margin-top: 24px; text-align: center; }

    .loading, .empty { text-align: center; padding: 40px; color: var(--w45); }

    /* Overlay + Drawer */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 100; }
    .drawer {
      position: fixed; top: 0; right: 0; height: 100vh; width: 380px; max-width: 90vw;
      background: var(--s1); border-left: 2px solid var(--red);
      z-index: 101; display: flex; flex-direction: column;
      animation: slideIn .2s ease;
    }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .drawer-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 20px; background: var(--s2); border-bottom: 1px solid var(--b1);
    }
    .drawer-title { font-family: var(--font-display); font-size: var(--sz-lg); font-weight: 700; text-transform: uppercase; }
    .drawer-sub { font-size: var(--sz-sm); color: var(--w45); margin-top: 4px; }
    .btn-close {
      background: none; border: none; font-size: 18px; color: var(--w45);
      cursor: pointer; padding: 4px 8px; line-height: 1;
    }
    .btn-close:hover { color: var(--white); }
    .drawer-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }

    .hist-loading, .hist-vazio { text-align: center; padding: 40px; color: var(--w45); font-size: var(--sz-sm); }
    .hist-item { display: flex; flex-direction: column; gap: 5px; }
    .hist-meta { display: flex; justify-content: space-between; align-items: baseline; }
    .hist-etapa { font-size: var(--sz-sm); font-weight: 500; color: var(--w70); }
    .hist-pts { font-size: var(--sz-base); font-weight: 700; color: var(--red); white-space: nowrap; }
    .hist-bar-bg { height: 8px; background: var(--s3); border-radius: 4px; overflow: hidden; }
    .hist-bar { height: 100%; border-radius: 4px; min-width: 4px; transition: width .4s ease; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .hist-bar.bar-full { background: linear-gradient(90deg, #E5A800, #FFD700, #E5A800); background-size: 200% 100%; animation: shimmer 3s infinite; }
    .hist-bar.bar-good { background: var(--green); }
    .hist-bar.bar-mid  { background: var(--amber); }
    .hist-bar.bar-low  { background: var(--w45); }
    .hist-badges { display: flex; gap: 4px; flex-wrap: wrap; }
    .badge {
      font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 8px;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .badge.pole  { background: rgba(240,192,64,.15); color: var(--gold); }
    .badge.mv    { background: rgba(0,230,118,.12); color: var(--green); }
    .badge.exato { background: rgba(232,0,26,.12); color: var(--red); }

    @media (max-width: 768px) {
      .ranking-wrap { padding: 24px 16px; }
      .podium { grid-template-columns: 1fr; }
      .pod-card.g1 { order: -1; }
      .rank-table th:nth-child(4), .rank-table td:nth-child(4) { display: none; }
    }
  `]
})
export class RankingComponent implements OnInit {
  private api = inject(ApiService);

  ranking          = signal<RankingItem[]>([]);
  ultimoGp         = signal<string | null>(null);
  loading          = signal(true);
  selecionado      = signal<RankingItem | null>(null);
  historico        = signal<HistoricoEtapa[]>([]);
  loadingHistorico = signal(false);

  ngOnInit() {
    this.api.getRanking().subscribe({
      next:  r => { this.ranking.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.api.getUltimoGp().subscribe({
      next: r => this.ultimoGp.set(r.nomeGp),
      error: () => {}
    });
  }

  abrirHistorico(item: RankingItem) {
    if (this.selecionado()?.usuarioId === item.usuarioId) {
      this.fecharHistorico();
      return;
    }
    this.selecionado.set(item);
    this.historico.set([]);
    this.loadingHistorico.set(true);

    this.api.getHistoricoParticipante(item.login).subscribe({
      next:  h => { this.historico.set(h); this.loadingHistorico.set(false); },
      error: () => this.loadingHistorico.set(false)
    });
  }

  fecharHistorico() {
    this.selecionado.set(null);
    this.historico.set([]);
  }
}
