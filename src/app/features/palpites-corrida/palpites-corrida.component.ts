// ============================================================
// COMPONENTE: PalpitesCorridaComponent
// ============================================================
// Responsável pela página /palpites/:etapaId.
// Exibe todos os palpites enviados por todos os participantes
// para uma corrida específica — fica visível após o prazo.
//
// ":etapaId" é um parâmetro dinâmico na URL (rota parametrizada).
// Exemplo: /palpites/5 → exibe os palpites da etapa de id 5.
//
// A página é pública (sem authGuard) — qualquer visitante pode
// ver os palpites após o encerramento da etapa.
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PalpitePublico } from '../../core/models';

@Component({
  selector: 'app-palpites-corrida',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>Palpites da Corrida</h2>
        <p>Todos os palpites enviados para esta etapa.</p>
      </div>

      <!-- 3 estados: carregando / erro / tabela com palpites -->
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (erro()) {
        <div class="card empty">{{ erro() }}</div>
      } @else {
        <div class="card">
          <div class="table-wrapper">
          <table class="palpites-table">
            <thead>
              <tr>
                <th>Participante</th>
                <th>Pole</th>
                <!-- Colunas para cada posição da corrida -->
                <th>1°</th><th>2°</th><th>3°</th><th>4°</th><th>5°</th>
                <th>6°</th><th>7°</th><th>8°</th><th>9°</th><th>10°</th>
                <th>MV</th>   <!-- Melhor Volta -->
                <th>Pontos</th>
              </tr>
            </thead>
            <tbody>
              @for (p of palpites(); track p.login) {
                <tr>
                  <td><div class="pname">{{ p.nome }}</div><div class="plogin">{{ p.login }}</div></td>
                  <!-- p.posicoes é um array de strings (nomes dos pilotos).
                       $index = índice numérico do loop (0, 1, 2...) -->
                  @for (pos of p.posicoes; track $index) {
                    <td class="piloto-cell">{{ pos }}</td>
                  }
                  <!-- ?? '—' = operador nullish: exibe '—' se pontosObtidos
                       for null (corrida ainda não processada pelo admin) -->
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
    .palpites-table th { font-size: 10px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px; padding: 10px 8px; text-align: left; border-bottom: 1px solid #E0E0E0; white-space: nowrap; }
    .palpites-table td { padding: 10px 8px; border-bottom: 1px solid #E0E0E0; vertical-align: middle; }
    .palpites-table tbody tr:hover { background: #FAFAFA; }
    .pname { font-weight: 600; font-size: 13px; }
    .plogin { font-size: 11px; color: #6B6B6B; }
    .piloto-cell { font-size: 12px; color: #444; white-space: nowrap; }
    .pts { font-weight: 700; color: #E10600; }
    .loading, .empty { text-align: center; padding: 40px; color: #6B6B6B; }
    .table-wrapper {
  width: 100%;
  overflow-x: auto;
}
  `]
})
export class PalpitesCorridaComponent implements OnInit {
  private api   = inject(ApiService);
  // ActivatedRoute = serviço Angular que representa a rota atual.
  // Aqui usamos para ler o parâmetro :etapaId da URL.
  private route = inject(ActivatedRoute);

  palpites = signal<PalpitePublico[]>([]);
  loading  = signal(true);
  erro     = signal('');

  ngOnInit() {
    // paramMap.get('etapaId') = lê o parâmetro de rota :etapaId da URL.
    // Ex: se a URL for /palpites/7, retorna '7' (como string).
    // Number(...) = converte a string '7' para o número 7.
    const etapaId = Number(this.route.snapshot.paramMap.get('etapaId'));

    // Busca GET /palpites/{etapaId}/publicos
    this.api.getPalpitesPublicos(etapaId).subscribe({
      next:  p => { this.palpites.set(p); this.loading.set(false); },
      error: e => { this.erro.set(e.error || 'Erro ao carregar palpites.'); this.loading.set(false); }
    });
  }
}
