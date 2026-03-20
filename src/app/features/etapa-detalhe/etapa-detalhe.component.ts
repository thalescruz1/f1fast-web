import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { Etapa } from '../../core/models';

@Component({
  selector: 'app-etapa-detalhe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="det-wrap">
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (!etapa()) {
        <div class="empty">Etapa não encontrada.</div>
      } @else {
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a routerLink="/calendario">Calendário</a>
          <span class="bc-sep">›</span>
          <span>{{ etapa()!.nome }}</span>
        </div>

        <!-- Hero -->
        <div class="det-hero">
          <div class="dh-flag">{{ etapa()!.pais }}</div>
          <div class="dh-info">
            <div class="dh-num">Etapa {{ etapa()!.numero }}</div>
            <h1 class="dh-name">{{ etapa()!.nome }}</h1>
            <div class="dh-circuit">{{ etapa()!.circuito }} · {{ etapa()!.cidade }}</div>
          </div>
          @if (etapa()!.sprint) {
            <div class="sprint-badge">Sprint</div>
          }
        </div>

        <div class="det-grid">
          <!-- Schedule -->
          <div class="det-card">
            <div class="dc-title">Programação</div>
            @if (etapa()!.treinoLivre1) {
              <div class="sch-row">
                <span class="sch-label">Treino Livre 1</span>
                <span class="sch-time">{{ etapa()!.treinoLivre1 | date:'dd/MM · HH:mm' }}</span>
              </div>
            }
            @if (etapa()!.treinoLivre2) {
              <div class="sch-row">
                <span class="sch-label">Treino Livre 2</span>
                <span class="sch-time">{{ etapa()!.treinoLivre2 | date:'dd/MM · HH:mm' }}</span>
              </div>
            }
            @if (etapa()!.treinoLivre3) {
              <div class="sch-row">
                <span class="sch-label">Treino Livre 3</span>
                <span class="sch-time">{{ etapa()!.treinoLivre3 | date:'dd/MM · HH:mm' }}</span>
              </div>
            }
            @if (etapa()!.classificacao) {
              <div class="sch-row">
                <span class="sch-label">Classificação</span>
                <span class="sch-time">{{ etapa()!.classificacao | date:'dd/MM · HH:mm' }}</span>
              </div>
            }
            <div class="sch-row highlight">
              <span class="sch-label">{{ etapa()!.sprint ? 'Sprint' : 'Corrida' }}</span>
              <span class="sch-time">{{ etapa()!.dataCorrida | date:'dd/MM · HH:mm' }}</span>
            </div>
            <div class="sch-row deadline">
              <span class="sch-label">Prazo Palpites</span>
              <span class="sch-time">{{ etapa()!.prazoQualify | date:'dd/MM · HH:mm' }}</span>
            </div>
          </div>

          <!-- Circuit -->
          <div class="det-card circuit-card">
            <div class="dc-title">Circuito</div>
            @if (circuitoSvg()) {
              <div class="circuit-svg" [innerHTML]="circuitoSvg()"></div>
            }
            <div class="circuit-data">
              <div class="cd-item">
                <span class="cd-label">Tipo</span>
                <span class="cd-value">{{ etapa()!.circuitoTipo }}</span>
              </div>
              <div class="cd-item">
                <span class="cd-label">Comprimento</span>
                <span class="cd-value">{{ etapa()!.circuitoComprimento }}</span>
              </div>
              <div class="cd-item">
                <span class="cd-label">Voltas</span>
                <span class="cd-value">{{ etapa()!.voltas }}</span>
              </div>
              <div class="cd-item">
                <span class="cd-label">Distância</span>
                <span class="cd-value">{{ etapa()!.distancia }}</span>
              </div>
            </div>
          </div>

          <!-- Record -->
          <div class="det-card record-card">
            <div class="dc-title">Recordista da Pista</div>
            <div class="rec-name">{{ etapa()!.recordista }}</div>
            <div class="rec-time">{{ etapa()!.tempoRecord }}</div>
            @if (etapa()!.anoRecord !== 2026) {
              <div class="rec-year">{{ etapa()!.anoRecord }}</div>
            } @else {
              <div class="rec-year">Novo circuito — sem recorde</div>
            }
          </div>
        </div>

        <div class="det-actions">
          @if (!etapa()!.encerrada && !etapa()!.prazoExpirado) {
            <a routerLink="/palpite" class="cta-main">Fazer Palpite</a>
          }
          @if (etapa()!.encerrada) {
            <a [routerLink]="['/palpites', etapa()!.id]" class="cta-sec">Ver Apostas</a>
          }
          <a routerLink="/calendario" class="cta-sec">Voltar ao Calendário</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .det-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 32px; }

    .breadcrumb {
      font-size: var(--sz-sm); color: var(--w45); margin-bottom: 24px;
      display: flex; align-items: center; gap: 8px;
    }
    .breadcrumb a { color: var(--red); text-decoration: none; font-weight: 600; }
    .breadcrumb a:hover { text-decoration: underline; }
    .bc-sep { color: var(--w20); }

    .det-hero {
      display: flex; align-items: center; gap: 20px;
      padding-bottom: 28px; margin-bottom: 32px; border-bottom: 1px solid var(--b1);
    }
    .dh-flag { font-size: 48px; }
    .dh-num {
      font-family: var(--font-orb); font-size: var(--sz-xs); font-weight: 700;
      color: var(--red); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;
    }
    .dh-name {
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: var(--sz-2xl); text-transform: uppercase; line-height: 1;
    }
    .dh-circuit { font-size: var(--sz-base); color: var(--w45); margin-top: 6px; }
    .sprint-badge {
      margin-left: auto; padding: 6px 16px;
      background: rgba(255,180,0,.12); color: var(--amber);
      font-size: var(--sz-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
    }

    .det-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px; margin-bottom: 32px; }

    .det-card {
      background: var(--s1); border: 1.5px solid var(--b1); padding: 24px;
    }
    .dc-title {
      font-family: var(--font-orb); font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px; color: var(--red);
      margin-bottom: 20px; border-left: 3px solid var(--red); padding-left: 10px;
    }

    /* Schedule */
    .sch-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0; border-bottom: 1px solid var(--b1);
    }
    .sch-row:last-child { border-bottom: none; }
    .sch-label { font-size: var(--sz-sm); color: var(--w45); }
    .sch-time { font-size: var(--sz-sm); font-weight: 600; }
    .sch-row.highlight { background: rgba(232,0,26,.04); margin: 0 -24px; padding: 10px 24px; }
    .sch-row.highlight .sch-label { color: var(--white); font-weight: 700; }
    .sch-row.highlight .sch-time { color: var(--red); font-weight: 700; }
    .sch-row.deadline .sch-time { color: var(--amber); }

    /* Circuit */
    .circuit-svg {
      width: 100%; margin-bottom: 20px;
      display: flex; align-items: center; justify-content: center;
      opacity: .3;
    }
    .circuit-svg ::ng-deep svg { width: 100%; height: auto; display: block; max-height: 200px; }
    .circuit-data { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cd-item { display: flex; flex-direction: column; gap: 4px; }
    .cd-label { font-size: var(--sz-xs); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--w45); }
    .cd-value { font-size: var(--sz-base); font-weight: 600; }

    /* Record */
    .rec-name {
      font-family: var(--font-display); font-weight: 700;
      font-size: var(--sz-xl); text-transform: uppercase; margin-bottom: 8px;
    }
    .rec-time {
      font-family: var(--font-orb); font-size: 36px; font-weight: 900;
      color: var(--red); font-variant-numeric: tabular-nums;
      text-decoration: underline; text-decoration-color: rgba(232,0,26,.2);
      text-underline-offset: 8px;
    }
    .rec-year { font-size: var(--sz-sm); color: var(--w45); margin-top: 8px; }

    .det-actions { display: flex; gap: 12px; flex-wrap: wrap; }

    .loading, .empty { text-align: center; padding: 60px 20px; color: var(--w45); }

    @media (max-width: 768px) {
      .det-wrap { padding: 24px 16px; }
      .det-grid { grid-template-columns: 1fr; }
      .det-hero { flex-wrap: wrap; }
    }
  `]
})
export class EtapaDetalheComponent implements OnInit {
  private api       = inject(ApiService);
  private route     = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  etapa      = signal<Etapa | null>(null);
  loading    = signal(true);
  circuitoSvg = signal<SafeHtml | null>(null);

  ngOnInit() {
    const etapaId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getEtapas().subscribe({
      next: etapas => {
        const e = etapas.find(x => x.id === etapaId) ?? null;
        this.etapa.set(e);
        if (e?.circuitoSvg) {
          let svg = e.circuitoSvg;
          // Add viewBox if missing so the SVG scales properly
          if (svg.includes('width="500"') && !svg.includes('viewBox')) {
            svg = svg.replace('<svg ', '<svg viewBox="0 0 500 500" ');
          }
          // Remove fixed width/height so it fills the container
          svg = svg.replace(/\s*width="\d+"/, '').replace(/\s*height="\d+"/, '');
          this.circuitoSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
