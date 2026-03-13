// ============================================================
// COMPONENTE: CalendarioComponent
// ============================================================
// Responsável pela página de calendário (/calendario).
// Exibe todos os 30 GPs da temporada 2026 em cards.
//
// Modificação: cada card agora tem link para os detalhes da
// etapa (/etapa/:id) com horários, localização, recordista,
// distância e tipo de pista.
// ============================================================

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
    <div class="page">
      <div class="section-head">
        <h2>Calendário 2026</h2>
        <p>30 etapas · Corridas Sprint marcadas em amarelo.</p>
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else {
        <div class="cal-grid">
          @for (e of etapas(); track e.id) {
            <div class="cal-item"
               [class.next]="isProxima(e)"
               [class.sprint]="e.sprint"
               [class.done]="e.encerrada">

              <div class="cal-top">
                <span class="cal-num">Etapa {{ e.numero }}</span>
                @if (isProxima(e)) { <span class="cal-tag next">Próximo</span> }
                @else if (e.sprint) { <span class="cal-tag sprint">Sprint</span> }
                @else if (e.encerrada) { <span class="cal-tag done">Encerrado</span> }
              </div>

              <div class="cal-flag">{{ e.pais }}</div>
              <div class="cal-name">{{ e.nome }}</div>
              <div class="cal-circuit">{{ e.circuito }}</div>
              <div class="cal-date">
                <strong>{{ e.dataCorrida | date:'dd MMM' }}</strong>
                · {{ e.dataCorrida | date:'HH:mm' }}
              </div>

              <!-- Links de ação: detalhes sempre disponível; apostas só após encerrar -->
              <div class="cal-links">
                <a [routerLink]="['/etapa', e.id]" class="cal-link">Detalhes →</a>
                @if (e.encerrada) {
                  <a [routerLink]="['/palpites', e.id]" class="cal-link">Apostas →</a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .cal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
    .cal-item { background: white; border: 1px solid #E0E0E0; border-radius: 8px; padding: 16px; cursor: default; transition: all 0.2s; color: inherit; display: flex; flex-direction: column; }
    .cal-item:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .cal-item.next { border-left: 3px solid #E10600; border-top: 3px solid #E10600; background: linear-gradient(135deg, rgba(225,6,0,0.03) 0%, white 40%); }
    .cal-item.sprint { border-left: 3px solid #E5A800; }
    .cal-item.done { opacity: 0.65; }
    .cal-item.done:hover { transform: none; box-shadow: none; }
    .cal-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .cal-num { font-size: 11px; color: #6B6B6B; font-weight: 500; }
    .cal-tag { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; text-transform: uppercase; }
    .cal-tag.sprint { background: rgba(229,168,0,0.12); color: #996F00; }
    .cal-tag.next { background: rgba(225,6,0,0.1); color: #E10600; display: flex; align-items: center; gap: 4px; }
    .cal-tag.next::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #E10600; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .cal-tag.done { background: rgba(0,0,0,0.06); color: #6B6B6B; }
    .cal-flag { font-size: 24px; margin-bottom: 6px; }
    .cal-name { font-size: 14px; font-weight: 700; }
    .cal-circuit { font-size: 12px; color: #6B6B6B; margin-bottom: 6px; }
    .cal-date { font-size: 12px; color: #6B6B6B; flex: 1; }
    .cal-date strong { color: #1A1A1A; }
    /* Links no rodapé do card */
    .cal-links { display: flex; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #E0E0E0; }
    .cal-link { font-size: 12px; font-weight: 600; color: #0057E1; text-decoration: none; }
    .cal-link:hover { text-decoration: underline; }
    .loading { text-align: center; padding: 40px; color: #6B6B6B; }
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
