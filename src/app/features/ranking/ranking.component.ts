import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
        @if (podio().length) {
          <div class="podium">
            @for (p of podio(); track p.item.usuarioId) {
              <div class="pod-card {{ p.cls }}" [class.expanded]="estaAberto(p.item.usuarioId)" (click)="toggle(p.item)">
                <span class="pod-badge {{ p.medal }}">{{ p.pos }}</span>
                <div class="pod-name">{{ p.item.nome }}</div>
                <div class="pod-handle">{{ p.item.login }}</div>
                <div class="pod-pts {{ p.medal }}">{{ p.item.totalPontos }}</div>
                <div class="pod-pts-lbl">Pontos</div>
                <div class="pod-stats">
                  {{ p.item.acertosExatos }} exatos · {{ p.item.acertosPole }} poles · {{ p.item.acertosMelhorVolta }} MV
                </div>
                @if (estaAberto(p.item.usuarioId)) {
                  <div class="rank-hist" (click)="$event.stopPropagation()">
                    <ng-container [ngTemplateOutlet]="histTpl" [ngTemplateOutletContext]="{ id: p.item.usuarioId }"></ng-container>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Lista -->
        <div class="rank-list">
          <div class="rank-head">
            <span>Pos</span>
            <span>Participante</span>
            <span>Etapas</span>
            <span class="col-acertos">Acertos</span>
            <span class="col-pts">Pontos</span>
          </div>

          @for (item of ranking(); track item.usuarioId) {
            <div class="rank-item" [class.item-open]="estaAberto(item.usuarioId)">
              <div class="rank-row" (click)="toggle(item)">
                <span class="td-posnum">{{ item.posicao }}°</span>
                <span class="rr-part">
                  <span class="td-name">{{ item.nome }}</span>
                  <span class="td-handle">{{ item.login }}</span>
                </span>
                <span class="td-data">{{ item.etapasParticipadas }} / 30</span>
                <span class="td-data col-acertos">{{ item.acertosExatos }} exatos · {{ item.acertosPole }} poles · {{ item.acertosMelhorVolta }} MV</span>
                <span class="td-pts col-pts">{{ item.totalPontos }}</span>
              </div>
              @if (estaAberto(item.usuarioId)) {
                <div class="rank-hist">
                  <ng-container [ngTemplateOutlet]="histTpl" [ngTemplateOutletContext]="{ id: item.usuarioId }"></ng-container>
                </div>
              }
            </div>
          }
        </div>

        <div class="ver-apostas">
          <a routerLink="/palpites" class="btn-outline">Ver palpites detalhados →</a>
        </div>
      }
    </div>

    <!-- Faixa horizontal de pontos por GP (reutilizada no pódio e na lista) -->
    <ng-template #histTpl let-id="id">
      @if (estaCarregando(id)) {
        <div class="hist-loading">Carregando...</div>
      } @else if (hist(id).length === 0) {
        <div class="hist-vazio">Nenhuma etapa pontuada ainda.</div>
      } @else {
        <div class="hist-strip">
          @for (h of hist(id); track h.etapaNumero) {
            <div class="hist-cell" [title]="h.etapaNumero + '. ' + h.etapaNome">
              <span class="hc-gp">{{ abreviarGp(h.etapaNome) }}</span>
              <span class="hc-pts" [ngClass]="tierPts(h.pontos)">{{ h.pontos }}</span>
            </div>
          }
        </div>
      }
    </ng-template>
  `,
  styles: [`
    .ranking-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 32px; }

    /* Podium */
    .podium { display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 2px; margin-bottom: 2px; align-items: start; }
    .pod-card {
      padding: 24px 20px; border: 1.5px solid var(--b1);
      position: relative; overflow: hidden; background: var(--s1);
      transition: background .2s; cursor: pointer;
    }
    .pod-card:hover { background: var(--s2); }
    .pod-card.expanded { background: var(--s2); }
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

    /* Lista (grid — não é <table> para o scroll da faixa ficar contido) */
    .rank-list { border: 1.5px solid var(--b1); }
    .rank-head, .rank-row {
      display: grid;
      grid-template-columns: 44px minmax(0,1fr) 84px minmax(0,1.5fr) 64px;
      align-items: center; gap: 10px;
    }
    .rank-head {
      background: var(--s2); border-bottom: 1px solid var(--b2); padding: 13px 18px;
      font-size: var(--sz-sm); font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: var(--w45);
    }
    .rank-item { border-bottom: 1px solid var(--b1); }
    .rank-item:last-child { border-bottom: none; }
    .rank-row { padding: 16px 18px; cursor: pointer; transition: background .15s; }
    .rank-row:hover { background: var(--s2); }
    .rank-item.item-open .rank-row { background: var(--s2); }
    .rr-part { display: flex; flex-direction: column; min-width: 0; }
    .td-posnum { font-family: var(--font-orb); font-size: var(--sz-base); font-weight: 700; color: var(--w45); }
    .rank-row:hover .td-posnum { color: var(--red); }
    .td-name {
      font-family: var(--font-display); font-size: var(--sz-lg); font-weight: 700;
      text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .td-handle { font-size: var(--sz-sm); color: var(--w45); }
    .td-data { font-size: var(--sz-base); color: var(--w70); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .td-pts { font-family: var(--font-orb); font-size: var(--sz-lg); font-weight: 700; }
    .col-pts { text-align: right; }

    /* Histórico por GP (faixa horizontal) — bloco, rola dentro de si */
    .rank-hist { padding: 4px 18px 14px; }
    .hist-strip {
      display: flex; gap: 6px; overflow-x: auto;
      padding: 4px 0 8px; overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
    }
    .hist-cell {
      flex: 0 0 auto; min-width: 48px;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 8px 6px; background: var(--s2); border: 1px solid var(--b1);
    }
    .hc-gp {
      font-size: 10px; font-weight: 700; letter-spacing: .5px;
      color: var(--w45); text-transform: uppercase; white-space: nowrap;
    }
    .hc-pts {
      font-family: var(--font-orb); font-size: var(--sz-base); font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .hc-pts.pts-full { color: var(--gold); }
    .hc-pts.pts-good { color: var(--green); }
    .hc-pts.pts-mid  { color: var(--amber); }
    .hc-pts.pts-low  { color: var(--w45); }

    .hist-loading, .hist-vazio { padding: 12px 4px; color: var(--w45); font-size: var(--sz-sm); }

    .ver-apostas { margin-top: 24px; text-align: center; }
    .loading, .empty { text-align: center; padding: 40px; color: var(--w45); }

    @media (max-width: 768px) {
      .ranking-wrap { padding: 24px 12px; }
      .podium { grid-template-columns: 1fr; }
      .pod-card.g1 { order: -1; }
      .pod-card { padding: 16px 14px; }
      .pod-pts { font-size: 28px; }
      .pod-name { font-size: var(--sz-lg); }

      .rank-head, .rank-row { grid-template-columns: 32px minmax(0,1fr) 56px 52px; gap: 8px; padding: 12px 10px; }
      .col-acertos { display: none; }
      .rank-head { font-size: 10px; letter-spacing: .8px; }
      .rank-hist { padding: 2px 10px 12px; }
      .td-name { font-size: var(--sz-base); }
      .td-handle { font-size: 11px; }
      .td-data { font-size: var(--sz-sm); }
      .td-posnum { font-size: var(--sz-sm); }
      .td-pts { font-size: var(--sz-base); }
    }
  `]
})
export class RankingComponent implements OnInit {
  private api = inject(ApiService);

  ranking     = signal<RankingItem[]>([]);
  ultimoGp    = signal<string | null>(null);
  loading     = signal(true);

  // Múltiplos participantes podem ficar abertos ao mesmo tempo (para comparar)
  private abertos     = signal<Set<number>>(new Set());
  private histLoading = signal<Set<number>>(new Set());
  private histCache   = signal<Record<number, HistoricoEtapa[]>>({});

  // Top 3 na ordem de exibição (2º, 1º, 3º), com metadados de medalha
  podio = computed(() => {
    const r = this.ranking();
    if (r.length < 3) return [];
    return [
      { item: r[1], pos: 2, cls: 'g2', medal: 's' },
      { item: r[0], pos: 1, cls: 'g1', medal: 'g' },
      { item: r[2], pos: 3, cls: 'g3', medal: 'b' },
    ];
  });

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

  estaAberto(id: number)     { return this.abertos().has(id); }
  estaCarregando(id: number) { return this.histLoading().has(id); }
  hist(id: number)           { return this.histCache()[id] ?? []; }

  toggle(item: RankingItem) {
    const abertos = new Set(this.abertos());
    if (abertos.has(item.usuarioId)) {
      abertos.delete(item.usuarioId);
      this.abertos.set(abertos);
      return;
    }
    abertos.add(item.usuarioId);
    this.abertos.set(abertos);

    // Já carregado antes? reaproveita
    if (this.histCache()[item.usuarioId]) return;

    const loading = new Set(this.histLoading());
    loading.add(item.usuarioId);
    this.histLoading.set(loading);

    this.api.getHistoricoParticipante(item.login).subscribe({
      next:  h => {
        this.histCache.set({ ...this.histCache(), [item.usuarioId]: h });
        this.pararLoading(item.usuarioId);
      },
      error: () => this.pararLoading(item.usuarioId)
    });
  }

  private pararLoading(id: number) {
    const loading = new Set(this.histLoading());
    loading.delete(id);
    this.histLoading.set(loading);
  }

  /** Classe de cor da pontuação por faixa. */
  tierPts(pontos: number): string {
    if (pontos === 35)  return 'pts-full';
    if (pontos >= 20)   return 'pts-good';
    if (pontos >= 10)   return 'pts-mid';
    return 'pts-low';
  }

  /** "GP da China" → "CHI"; "Sprint da China" → "CHI·S". */
  abreviarGp(nome: string): string {
    const sprint = /sprint/i.test(nome);
    const base = (nome || '')
      .replace(/^GP\s+d[aeo]s?\s+/i, '')
      .replace(/^GP\s+/i, '')
      .replace(/^Sprint\s+d[aeo]s?\s+/i, '')
      .replace(/^Sprint\s+/i, '')
      .trim();
    const code = base.slice(0, 3).toUpperCase();
    return sprint ? code + '·S' : code;
  }
}
