// ============================================================
// COMPONENTE: CalendarioComponent
// ============================================================
// Responsável pela página de calendário (/calendario).
// Exibe todos os 30 GPs da temporada 2026 em cards.
// Cada card tem comportamento visual diferente:
//   - Próxima etapa: borda vermelha à esquerda
//   - Sprint: borda amarela + tag "Sprint"
//   - Encerrada: opacidade reduzida + link clicável para os palpites
//   - Futuras: sem destaque especial
//
// Destaque técnico: os cards de etapas encerradas são links
// (<a>) com [routerLink] para /palpites/:id.
// Os cards futuros têm [routerLink]="null" (sem link).
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
        <!-- cal-grid = grade CSS responsiva com colunas de min 210px -->
        <div class="cal-grid">
          @for (e of etapas(); track e.id) {
            <!-- [routerLink]="e.encerrada ? ['/palpites', e.id] : null"
                 = link condicional:
                   - Se encerrada → link para /palpites/5 (por exemplo)
                   - Se não encerrada → null (sem link, elemento não clicável)
                 Isso torna o card clicável APENAS para corridas passadas. -->
            <a [routerLink]="e.encerrada ? ['/palpites', e.id] : null"
               class="cal-item"
               [class.next]="isProxima(e)"   
               [class.sprint]="e.sprint"       
               [class.done]="e.encerrada">   <!-- adiciona classe "next" se for a próxima --> <!-- adiciona classe "sprint" se for Sprint --> <!-- adiciona classe "done" se encerrada -->

              <div class="cal-top">
                <span class="cal-num">Etapa {{ e.numero }}</span>
                <!-- Exibe uma única tag por etapa (prioridade: próxima > sprint > encerrada) -->
                @if (isProxima(e)) { <span class="cal-tag next">Próximo</span> }
                @else if (e.sprint) { <span class="cal-tag sprint">Sprint</span> }
                @else if (e.encerrada) { <span class="cal-tag done">Encerrado</span> }
              </div>

              <div class="cal-flag">{{ e.pais }}</div>
              <div class="cal-name">{{ e.nome }}</div>
              <div class="cal-circuit">{{ e.circuito }}</div>
              <div class="cal-date">
                <!-- | date:'dd MMM' = formata data como "15 Mar" -->
                <strong>{{ e.dataCorrida | date:'dd MMM' }}</strong>
                · {{ e.dataCorrida | date:'HH:mm' }}
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .cal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
    .cal-item { background: white; border: 1px solid #E0E0E0; border-radius: 8px; padding: 16px; cursor: default; transition: all 0.15s; text-decoration: none; color: inherit; display: block; }
    .cal-item.next { border-left: 3px solid #0057E1; }
    .cal-item.sprint { border-left: 3px solid #E5A800; }
    .cal-item.done { opacity: 0.5; }
    .cal-item[href]:hover { border-color: #BDBDBD; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .cal-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .cal-num { font-size: 11px; color: #6B6B6B; font-weight: 500; }
    .cal-tag { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; text-transform: uppercase; }
    .cal-tag.sprint { background: rgba(229,168,0,0.12); color: #996F00; }
    .cal-tag.next { background: rgba(0,87,225,0.1); color: #0057E1; }
    .cal-tag.done { background: rgba(0,0,0,0.06); color: #6B6B6B; }
    .cal-flag { font-size: 24px; margin-bottom: 6px; }
    .cal-name { font-size: 14px; font-weight: 700; }
    .cal-circuit { font-size: 12px; color: #6B6B6B; margin-bottom: 8px; }
    .cal-date { font-size: 12px; color: #6B6B6B; }
    .cal-date strong { color: #1A1A1A; }
    .loading { text-align: center; padding: 40px; color: #6B6B6B; }
  `]
})
export class CalendarioComponent implements OnInit {
  private api = inject(ApiService);
  etapas  = signal<Etapa[]>([]);
  loading = signal(true);

  ngOnInit() {
    // GET /etapas → retorna todas as 30 etapas ordenadas por número
    this.api.getEtapas().subscribe({
      next:  e => { this.etapas.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  // Identifica qual é a próxima etapa disponível para palpite.
  // "Próxima" = a primeira etapa que não está encerrada E ainda tem prazo aberto.
  // .find() = retorna o PRIMEIRO elemento que satisfaz a condição.
  // ?.id = optional chaining: acessa .id só se "proxima" não for undefined.
  isProxima(etapa: Etapa): boolean {
    const proxima = this.etapas().find(e => !e.encerrada && !e.prazoExpirado);
    return proxima?.id === etapa.id;
  }
}
