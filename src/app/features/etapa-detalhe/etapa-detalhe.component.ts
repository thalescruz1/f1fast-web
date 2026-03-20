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
// Os dados de circuito agora vêm da API (editáveis no banco).
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Etapa } from '../../core/models';

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

          <!-- Pista -->
          <div class="card detalhe-card">
            <div class="card-title">🏁 Pista</div>
            <div class="info-row">
              <span class="info-label">Tipo</span>
              <span class="info-value">{{ etapa()!.circuitoTipo }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Comprimento</span>
              <span class="info-value">{{ etapa()!.circuitoComprimento }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Voltas</span>
              <span class="info-value">{{ etapa()!.voltas }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Distância total</span>
              <span class="info-value">{{ etapa()!.distancia }}</span>
            </div>
          </div>

          <!-- Recordista -->
          <div class="card detalhe-card">
            <div class="card-title">⚡ Recordista da Pista</div>
            <div class="record-name">{{ etapa()!.recordista }}</div>
            <div class="record-time">{{ etapa()!.tempoRecord }}</div>
            @if (etapa()!.anoRecord !== 2026) {
              <div class="record-year">{{ etapa()!.anoRecord }}</div>
            } @else {
              <div class="record-year">Novo circuito — sem recorde</div>
            }
          </div>

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

  etapa   = signal<Etapa | null>(null);
  loading = signal(true);

  ngOnInit() {
    const etapaId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getEtapas().subscribe({
      next: etapas => {
        this.etapa.set(etapas.find(x => x.id === etapaId) ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
