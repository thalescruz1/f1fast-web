// ============================================================
// COMPONENTE: PalpitesComponent  (/palpites)
// ============================================================
// Página índice de palpites — equivalente ao "apostasdacorrida.asp"
// do site original. Exibe todas as 30 etapas do calendário e
// permite navegar para os palpites de cada corrida já encerrada.
//
// Regra de visibilidade (idêntica ao backend):
//   prazoExpirado || encerrada → card clicável → /palpites/:id
//   prazo ainda aberto        → card inativo com aviso
//
// A página reusa os dados já existentes em getEtapas(),
// sem necessidade de endpoint novo no backend.
// ============================================================

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Etapa } from '../../core/models';

@Component({
  selector: 'app-palpites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>Apostas da Corrida</h2>
        <p>Os palpites de cada etapa ficam visíveis após o prazo limite de envio.</p>
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else {

        <!-- Contador: quantas corridas já têm palpites disponíveis -->
        <div class="summary">
          <span class="summary-count">
            <strong>{{ disponiveis() }}</strong> de 30 etapas com palpites disponíveis
          </span>
        </div>

        <div class="grid">
          @for (e of etapas(); track e.id) {

            <!-- Card clicável (encerrada ou prazo expirado) -->
            @if (e.encerrada || e.prazoExpirado) {
              <a [routerLink]="['/palpites', e.id]" class="card-etapa card-aberta">
                <div class="card-top">
                  <span class="etapa-num">Etapa {{ e.numero }}</span>
                  @if (e.encerrada) {
                    <span class="badge badge-enc">🏁 Encerrada</span>
                  } @else {
                    <span class="badge badge-exp">🔓 Ver palpites</span>
                  }
                </div>
                <div class="card-flag">{{ e.pais }}</div>
                <div class="card-name">{{ e.nome }}</div>
                <div class="card-circuit">{{ e.circuito }}</div>
                <div class="card-date">{{ e.dataCorrida | date:'dd/MM · HH:mm' }}</div>
                <div class="card-cta">Ver todos os palpites →</div>
              </a>

            <!-- Card inativo (prazo ainda aberto) -->
            } @else {
              <div class="card-etapa card-bloq">
                <div class="card-top">
                  <span class="etapa-num">Etapa {{ e.numero }}</span>
                  <span class="badge badge-lock">🔒 Prazo aberto</span>
                </div>
                <div class="card-flag">{{ e.pais }}</div>
                <div class="card-name">{{ e.nome }}</div>
                <div class="card-circuit">{{ e.circuito }}</div>
                <div class="card-date">{{ e.dataCorrida | date:'dd/MM · HH:mm' }}</div>
                <div class="card-aviso">Disponível após o prazo</div>
              </div>
            }

          }
        </div>
      }
    </div>
  `,
  styles: [`
    .summary {
      margin-bottom: 16px;
      font-size: 13px;
      color: #6B6B6B;
    }
    .summary-count strong { color: #E10600; }

    /* Grid responsivo: colunas de no mínimo 200px */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    /* Base do card */
    .card-etapa {
      border-radius: 8px;
      padding: 16px;
      border: 1px solid #E0E0E0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      transition: all 0.15s;
    }

    /* Card disponível — fundo branco, clicável */
    .card-aberta {
      background: white;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      border-left: 3px solid #E10600;
    }
    .card-aberta:hover {
      border-color: #E10600;
      box-shadow: 0 3px 12px rgba(225, 6, 0, 0.1);
      transform: translateY(-1px);
    }

    /* Card bloqueado — acinzentado, não clicável */
    .card-bloq {
      background: #FAFAFA;
      opacity: 0.6;
      cursor: default;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .etapa-num { font-size: 11px; color: #6B6B6B; font-weight: 500; }

    /* Badges */
    .badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
    .badge-enc  { background: rgba(225,6,0,0.1);   color: #E10600; }
    .badge-exp  { background: rgba(22,163,74,0.1); color: #166534; }
    .badge-lock { background: rgba(0,0,0,0.05);    color: #9E9E9E; }

    .card-flag    { font-size: 28px; margin-bottom: 4px; }
    .card-name    { font-size: 14px; font-weight: 700; color: #1A1A1A; }
    .card-circuit { font-size: 12px; color: #6B6B6B; }
    .card-date    { font-size: 12px; color: #6B6B6B; margin-top: 4px; }

    /* Chamada para ação no card disponível */
    .card-cta {
      margin-top: 10px;
      font-size: 12px;
      font-weight: 600;
      color: #E10600;
    }

    /* Aviso no card bloqueado */
    .card-aviso {
      margin-top: 10px;
      font-size: 11px;
      color: #9E9E9E;
      font-style: italic;
    }

    .loading { text-align: center; padding: 40px; color: #6B6B6B; }
  `]
})
export class PalpitesComponent implements OnInit {
  private api = inject(ApiService);

  etapas  = signal<Etapa[]>([]);
  loading = signal(true);

  // computed() = valor derivado de um signal.
  // Recalcula automaticamente sempre que etapas() mudar.
  // Conta quantas etapas já têm palpites disponíveis.
  disponiveis = computed(() =>
    this.etapas().filter(e => e.encerrada || e.prazoExpirado).length
  );

  ngOnInit() {
    // Reutiliza o endpoint público GET /api/etapas — sem endpoint novo no backend.
    // Os campos encerrada e prazoExpirado já vêm no EtapaDto.
    this.api.getEtapas().subscribe({
      next:  e => { this.etapas.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
