// ============================================================
// COMPONENTE: RankingComponent
// ============================================================
// Responsável pela página de ranking geral (/ranking).
// Exibe a tabela de classificação do campeonato com todos
// os participantes ordenados por pontuação total.
//
// É uma página pública (sem authGuard) — qualquer visitante
// pode ver o ranking mesmo sem estar logado.
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { RankingItem } from '../../core/models';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>Ranking — CV2026</h2>
        <p>Classificação geral atualizada após cada Grande Prêmio.</p>
      </div>

      <!-- 3 estados: carregando / lista vazia / tabela com dados -->
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (ranking().length === 0) {
        <div class="card empty">Nenhum resultado ainda. Aguarde o primeiro GP! 🏁</div>
      } @else {
        <div class="card">
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
              <!-- track item.usuarioId = forma Angular de identificar cada linha
                   para otimizar re-renderização quando a lista muda -->
              @for (item of ranking(); track item.usuarioId) {
                <tr>
                  <!-- [class.p1]="item.posicao===1" = aplica classe CSS "p1" (ouro)
                       apenas quando o item está na 1ª posição. Mesmo para p2 e p3. -->
                  <td><span class="pos" [class.p1]="item.posicao===1" [class.p2]="item.posicao===2" [class.p3]="item.posicao===3">{{ item.posicao }}°</span></td>
                  <td>
                    <div class="name">{{ item.nome }}</div>
                    <div class="city">{{ item.localizacao }}</div>
                  </td>
                  <td class="muted">{{ item.etapasParticipadas }} / 30</td>
                  <!-- Detalhamento dos acertos: exatos, poles e melhores voltas
                       são usados como critério de desempate na API -->
                  <td class="muted">{{ item.acertosExatos }} exatos · {{ item.acertosPole }} poles · {{ item.acertosMelhorVolta }} MV</td>
                  <td class="pts">{{ item.totalPontos }} pts</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .rank-table { width: 100%; border-collapse: collapse; }
    .rank-table th { font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px; padding: 12px 16px; text-align: left; border-bottom: 1px solid #E0E0E0; }
    .rank-table td { padding: 12px 16px; border-bottom: 1px solid #E0E0E0; font-size: 14px; }
    .rank-table tr:last-child td { border-bottom: none; }
    .rank-table tbody tr:hover { background: #FAFAFA; }
    .pos { font-weight: 700; color: #6B6B6B; }
    .pos.p1 { color: #E5A800; } .pos.p2 { color: #9E9E9E; } .pos.p3 { color: #A0522D; }
    .name { font-weight: 600; }
    .city { font-size: 12px; color: #6B6B6B; }
    .muted { font-size: 13px; color: #6B6B6B; }
    .pts { font-weight: 700; }
    .loading, .empty { text-align: center; padding: 40px; color: #6B6B6B; }
  `]
})
export class RankingComponent implements OnInit {
  private api = inject(ApiService);

  // signal<RankingItem[]>([]) = signal tipado que começa com array vazio.
  // <RankingItem[]> indica ao TypeScript o tipo dos dados esperados.
  ranking = signal<RankingItem[]>([]);
  loading = signal(true);

  // ngOnInit = executado automaticamente quando o componente é criado.
  // Faz GET /ranking para buscar a classificação atual.
  ngOnInit() {
    this.api.getRanking().subscribe({
      next:  r => { this.ranking.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)  // em caso de erro, remove o loading
    });
  }
}
