// ============================================================
// COMPONENTE: PalpitesCorridaComponent
// ============================================================
// Responsável pela página /palpites/:etapaId.
// Exibe todos os palpites enviados por todos os participantes
// para uma corrida específica — fica visível após o prazo.
//
// Modificações:
//   - Exibe login apenas (sem nome completo)
//   - Coluna de login fixa durante scroll horizontal
//   - Resultado oficial exibido em seção separada acima da tabela
//   - Nome da etapa e circuito no cabeçalho
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PalpitePublico, ResultadoPublico, Etapa } from '../../core/models';

@Component({
  selector: 'app-palpites-corrida',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>
          @if (etapa()) {
            {{ etapa()!.pais }} {{ etapa()!.nome }}
          } @else {
            Palpites da Corrida
          }
        </h2>
        @if (etapa()) {
          <p>{{ etapa()!.circuito }} · {{ etapa()!.cidade }}</p>
        } @else {
          <p>Todos os palpites enviados para esta etapa.</p>
        }
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (erro()) {
        <div class="card empty">{{ erro() }}</div>
      } @else {

        <!-- Resultado oficial em seção separada -->
        @if (resultado()) {
          <div class="card resultado-card">
            <div class="resultado-title">Resultado Oficial</div>
            <div class="resultado-grid">
              <div class="res-item pole">
                <span class="res-label">Pole</span>
                <span class="res-value">{{ resultado()!.posicoes[0] }}</span>
              </div>
              @for (i of posIndices; track i) {
                <div class="res-item">
                  <span class="res-label">{{ i + 1 }}°</span>
                  <span class="res-value">{{ resultado()!.posicoes[i + 1] }}</span>
                </div>
              }
              <div class="res-item mv">
                <span class="res-label">Mel. Volta</span>
                <span class="res-value">{{ resultado()!.posicoes[11] }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Tabela de palpites -->
        <div class="card">
          <div class="table-wrapper">
            <table class="palpites-table">
              <thead>
                <tr>
                  <!-- Coluna fixa com o login -->
                  <th class="col-fixed">Participante</th>
                  <th>Pole</th>
                  <th>1°</th><th>2°</th><th>3°</th><th>4°</th><th>5°</th>
                  <th>6°</th><th>7°</th><th>8°</th><th>9°</th><th>10°</th>
                  <th>MV</th>
                  <th>Pontos</th>
                </tr>
              </thead>
              <tbody>
                @for (p of palpites(); track p.login) {
                  <tr>
                    <!-- Célula fixa com apenas o login -->
                    <td class="col-fixed login-cell">{{ p.login }}</td>
                    @for (pos of p.posicoes; track $index) {
                      <td class="piloto-cell">{{ pos }}</td>
                    }
                    <td class="pts">{{ p.pontosObtidos ?? '—' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .palpites-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .palpites-table th { font-size: 10px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px; padding: 10px 8px; text-align: left; border-bottom: 1px solid #E0E0E0; white-space: nowrap; background: white; }
    .palpites-table td { padding: 10px 8px; border-bottom: 1px solid #E0E0E0; vertical-align: middle; }
    .palpites-table tbody tr:hover { background: #FAFAFA; }
    /* Coluna fixa: sticky para manter visível durante scroll horizontal */
    .col-fixed { position: sticky; left: 0; background: white; z-index: 2; box-shadow: 2px 0 4px rgba(0,0,0,0.06); }
    .palpites-table tbody tr:hover .col-fixed { background: #FAFAFA; }
    .login-cell { font-weight: 600; font-size: 13px; white-space: nowrap; }
    .piloto-cell { font-size: 12px; color: #444; white-space: nowrap; }
    .pts { font-weight: 700; color: #0057E1; }
    .loading, .empty { text-align: center; padding: 40px; color: #6B6B6B; }
    .table-wrapper { width: 100%; overflow-x: auto; }
    /* Resultado oficial */
    .resultado-card { margin-bottom: 16px; padding: 16px 20px; }
    .resultado-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6B6B6B; margin-bottom: 12px; }
    .resultado-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .res-item { display: flex; flex-direction: column; align-items: center; background: #F5F5F5; border-radius: 6px; padding: 8px 10px; min-width: 90px; }
    .res-item.pole { border-top: 2px solid #E5A800; }
    .res-item.mv   { border-top: 2px solid #16A34A; }
    .res-label { font-size: 10px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; margin-bottom: 4px; }
    .res-value { font-size: 12px; font-weight: 600; text-align: center; }
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

  // Índices 0–9 para gerar as 10 posições no template
  posIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  ngOnInit() {
    const etapaId = Number(this.route.snapshot.paramMap.get('etapaId'));

    // Carrega palpites — controla o loading principal
    this.api.getPalpitesPublicos(etapaId).subscribe({
      next:  p => { this.palpites.set(p); this.loading.set(false); },
      error: e => { this.erro.set(e.error || 'Erro ao carregar palpites.'); this.loading.set(false); }
    });

    // Carrega resultado oficial em paralelo (silencia erro se ainda não cadastrado)
    this.api.getResultadoPublico(etapaId).subscribe({
      next:  r => this.resultado.set(r),
      error: () => {}
    });

    // Carrega dados da etapa para exibir nome e circuito no cabeçalho
    this.api.getEtapas().subscribe({
      next: etapas => this.etapa.set(etapas.find(x => x.id === etapaId) ?? null),
      error: () => {}
    });
  }
}
