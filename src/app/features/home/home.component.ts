import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Etapa } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero strip -->
    <div class="hero-strip">
      <div>
        <div class="eyebrow">Temporada 2026</div>
        <div class="hero-title">CV2026</div>
        <div class="hero-sub">Campeonato Virtual F1Fast · 30 etapas · Até 35 pontos por corrida</div>
        <div class="hero-actions">
          <a routerLink="/palpite"   class="btn btn-red">Fazer Palpite</a>
          <a routerLink="/ranking"   class="btn btn-outline">Ver Ranking</a>
        </div>
      </div>

      @if (proxima()) {
        <div class="race-card">
          <div class="race-label">Próxima etapa</div>
          <div class="race-flag">{{ proxima()!.pais }}</div>
          <div class="race-name">{{ proxima()!.nome }}</div>
          <div class="race-circuit">{{ proxima()!.circuito }}</div>
          <div class="race-info">
            <div class="race-info-item">
              <span class="info-label">Corrida</span>
              <span class="info-val">{{ proxima()!.dataCorrida | date:'dd/MM · HH:mm' }}</span>
            </div>
            <div class="race-info-divider"></div>
            <div class="race-info-item">
              <span class="info-label">Prazo palpite</span>
              <span class="info-val deadline">{{ proxima()!.prazoQualify | date:'dd/MM · HH:mm' }}</span>
            </div>
          </div>
          <a routerLink="/palpite" class="btn btn-red" style="width:100%;text-align:center;margin-top:12px;">
            Fazer Palpite Agora
          </a>
        </div>
      }
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <div class="stat"><div class="stat-num">30</div><div class="stat-label">Etapas</div></div>
      <div class="stat"><div class="stat-num">35</div><div class="stat-label">Pts máx/corrida</div></div>
      <div class="stat"><div class="stat-num">22</div><div class="stat-label">Pilotos</div></div>
      <div class="stat"><div class="stat-num">6</div><div class="stat-label">Corridas Sprint</div></div>
    </div>
  `,
  styles: [`
    .hero-strip {
      background: #1A1A1A; border-bottom: 3px solid #E10600;
      padding: 48px 32px; display: flex; justify-content: space-between;
      align-items: center; gap: 32px; flex-wrap: wrap;
    }
    .eyebrow { font-size: 12px; color: #E10600; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    .hero-title { font-family: 'Orbitron', monospace; font-size: 48px; color: white; letter-spacing: 2px; line-height: 1; }
    .hero-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 10px; }
    .hero-actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn { padding: 10px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-block; }
    .btn-red { background: #E10600; color: white; }
    .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; }

    .race-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; min-width: 260px; }
    .race-label { font-size: 11px; color: #E10600; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
    .race-flag { font-size: 36px; margin-bottom: 8px; }
    .race-name { font-size: 18px; font-weight: 700; color: white; }
    .race-circuit { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
    .race-info { display: flex; gap: 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
    .race-info-item { flex: 1; padding: 10px 12px; }
    .race-info-divider { width: 1px; background: rgba(255,255,255,0.1); }
    .info-label { display: block; font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .info-val { font-size: 13px; font-weight: 600; color: white; }
    .info-val.deadline { color: #E10600; }

    .stats-bar { background: #F5F5F5; border-bottom: 1px solid #E0E0E0; display: flex; justify-content: center; gap: 64px; padding: 24px 32px; flex-wrap: wrap; }
    .stat { text-align: center; }
    .stat-num { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 700; color: #1A1A1A; }
    .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  proxima = signal<Etapa | null>(null);

  ngOnInit() {
    this.api.getProximaEtapa().subscribe({
      next:  e => this.proxima.set(e),
      error: () => {}
    });
  }
}
