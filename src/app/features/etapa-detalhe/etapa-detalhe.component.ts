// ============================================================
// COMPONENTE: EtapaDetalheComponent
// ============================================================
// Responsável pela página /etapa/:id.
// Exibe os detalhes de uma etapa do calendário:
//   - Horários (prazo para palpites e largada)
//   - Localização (cidade + país)
//   - Recordista da pista (nome, tempo, ano)
//   - Distância do circuito e corrida
//   - Tipo de pista
//
// Os dados de circuito são estáticos (definidos neste arquivo)
// pois não mudam durante a temporada. Os horários vêm da API.
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Etapa } from '../../core/models';

/** Dados estáticos de um circuito F1 */
interface CircuitoInfo {
  tipo:        string;  // Tipo de pista (permanente, rua, etc.)
  comprimento: string;  // Comprimento em km (ex: "5.278 km")
  voltas:      number;  // Número de voltas da corrida
  distancia:   string;  // Distância total da corrida (ex: "306.1 km")
  recordista:  string;  // Nome do recordista
  tempoRecord: string;  // Tempo do recorde (ex: "1:19.813")
  anoRecord:   number;  // Ano do recorde
}

/** Mapa de dados estáticos por nome do circuito (campo Etapa.circuito) */
const CIRCUITOS: Record<string, CircuitoInfo> = {
  'Albert Park': {
    tipo: 'Circuito semi-permanente', comprimento: '5.278 km', voltas: 58, distancia: '306.1 km',
    recordista: 'Charles Leclerc', tempoRecord: '1:19.813', anoRecord: 2022
  },
  'Changai': {
    tipo: 'Circuito permanente', comprimento: '5.451 km', voltas: 56, distancia: '305.1 km',
    recordista: 'Michael Schumacher', tempoRecord: '1:32.238', anoRecord: 2004
  },
  'Suzuka': {
    tipo: 'Circuito permanente', comprimento: '5.807 km', voltas: 53, distancia: '307.5 km',
    recordista: 'Lewis Hamilton', tempoRecord: '1:30.983', anoRecord: 2019
  },
  'Sakhir': {
    tipo: 'Circuito permanente (iluminado)', comprimento: '5.412 km', voltas: 57, distancia: '308.2 km',
    recordista: 'Pedro de la Rosa', tempoRecord: '1:30.252', anoRecord: 2005
  },
  'Jeddah': {
    tipo: 'Circuito de rua', comprimento: '6.174 km', voltas: 50, distancia: '308.5 km',
    recordista: 'Sergio Perez', tempoRecord: '1:30.734', anoRecord: 2023
  },
  'Miami': {
    tipo: 'Circuito semi-permanente', comprimento: '5.412 km', voltas: 57, distancia: '308.3 km',
    recordista: 'Max Verstappen', tempoRecord: '1:27.274', anoRecord: 2023
  },
  'Montreal': {
    tipo: 'Circuito semi-permanente', comprimento: '4.361 km', voltas: 70, distancia: '305.3 km',
    recordista: 'Valtteri Bottas', tempoRecord: '1:13.078', anoRecord: 2019
  },
  'Monte Carlo': {
    tipo: 'Circuito de rua', comprimento: '3.337 km', voltas: 78, distancia: '260.3 km',
    recordista: 'Charles Leclerc', tempoRecord: '1:12.909', anoRecord: 2021
  },
  'Catalunia': {
    tipo: 'Circuito permanente', comprimento: '4.657 km', voltas: 66, distancia: '307.3 km',
    recordista: 'Max Verstappen', tempoRecord: '1:16.330', anoRecord: 2023
  },
  'Red Bull Ring': {
    tipo: 'Circuito permanente', comprimento: '4.318 km', voltas: 71, distancia: '306.5 km',
    recordista: 'Carlos Sainz', tempoRecord: '1:05.619', anoRecord: 2020
  },
  'Silverstone': {
    tipo: 'Circuito permanente', comprimento: '5.891 km', voltas: 52, distancia: '306.2 km',
    recordista: 'Lewis Hamilton', tempoRecord: '1:24.303', anoRecord: 2020
  },
  'Spa-Francorchamps': {
    tipo: 'Circuito permanente', comprimento: '7.004 km', voltas: 44, distancia: '308.1 km',
    recordista: 'Valtteri Bottas', tempoRecord: '1:46.286', anoRecord: 2018
  },
  'Hungaroring': {
    tipo: 'Circuito permanente', comprimento: '4.381 km', voltas: 70, distancia: '306.6 km',
    recordista: 'Lewis Hamilton', tempoRecord: '1:16.627', anoRecord: 2020
  },
  'Zandvoort': {
    tipo: 'Circuito permanente', comprimento: '4.259 km', voltas: 72, distancia: '306.6 km',
    recordista: 'Max Verstappen', tempoRecord: '1:11.097', anoRecord: 2021
  },
  'Monza': {
    tipo: 'Circuito permanente (alta velocidade)', comprimento: '5.793 km', voltas: 53, distancia: '306.7 km',
    recordista: 'Rubens Barrichello', tempoRecord: '1:21.046', anoRecord: 2004
  },
  'Madri': {
    tipo: 'Circuito semi-permanente', comprimento: '5.474 km', voltas: 56, distancia: '306.5 km',
    recordista: '—', tempoRecord: '—', anoRecord: 2026
  },
  'Baku': {
    tipo: 'Circuito de rua', comprimento: '6.003 km', voltas: 51, distancia: '306.0 km',
    recordista: 'Charles Leclerc', tempoRecord: '1:43.009', anoRecord: 2019
  },
  'Marina Bay': {
    tipo: 'Circuito de rua (noturno)', comprimento: '4.940 km', voltas: 62, distancia: '306.1 km',
    recordista: 'Lewis Hamilton', tempoRecord: '1:35.867', anoRecord: 2023
  },
  'Austin': {
    tipo: 'Circuito permanente', comprimento: '5.513 km', voltas: 56, distancia: '308.4 km',
    recordista: 'Charles Leclerc', tempoRecord: '1:36.169', anoRecord: 2023
  },
  'Cidade do México': {
    tipo: 'Circuito permanente (alta altitude)', comprimento: '4.304 km', voltas: 71, distancia: '305.4 km',
    recordista: 'Valtteri Bottas', tempoRecord: '1:17.774', anoRecord: 2021
  },
  'Interlagos': {
    tipo: 'Circuito permanente', comprimento: '4.309 km', voltas: 71, distancia: '305.9 km',
    recordista: 'Valtteri Bottas', tempoRecord: '1:10.540', anoRecord: 2018
  },
  'Las Vegas': {
    tipo: 'Circuito de rua (noturno)', comprimento: '6.201 km', voltas: 50, distancia: '310.0 km',
    recordista: 'Max Verstappen', tempoRecord: '1:35.490', anoRecord: 2023
  },
  'Lusail': {
    tipo: 'Circuito permanente (noturno)', comprimento: '5.380 km', voltas: 57, distancia: '306.6 km',
    recordista: 'Charles Leclerc', tempoRecord: '1:24.319', anoRecord: 2023
  },
  'Yas Marina': {
    tipo: 'Circuito permanente', comprimento: '5.281 km', voltas: 58, distancia: '306.2 km',
    recordista: 'Max Verstappen', tempoRecord: '1:26.103', anoRecord: 2021
  }
};

@Component({
  selector: 'app-etapa-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (!etapa()) {
        <div class="card empty">Etapa não encontrada.</div>
      } @else {
        <div class="section-head">
          <h2>{{ etapa()!.pais }} {{ etapa()!.nome }}</h2>
          <p>{{ etapa()!.circuito }} · {{ etapa()!.cidade }}</p>
        </div>

        <div class="detalhe-grid">

          <!-- Horários -->
          <div class="card detalhe-card">
            <div class="card-title">🕒 Horários</div>
            <div class="info-row">
              <span class="info-label">Prazo para palpites</span>
              <span class="info-value">{{ etapa()!.prazoQualify | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Largada</span>
              <span class="info-value">{{ etapa()!.dataCorrida | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            @if (etapa()!.sprint) {
              <div class="sprint-badge">Corrida Sprint</div>
            }
          </div>

          <!-- Localização -->
          <div class="card detalhe-card">
            <div class="card-title">📍 Localização</div>
            <div class="info-row">
              <span class="info-label">Circuito</span>
              <span class="info-value">{{ etapa()!.circuito }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cidade</span>
              <span class="info-value">{{ etapa()!.cidade }}</span>
            </div>
            <div class="flag-big">{{ etapa()!.pais }}</div>
          </div>

          @if (circuito()) {
            <!-- Pista -->
            <div class="card detalhe-card">
              <div class="card-title">🏁 Pista</div>
              <div class="info-row">
                <span class="info-label">Tipo</span>
                <span class="info-value">{{ circuito()!.tipo }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Comprimento</span>
                <span class="info-value">{{ circuito()!.comprimento }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Voltas</span>
                <span class="info-value">{{ circuito()!.voltas }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Distância total</span>
                <span class="info-value">{{ circuito()!.distancia }}</span>
              </div>
            </div>

            <!-- Recordista -->
            <div class="card detalhe-card">
              <div class="card-title">⚡ Recordista da Pista</div>
              <div class="record-name">{{ circuito()!.recordista }}</div>
              <div class="record-time">{{ circuito()!.tempoRecord }}</div>
              @if (circuito()!.anoRecord !== 2026) {
                <div class="record-year">{{ circuito()!.anoRecord }}</div>
              } @else {
                <div class="record-year">Novo circuito — sem recorde</div>
              }
            </div>
          }

        </div>

        <div class="back-link">
          <a routerLink="/calendario" class="btn-back">← Voltar ao Calendário</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .detalhe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .detalhe-card { padding: 20px; }
    .card-title { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #E10600; margin-bottom: 14px; border-left: 3px solid #E10600; padding-left: 10px; }
    .info-row { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; border-bottom: 1px solid #F0F0F0; font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6B6B6B; }
    .info-value { font-weight: 600; text-align: right; max-width: 60%; }
    .flag-big { font-size: 36px; text-align: center; margin-top: 16px; }
    .sprint-badge { margin-top: 12px; display: inline-block; background: rgba(229,168,0,0.12); color: #996F00; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
    .record-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .record-time { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 700; color: #E10600; font-variant-numeric: tabular-nums; text-decoration: underline; text-decoration-color: rgba(225,6,0,0.2); text-underline-offset: 6px; }
    .record-year { font-size: 12px; color: #6B6B6B; margin-top: 4px; }
    .back-link { margin-top: 24px; }
    .btn-back { font-size: 13px; color: #0057E1; text-decoration: none; font-weight: 600; }
    .btn-back:hover { text-decoration: underline; }
    .loading, .empty { text-align: center; padding: 40px; color: #6B6B6B; }
  `]
})
export class EtapaDetalheComponent implements OnInit {
  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);

  etapa    = signal<Etapa | null>(null);
  circuito = signal<CircuitoInfo | null>(null);
  loading  = signal(true);

  ngOnInit() {
    const etapaId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getEtapas().subscribe({
      next: etapas => {
        const e = etapas.find(x => x.id === etapaId) ?? null;
        this.etapa.set(e);
        if (e) {
          // Busca dados estáticos do circuito pelo nome
          this.circuito.set(CIRCUITOS[e.circuito] ?? null);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
