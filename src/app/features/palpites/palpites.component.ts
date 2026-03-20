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
    <div class="pal-wrap">
      <div class="page-header">
        <div>
          <div class="ph-eyebrow">Transparência</div>
          <h1 class="ph-title">APOSTAS</h1>
          <div class="ph-sub">Os palpites de cada etapa ficam visíveis após o prazo limite de envio</div>
        </div>
        <div class="ph-right">
          <div class="ph-badge">{{ disponiveis() }}<span>/30</span></div>
          <div class="ph-meta">Etapas disponíveis</div>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else {
        <div class="grid">
          @for (e of etapas(); track e.id) {
            @if (e.encerrada || e.prazoExpirado) {
              <a [routerLink]="['/palpites', e.id]" class="card-etapa aberta">
                <div class="ce-head">
                  <span class="ce-num">R{{ e.numero }}</span>
                  @if (e.encerrada) {
                    <span class="ce-badge enc">Encerrada</span>
                  } @else {
                    <span class="ce-badge exp">Ver palpites</span>
                  }
                </div>
                <div class="ce-flag">{{ e.pais }}</div>
                <div class="ce-name">{{ e.nome }}</div>
                <div class="ce-circuit">{{ e.circuito }}</div>
                <div class="ce-date">{{ e.dataCorrida | date:'dd/MM · HH:mm' }}</div>
                <div class="ce-cta">Ver todos os palpites →</div>
              </a>
            } @else {
              <div class="card-etapa bloq">
                <div class="ce-head">
                  <span class="ce-num">R{{ e.numero }}</span>
                  <span class="ce-badge lock">Prazo aberto</span>
                </div>
                <div class="ce-flag">{{ e.pais }}</div>
                <div class="ce-name">{{ e.nome }}</div>
                <div class="ce-circuit">{{ e.circuito }}</div>
                <div class="ce-date">{{ e.dataCorrida | date:'dd/MM · HH:mm' }}</div>
                <div class="ce-aviso">Disponível após o prazo</div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .pal-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 32px; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 2px; }

    .card-etapa {
      background: var(--s1); border: 1.5px solid var(--b1);
      padding: 18px; display: flex; flex-direction: column; gap: 4px;
      transition: background .15s;
    }
    .card-etapa.aberta {
      text-decoration: none; color: inherit; cursor: pointer;
      border-left: 3px solid var(--red);
    }
    .card-etapa.aberta:hover { background: var(--s2); }
    .card-etapa.bloq { opacity: .45; }

    .ce-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .ce-num { font-family: var(--font-orb); font-size: var(--sz-xs); font-weight: 700; color: var(--w45); }
    .ce-badge {
      font-size: 10px; font-weight: 700; padding: 3px 8px;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .ce-badge.enc { background: rgba(232,0,26,.12); color: var(--red); }
    .ce-badge.exp { background: rgba(0,230,118,.12); color: var(--green); }
    .ce-badge.lock { background: var(--s3); color: var(--w45); }

    .ce-flag { font-size: 24px; }
    .ce-name { font-family: var(--font-display); font-weight: 700; font-size: var(--sz-base); text-transform: uppercase; }
    .ce-circuit { font-size: var(--sz-sm); color: var(--w45); }
    .ce-date { font-size: var(--sz-sm); color: var(--w45); }
    .ce-cta { margin-top: 8px; font-size: var(--sz-sm); font-weight: 700; color: var(--red); }
    .ce-aviso { margin-top: 8px; font-size: var(--sz-sm); color: var(--w20); font-style: italic; }

    .loading { text-align: center; padding: 40px; color: var(--w45); }

    @media (max-width: 768px) {
      .pal-wrap { padding: 24px 16px; }
      .grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PalpitesComponent implements OnInit {
  private api = inject(ApiService);

  etapas  = signal<Etapa[]>([]);
  loading = signal(true);

  disponiveis = computed(() =>
    this.etapas().filter(e => e.encerrada || e.prazoExpirado).length
  );

  ngOnInit() {
    this.api.getEtapas().subscribe({
      next:  e => { this.etapas.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
