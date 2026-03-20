import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PalpitePublico, ResultadoPublico, Etapa } from '../../core/models';

@Component({
  selector: 'app-palpites-corrida',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="pc-wrap">
      <div class="page-header">
        <div>
          <div class="ph-eyebrow">Palpites</div>
          <h1 class="ph-title">
            @if (etapa()) {
              {{ etapa()!.pais }} {{ etapa()!.nome }}
            } @else {
              PALPITES DA CORRIDA
            }
          </h1>
          @if (etapa()) {
            <div class="ph-sub">{{ etapa()!.circuito }} · {{ etapa()!.cidade }}</div>
          }
        </div>
        <div class="ph-right">
          <a routerLink="/palpites" class="btn-outline">Voltar</a>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (erro()) {
        <div class="empty">{{ erro() }}</div>
      } @else {

        @if (resultado()) {
          <div class="resultado-card">
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

        @if (resultado()) {
          <div class="legenda">
            <span class="leg pts3">+3 exato</span>
            <span class="leg pts2">+2 ±1 pos</span>
            <span class="leg pts1">+1 piloto certo</span>
            <span class="leg pts0">0</span>
          </div>
        }

        <div class="table-wrapper">
          <table class="palpites-table">
            <thead>
              <tr>
                <th class="col-fixed">Participante</th>
                <th>Enviado</th>
                <th>Pole</th>
                <th>1°</th><th>2°</th><th>3°</th><th>4°</th><th>5°</th>
                <th>6°</th><th>7°</th><th>8°</th><th>9°</th><th>10°</th>
                <th>MV</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              @for (p of palpites(); track p.login) {
                <tr>
                  <td class="col-fixed login-cell">{{ p.login }}</td>
                  <td class="enviado">{{ p.enviadoEm | date:'dd/MM HH:mm' }}</td>
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
      }
    </div>
  `,
  styles: [`
    .pc-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 32px; }

    /* Resultado */
    .resultado-card {
      background: var(--s2); border: 1.5px solid var(--b1);
      border-top: 3px solid var(--red); padding: 18px 22px; margin-bottom: 8px;
    }
    .resultado-title {
      font-family: var(--font-orb); font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px; color: var(--white); margin-bottom: 14px;
    }
    .resultado-grid { display: flex; flex-wrap: nowrap; gap: 4px; overflow-x: auto; padding-bottom: 4px; }
    .res-item {
      display: flex; flex-direction: column; align-items: center;
      background: var(--s1); padding: 10px 12px; min-width: 80px; flex-shrink: 0;
    }
    .res-item.pole { border-top: 2px solid var(--gold); }
    .res-item.mv { border-top: 2px solid var(--green); }
    .res-label { font-size: 10px; font-weight: 700; color: var(--w45); text-transform: uppercase; margin-bottom: 4px; }
    .res-value { font-size: var(--sz-sm); font-weight: 700; text-align: center; }

    /* Legenda */
    .legenda { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .leg {
      font-size: 11px; font-weight: 700; padding: 4px 10px;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .leg.pts3 { background: rgba(0,230,118,.12); color: var(--green); }
    .leg.pts2 { background: rgba(232,0,26,.12); color: var(--red); }
    .leg.pts1 { background: rgba(255,180,0,.12); color: var(--amber); }
    .leg.pts0 { background: var(--s2); color: var(--w45); }

    /* Table */
    .table-wrapper { width: 100%; overflow-x: auto; }
    .palpites-table { width: 100%; border-collapse: collapse; font-size: var(--sz-sm); }
    .palpites-table th {
      font-size: 11px; font-weight: 700; color: var(--w45);
      text-transform: uppercase; letter-spacing: 1px; padding: 12px 10px;
      text-align: left; border-bottom: 2px solid var(--red); white-space: nowrap;
      background: var(--s2);
    }
    .palpites-table td {
      padding: 10px; border-bottom: 1px solid var(--b1); vertical-align: middle;
    }
    .palpites-table tbody tr { transition: background .1s; }
    .palpites-table tbody tr:hover { background: var(--s1); }

    .col-fixed {
      position: sticky; left: 0; background: var(--bg); z-index: 2;
      box-shadow: 2px 0 4px rgba(0,0,0,.3);
    }
    .palpites-table thead .col-fixed { background: var(--s2); }
    .palpites-table tbody tr:hover .col-fixed { background: var(--s1); }
    .login-cell { font-weight: 700; white-space: nowrap; }
    .enviado { font-size: var(--sz-xs); color: var(--w45); white-space: nowrap; }

    .piloto-cell { white-space: nowrap; }
    .driver-name { font-size: var(--sz-sm); display: block; }
    .piloto-cell.cell-3 { background: rgba(0,230,118,.06); }
    .piloto-cell.cell-2 { background: rgba(232,0,26,.06); }
    .piloto-cell.cell-1 { background: rgba(255,180,0,.06); }

    .pts-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 6px; margin-top: 2px; }
    .badge-3 { background: rgba(0,230,118,.15); color: var(--green); }
    .badge-2 { background: rgba(232,0,26,.15); color: var(--red); }
    .badge-1 { background: rgba(255,180,0,.15); color: var(--amber); }

    .pts-total { font-family: var(--font-orb); font-weight: 700; color: var(--red); }

    .loading, .empty { text-align: center; padding: 40px; color: var(--w45); }

    @media (max-width: 768px) {
      .pc-wrap { padding: 24px 16px; }
    }
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

  abreviar(piloto: string): string {
    if (!piloto || piloto === '?') return piloto;
    const partes = piloto.split(' — ');
    if (partes.length < 2) return piloto;
    const palavras = partes[1].trim().split(' ');
    const sobrenome = palavras[palavras.length - 1];
    return `${partes[0]} — ${sobrenome.substring(0, 3).toUpperCase()}`;
  }

  pontosNaPosicao(posIndex: number, palpitePosicoes: string[]): number {
    const res = this.resultado();
    if (!res) return 0;

    const driver    = palpitePosicoes[posIndex];
    const resDriver = res.posicoes[posIndex];

    if (posIndex === 0) return driver === resDriver ? 2 : 0;
    if (posIndex === 11) return driver === resDriver ? 3 : 0;
    if (driver === resDriver) return 3;
    if (posIndex === 10 && driver === res.pos11) return 2;

    const resPosicoes = res.posicoes.slice(1, 11);
    const realIdx     = resPosicoes.indexOf(driver);
    if (realIdx === -1) return 0;

    const palpiteIdx = posIndex - 1;
    return Math.abs(realIdx - palpiteIdx) === 1 ? 2 : 1;
  }

  classeCell(posIndex: number, palpitePosicoes: string[]): string {
    if (!this.resultado()) return 'piloto-cell';
    const pts = this.pontosNaPosicao(posIndex, palpitePosicoes);
    return pts > 0 ? `piloto-cell cell-${pts}` : 'piloto-cell';
  }
}
