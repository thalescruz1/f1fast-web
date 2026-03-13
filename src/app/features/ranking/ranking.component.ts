// ============================================================
// COMPONENTE: RankingComponent
// ============================================================
// Responsável pela página de ranking geral (/ranking).
// Exibe a tabela de classificação do campeonato com todos
// os participantes ordenados por pontuação total.
//
// Ao clicar em um participante, abre um painel lateral (drawer)
// com o histórico de pontos por corrida.
// ============================================================

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
    <div class="page">
      <div class="section-head">
        <h2>Ranking — CV2026</h2>
        @if (ultimoGp()) {
          <p>Classificação geral atualizada após o <strong>{{ ultimoGp() }}</strong>.</p>
        } @else {
          <p>Classificação geral atualizada após cada Grande Prêmio.</p>
        }
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (ranking().length === 0) {
        <div class="card empty">Nenhum resultado ainda. Aguarde o primeiro GP! 🏁</div>
      } @else {
        <div class="card">
          <div class="card-toolbar">
            <a routerLink="/palpites" class="link-apostas">Ver apostas detalhadas →</a>
          </div>
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
                <!-- Linha clicável: abre o drawer com o histórico do participante -->
                <tr class="row-click" (click)="abrirHistorico(item)"
                    [class.row-active]="selecionado()?.usuarioId === item.usuarioId">
                  <td><span class="pos" [class.p1]="item.posicao===1" [class.p2]="item.posicao===2" [class.p3]="item.posicao===3">{{ item.posicao }}°</span></td>
                  <td>
                    <div class="name">{{ item.login }}</div>
                    <div class="hint">clique para ver histórico</div>
                  </td>
                  <td class="muted">{{ item.etapasParticipadas }} / 30</td>
                  <td class="muted">{{ item.acertosExatos }} exatos · {{ item.acertosPole }} poles · {{ item.acertosMelhorVolta }} MV</td>
                  <td class="pts">{{ item.totalPontos }} pts</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- ===== DRAWER: Histórico por corrida ===== -->
    @if (selecionado()) {
      <!-- Overlay escuro fecha o drawer ao clicar fora -->
      <div class="overlay" (click)="fecharHistorico()"></div>
      <div class="drawer">
        <div class="drawer-header">
          <div>
            <div class="drawer-title">{{ selecionado()!.login }}</div>
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
                <!-- Barra proporcional: 35 pts = 100% -->
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
                  @if (h.acertouPole)        { <span class="badge pole">Pole ✓</span> }
                  @if (h.acertouMelhorVolta) { <span class="badge mv">MV ✓</span> }
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
    /* Tabela */
    .rank-table { width: 100%; border-collapse: collapse; }
    .rank-table th { font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; border-bottom: 2px solid #E10600; background: #FAFAFA; }
    .rank-table td { padding: 12px 16px; border-bottom: 1px solid #E0E0E0; font-size: 14px; }
    .rank-table tr:last-child td { border-bottom: none; }
    .row-click { cursor: pointer; transition: background 0.1s; }
    .row-click:hover { background: #F5F7FF; }
    .row-active { background: #EEF3FF !important; }
    .pos { display: inline-flex; align-items: center; justify-content: center; font-weight: 700; color: #6B6B6B; font-size: 13px; width: 32px; height: 32px; border-radius: 50%; }
    .pos.p1 { background: linear-gradient(135deg, #FFD700, #E5A800); color: #1A1A1A; font-size: 14px; box-shadow: 0 2px 8px rgba(229,168,0,0.3); }
    .pos.p2 { background: linear-gradient(135deg, #E0E0E0, #B0B0B0); color: #1A1A1A; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
    .pos.p3 { background: linear-gradient(135deg, #CD7F32, #A0522D); color: white; font-size: 14px; box-shadow: 0 2px 6px rgba(160,82,45,0.3); }
    .name { font-weight: 600; }
    .hint { font-size: 11px; color: #BDBDBD; }
    .muted { font-size: 13px; color: #6B6B6B; }
    .pts { font-weight: 700; }
    .loading, .empty { text-align: center; padding: 40px; color: #6B6B6B; }
    .card-toolbar { padding: 10px 16px; border-bottom: 1px solid #E0E0E0; text-align: right; }
    .link-apostas { font-size: 13px; color: #0057E1; text-decoration: none; font-weight: 600; }
    .link-apostas:hover { text-decoration: underline; }

    /* Overlay */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 100; }

    /* Drawer deslizante */
    .drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 360px; max-width: 90vw; background: white; box-shadow: -4px 0 24px rgba(0,0,0,0.12); z-index: 101; display: flex; flex-direction: column; animation: slideIn 0.2s ease; border-left: 3px solid #E10600; }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .drawer-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px; border-bottom: none; background: #1A1A1A; }
    .drawer-title { font-size: 18px; font-weight: 700; color: white; }
    .drawer-sub { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 2px; }
    .btn-close { background: none; border: none; font-size: 18px; color: rgba(255,255,255,0.6); cursor: pointer; padding: 4px 8px; border-radius: 4px; line-height: 1; }
    .btn-close:hover { background: rgba(255,255,255,0.1); color: white; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }

    /* Itens do histórico */
    .hist-loading, .hist-vazio { text-align: center; padding: 40px; color: #6B6B6B; font-size: 13px; }
    .hist-item { display: flex; flex-direction: column; gap: 5px; }
    .hist-meta { display: flex; justify-content: space-between; align-items: baseline; }
    .hist-etapa { font-size: 12px; font-weight: 500; color: #1A1A1A; }
    .hist-pts { font-size: 15px; font-weight: 700; color: #0057E1; white-space: nowrap; }
    .hist-bar-bg { height: 8px; background: #F0F0F0; border-radius: 4px; overflow: hidden; }
    .hist-bar { height: 100%; border-radius: 4px; min-width: 4px; transition: width 0.4s ease; }
    .hist-bar.bar-full { background: linear-gradient(90deg, #E5A800, #FFD700, #E5A800); background-size: 200% 100%; animation: shimmer 3s infinite; }
    .hist-bar.bar-good { background: #16A34A; }
    .hist-bar.bar-mid  { background: #0057E1; }
    .hist-bar.bar-low  { background: #9E9E9E; }
    .hist-badges { display: flex; gap: 4px; flex-wrap: wrap; }
    .badge { font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 8px; }
    .badge.pole  { background: rgba(229,168,0,0.15); color: #996F00; }
    .badge.mv    { background: #dcfce7; color: #166534; }
    .badge.exato { background: rgba(0,87,225,0.1); color: #0057E1; }
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
    // Clique no mesmo participante fecha o drawer
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
