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

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (erro()) {
        <div class="card empty">{{ erro() }}</div>
      } @else {
        <div class="card">
          <table class="palpites-table">
            <thead>
              <tr>
                <th>Participante</th>
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
                  <td><div class="pname">{{ p.nome }}</div><div class="plogin">{{ p.login }}</div></td>
                  @for (pos of p.posicoes; track $index) {
                    <td class="piloto-cell">{{ pos }}</td>
                  }
                  <td class="pts">{{ p.pontosObtidos ?? '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
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
  `]
})
export class PalpitesCorridaComponent implements OnInit {
  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);

  palpites = signal<PalpitePublico[]>([]);
  loading  = signal(true);
  erro     = signal('');

  ngOnInit() {
    const etapaId = Number(this.route.snapshot.paramMap.get('etapaId'));
    this.api.getPalpitesPublicos(etapaId).subscribe({
      next:  p => { this.palpites.set(p); this.loading.set(false); },
      error: e => { this.erro.set(e.error || 'Erro ao carregar palpites.'); this.loading.set(false); }
    });
  }
}
