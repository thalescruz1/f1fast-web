import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Etapa } from '../../core/models';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="cal-wrap">
      <div class="page-header">
        <div>
          <div class="ph-eyebrow">Temporada</div>
          <h1 class="ph-title">CALENDÁRIO</h1>
          <div class="ph-sub">30 etapas · Corridas Sprint marcadas em amarelo</div>
        </div>
        <div class="ph-right">
          <div class="ph-badge">CV<span>2026</span></div>
          <div class="ph-meta">Mar — Dez 2026</div>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else {
        <div class="cal-grid">
          @for (e of etapas(); track e.id) {
            <div class="cal-card"
                 [class.is-next]="isProxima(e)"
                 [class.is-done]="e.encerrada"
                 [class.is-sprint]="e.sprint">

              <div class="cc-head">
                <span class="cc-num">R{{ e.numero }}</span>
                @if (isProxima(e)) {
                  <span class="cc-badge next"><span class="ldot"></span> Próxima</span>
                } @else if (e.encerrada) {
                  <span class="cc-badge done">Encerrada</span>
                } @else if (e.sprint) {
                  <span class="cc-badge sprint">Sprint</span>
                }
              </div>

              <div class="cc-flag">{{ e.pais }}</div>
              <div class="cc-name">{{ e.nome }}</div>
              <div class="cc-circuit">{{ e.circuito }}</div>

              <div class="cc-date">
                <span class="cc-date-day">{{ e.dataCorrida | date:'dd MMM' }}</span>
                <span class="cc-date-time">{{ e.dataCorrida | date:'HH:mm' }}</span>
              </div>

              <div class="cc-actions">
                <a [routerLink]="['/etapa', e.id]" class="cc-link">Ver Detalhes →</a>
                @if (!e.encerrada && !e.prazoExpirado) {
                  <a routerLink="/palpite" class="cc-link palpite">Fazer Palpite</a>
                }
                @if (e.encerrada) {
                  <a [routerLink]="['/palpites', e.id]" class="cc-link">Apostas →</a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .cal-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 32px; }

    .cal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 2px; }

    .cal-card {
      background: var(--s1); border: 1.5px solid var(--b1);
      padding: 20px; display: flex; flex-direction: column;
      transition: background .2s;
    }
    .cal-card:hover { background: var(--s2); }
    .cal-card.is-done { opacity: .55; }
    .cal-card.is-done:hover { opacity: .7; }
    .cal-card.is-next { border-color: var(--red); background: rgba(232,0,26,.04); }
    .cal-card.is-sprint { border-left: 3px solid var(--amber); }

    .cc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .cc-num { font-family: var(--font-orb); font-size: var(--sz-xs); font-weight: 700; color: var(--w45); }
    .cc-badge {
      font-size: 11px; font-weight: 700; padding: 3px 10px;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .cc-badge.next {
      display: flex; align-items: center; gap: 6px;
      background: rgba(232,0,26,.12); color: var(--red);
    }
    .cc-badge.done { background: var(--s3); color: var(--w45); }
    .cc-badge.sprint { background: rgba(255,180,0,.12); color: var(--amber); }

    .cc-flag { font-size: 28px; margin-bottom: 8px; }
    .cc-name {
      font-family: var(--font-display); font-weight: 700;
      font-size: var(--sz-lg); text-transform: uppercase; line-height: 1.1;
    }
    .cc-circuit { font-size: var(--sz-sm); color: var(--w45); margin: 4px 0 16px; }

    .cc-date { display: flex; gap: 8px; align-items: baseline; margin-bottom: 16px; }
    .cc-date-day { font-weight: 700; font-size: var(--sz-base); }
    .cc-date-time { font-size: var(--sz-sm); color: var(--w45); }

    .cc-actions {
      margin-top: auto; padding-top: 12px; border-top: 1px solid var(--b1);
      display: flex; gap: 16px; flex-wrap: wrap;
    }
    .cc-link {
      font-size: var(--sz-sm); font-weight: 700; color: var(--red);
      text-decoration: none; text-transform: uppercase; letter-spacing: .5px;
    }
    .cc-link:hover { text-decoration: underline; }
    .cc-link.palpite { color: var(--green); }

    .loading { text-align: center; padding: 40px; color: var(--w45); }

    @media (max-width: 768px) {
      .cal-wrap { padding: 24px 16px; }
      .cal-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CalendarioComponent implements OnInit {
  private api = inject(ApiService);
  etapas  = signal<Etapa[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.api.getEtapas().subscribe({
      next:  e => { this.etapas.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  isProxima(etapa: Etapa): boolean {
    const proxima = this.etapas().find(e => !e.encerrada && !e.prazoExpirado);
    return proxima?.id === etapa.id;
  }
}
