// ============================================================
// COMPONENTE: HomeComponent
// ============================================================
// Responsável pela página inicial (/) do campeonato.
// Exibe o banner principal (hero strip) com o cartão da
// próxima corrida e a barra de estatísticas do campeonato.
//
// É uma página pública — não tem authGuard, qualquer visitante
// pode acessar sem estar logado.
// ============================================================

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
    <!-- Hero strip: banner escuro com título e cartão da próxima corrida -->
    <div class="hero-strip">
      <div>
        <div class="eyebrow">Temporada 2026</div>
        <div class="hero-title">CV2026</div>
        <div class="hero-sub">Campeonato Virtual F1Fast · 30 etapas · Até 35 pontos por corrida</div>
        <div class="hero-actions">
          <!-- routerLink = navegação interna sem recarregar a página (SPA) -->
          <a routerLink="/palpite"   class="btn btn-red">Fazer Palpite</a>
          <a routerLink="/ranking"   class="btn btn-outline">Ver Ranking</a>
        </div>
      </div>

      <!-- Cartão da próxima etapa — só aparece se houver uma etapa carregada -->
      @if (proxima()) {
        <div class="race-card">
          <div class="race-label">Próxima etapa</div>
          <!-- proxima()! = o "!" garante ao TypeScript que o valor não é null
               (já verificamos isso com o @if acima) -->
          <div class="race-flag">{{ proxima()!.pais }}</div>
          <div class="race-name">{{ proxima()!.nome }}</div>
          <div class="race-circuit">{{ proxima()!.circuito }}</div>
          <div class="race-info">
            <div class="race-info-item">
              <span class="info-label">Corrida</span>
              <!-- | date:'dd/MM · HH:mm' = pipe de formatação de data do Angular -->
              <span class="info-val">{{ proxima()!.dataCorrida | date:'dd/MM · HH:mm' }}</span>
            </div>
            <div class="race-info-divider"></div>
            <div class="race-info-item">
              <span class="info-label">Prazo palpite</span>
              <!-- Prazo em vermelho — classe "deadline" aplicada via CSS -->
              <span class="info-val deadline">{{ proxima()!.prazoQualify | date:'dd/MM · HH:mm' }}</span>
            </div>
          </div>
          <a routerLink="/palpite" class="btn btn-red" style="width:100%;text-align:center;margin-top:12px;">
            Fazer Palpite Agora
          </a>
        </div>
      }
    </div>

    <!-- Barra de estatísticas: valores fixos do campeonato -->
    <div class="stats-bar">
      <div class="stat"><div class="stat-num">30</div><div class="stat-label">Etapas</div></div>
      <div class="stat"><div class="stat-num">35</div><div class="stat-label">Pts máx/corrida</div></div>
      <div class="stat"><div class="stat-num">22</div><div class="stat-label">Pilotos</div></div>
      <div class="stat"><div class="stat-num">6</div><div class="stat-label">Corridas Sprint</div></div>
    </div>
  `,
  styles: [`
    .hero-strip {
      background: #1A1A1A; border-bottom: 3px solid #0057E1;
      padding: 48px 32px; display: flex; justify-content: space-between;
      align-items: center; gap: 32px; flex-wrap: wrap;
    }
    .eyebrow { font-size: 12px; color: #0057E1; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    .hero-title { font-family: 'Orbitron', monospace; font-size: 48px; color: white; letter-spacing: 2px; line-height: 1; }
    .hero-sub { font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 10px; }
    .hero-actions { display: flex; gap: 12px; margin-top: 24px; }
    .btn { padding: 10px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; text-decoration: none; display: inline-block; }
    .btn-red { background: #0057E1; color: white; }
    .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: white; }

    .race-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; min-width: 260px; }
    .race-label { font-size: 11px; color: #0057E1; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
    .race-flag { font-size: 36px; margin-bottom: 8px; }
    .race-name { font-size: 18px; font-weight: 700; color: white; }
    .race-circuit { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
    .race-info { display: flex; gap: 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
    .race-info-item { flex: 1; padding: 10px 12px; }
    .race-info-divider { width: 1px; background: rgba(255,255,255,0.1); }
    .info-label { display: block; font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .info-val { font-size: 13px; font-weight: 600; color: white; }
    .info-val.deadline { color: #0057E1; }

    .stats-bar { background: #F5F5F5; border-bottom: 1px solid #E0E0E0; display: flex; justify-content: center; gap: 64px; padding: 24px 32px; flex-wrap: wrap; }
    .stat { text-align: center; }
    .stat-num { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 700; color: #1A1A1A; }
    .stat-label { font-size: 12px; color: #6B6B6B; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);

  // signal<Etapa | null>(null) = signal que começa sem valor (null).
  // "Etapa | null" é um tipo union: pode ser uma Etapa ou null.
  // Quando a API retornar a próxima etapa, este signal é atualizado
  // e o @if(proxima()) no template exibirá automaticamente o cartão.
  proxima = signal<Etapa | null>(null);

  ngOnInit() {
    // Busca a próxima etapa disponível para palpite
    this.api.getProximaEtapa().subscribe({
      next:  e => this.proxima.set(e),
      // error: () => {} = callback vazio — se não houver etapa, simplesmente
      // não mostramos o cartão (proxima() continua null, @if não renderiza)
      error: () => {}
    });
  }
}
