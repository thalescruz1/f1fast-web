import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Etapa } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="hero">
      <div class="hero-bg"></div>
      <div class="hero-stripes"></div>
      <div class="hero-ghost">F1FAST</div>

      <div class="hero-body">
        <div class="hero-left">
          <div class="live-pill">
            <span class="ldot"></span>
            <span class="live-txt">Temporada 2026 · Ativa</span>
          </div>

          <h1 class="hero-title">
            <span class="hero-cv">CV</span>
            <span class="hero-yr">2026</span>
          </h1>

          <div class="hero-rule"></div>

          <p class="hero-desc">
            Campeonato Virtual de Fórmula 1 — <strong>30 etapas</strong>,
            até <strong>35 pontos</strong> por corrida. Faça seus palpites e
            dispute o título!
          </p>

          <div class="hero-ctas">
            <a routerLink="/palpite" class="cta-main">Fazer Palpite</a>
            <a routerLink="/ranking" class="cta-sec">Ver Ranking</a>
          </div>
        </div>

        @if (proxima()) {
          <div class="race-card rc-hud">
            <div class="rc-head">
              <div class="rc-head-lbl">
                <span class="ldot"></span> Próxima Etapa
              </div>
              <div class="rc-head-num">R{{ proxima()!.numero }}</div>
            </div>
            <div class="rc-body">
              <div class="rc-flag">{{ proxima()!.pais }}</div>
              <div class="rc-name">{{ proxima()!.nome }}</div>
              <div class="rc-circuit">{{ proxima()!.circuito }} · {{ proxima()!.cidade }}</div>

              <div class="data-row">
                <div class="dr-cell">
                  <div class="dr-lbl">Corrida</div>
                  <div class="dr-val">{{ proxima()!.dataCorrida | date:'dd/MM · HH:mm' }}</div>
                </div>
                <div class="dr-cell">
                  <div class="dr-lbl">Prazo</div>
                  <div class="dr-val warn">{{ proxima()!.prazoQualify | date:'dd/MM · HH:mm' }}</div>
                </div>
              </div>

              <div class="cd-lbl">Tempo restante</div>
              <div class="countdown">
                <div class="cd-unit">
                  <span class="cd-num">{{ dias() }}</span>
                  <span class="cd-seg">Dias</span>
                </div>
                <div class="cd-unit">
                  <span class="cd-num">{{ horas() }}</span>
                  <span class="cd-seg">Hrs</span>
                </div>
                <div class="cd-unit">
                  <span class="cd-num">{{ minutos() }}</span>
                  <span class="cd-seg">Min</span>
                </div>
                <div class="cd-unit">
                  <span class="cd-num">{{ segundos() }}</span>
                  <span class="cd-seg">Seg</span>
                </div>
              </div>

              <a routerLink="/palpite" class="rc-cta">Fazer Palpite Agora →</a>
            </div>
          </div>
        }
      </div>

      <div class="stats">
        <div class="stat-cell">
          <div class="stat-num">30</div>
          <div class="stat-lbl">Etapas</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">35</div>
          <div class="stat-lbl">Pts máx/corrida</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">22</div>
          <div class="stat-lbl">Pilotos</div>
        </div>
        <div class="stat-cell">
          <div class="stat-num">6</div>
          <div class="stat-lbl">Corridas Sprint</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero {
      position: relative; overflow: hidden;
      min-height: calc(100vh - 64px);
      display: flex; flex-direction: column;
    }
    .hero-bg {
      position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(ellipse 65% 90% at 15% 50%, rgba(232,0,26,.09) 0%, transparent 65%),
                  radial-gradient(ellipse 45% 55% at 80% 25%, rgba(255,255,255,.03) 0%, transparent 55%);
    }
    .hero-stripes {
      position: absolute; inset: 0; pointer-events: none;
      background-image: repeating-linear-gradient(
        -12deg, transparent, transparent 72px,
        rgba(255,255,255,.012) 72px, rgba(255,255,255,.012) 73px
      );
    }
    .hero-ghost {
      position: absolute; right: -40px; top: 50%; transform: translateY(-52%);
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: clamp(220px, 38vw, 500px); text-transform: uppercase;
      color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.04);
      pointer-events: none; user-select: none; line-height: .85; z-index: 0;
    }

    .hero-body {
      flex: 1; display: flex; align-items: center;
      padding: 48px 40px; gap: 32px;
      position: relative; z-index: 2;
      max-width: 1200px; margin: 0 auto; width: 100%;
    }
    .hero-left { flex: 1; max-width: 580px; }

    .live-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; background: var(--s2); border: 1.5px solid var(--b2);
      margin-bottom: 24px;
    }
    .live-txt { font-size: var(--sz-sm); font-weight: 600; color: var(--w70); letter-spacing: .5px; }

    .hero-title {
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: var(--sz-hero); text-transform: uppercase;
      line-height: .85; letter-spacing: -2px;
    }
    .hero-cv { color: var(--white); display: block; }
    .hero-yr { color: var(--red); text-shadow: 0 0 60px var(--red-glow); display: block; }

    .hero-rule { width: 48px; height: 3px; background: var(--red); margin: 24px 0; }

    .hero-desc {
      font-size: var(--sz-md); font-weight: 500; color: var(--w70);
      line-height: 1.7; margin-bottom: 36px;
    }
    .hero-desc strong { color: var(--white); }

    .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }

    /* Race Card */
    .race-card {
      flex-shrink: 0; width: 320px; position: relative;
      background: rgba(10,10,14,.94); backdrop-filter: blur(20px);
      border: 1.5px solid var(--b2);
    }
    .rc-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 18px; background: var(--s2); border-bottom: 1px solid var(--b1);
    }
    .rc-head-lbl {
      display: flex; align-items: center; gap: 8px;
      font-size: var(--sz-xs); font-weight: 700; color: var(--red);
      text-transform: uppercase; letter-spacing: 2px;
    }
    .rc-head-num { font-size: var(--sz-xs); font-weight: 600; color: var(--w45); }
    .rc-body { padding: 20px 18px; }
    .rc-flag { font-size: 28px; margin-bottom: 8px; }
    .rc-name {
      font-family: var(--font-display); font-weight: 700;
      font-size: var(--sz-xl); text-transform: uppercase; line-height: 1;
    }
    .rc-circuit { font-size: var(--sz-sm); font-weight: 500; color: var(--w45); margin: 4px 0 20px; }

    .data-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
      background: var(--b1); margin-bottom: 20px;
    }
    .dr-cell { background: var(--s2); padding: 12px 14px; }
    .dr-lbl {
      font-size: var(--sz-xs); font-weight: 700; color: var(--w45);
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;
    }
    .dr-val { font-size: var(--sz-base); font-weight: 600; }
    .dr-val.warn { color: var(--amber); }

    .cd-lbl {
      font-size: var(--sz-xs); font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: var(--w45); margin-bottom: 10px;
    }
    .countdown {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; margin-bottom: 18px;
    }
    .cd-unit {
      background: var(--s3); border: 1.5px solid var(--b1);
      padding: 10px 4px; text-align: center;
    }
    .cd-num {
      font-family: var(--font-orb); font-size: 22px; font-weight: 700;
      display: block; line-height: 1;
    }
    .cd-seg {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 1px; color: var(--w45); display: block; margin-top: 4px;
    }

    .rc-cta {
      display: block; width: 100%; padding: 14px;
      font-family: var(--font-body); font-size: var(--sz-base); font-weight: 700;
      background: var(--red); border: 2px solid var(--red); color: #fff;
      cursor: pointer; text-align: center; text-decoration: none; letter-spacing: .5px;
      transition: all .2s;
    }
    .rc-cta:hover { background: transparent; color: var(--red); }

    /* Stats bar */
    .stats {
      display: grid; grid-template-columns: repeat(4, 1fr);
      border-top: 1px solid var(--b1); position: relative; z-index: 2;
    }
    .stat-cell {
      padding: 30px 32px; border-right: 1px solid var(--b1);
      cursor: default; position: relative; overflow: hidden;
      transition: background .2s;
    }
    .stat-cell:last-child { border-right: none; }
    .stat-cell:hover { background: var(--s1); }
    .stat-cell::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--red), transparent);
      transform: scaleX(0); transform-origin: left; transition: transform .35s;
    }
    .stat-cell:hover::before { transform: scaleX(1); }
    .stat-num {
      font-family: var(--font-orb); font-size: clamp(36px, 5vw, 56px); font-weight: 900;
      line-height: 1; margin-bottom: 8px; color: var(--white);
    }
    .stat-lbl {
      font-size: var(--sz-sm); font-weight: 600; color: var(--w45);
      text-transform: uppercase; letter-spacing: 1px;
    }

    @media (max-width: 768px) {
      .hero-body { flex-direction: column; padding: 32px 20px; }
      .hero-left { max-width: 100%; }
      .race-card { width: 100%; }
      .stats { grid-template-columns: repeat(2, 1fr); }
      .stat-cell { padding: 20px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private timerId: ReturnType<typeof setInterval> | null = null;

  proxima = signal<Etapa | null>(null);
  dias     = signal('00');
  horas    = signal('00');
  minutos  = signal('00');
  segundos = signal('00');

  ngOnInit() {
    this.api.getProximaEtapa().subscribe({
      next: e => {
        this.proxima.set(e);
        this.iniciarCountdown(e.prazoQualify);
      },
      error: () => {}
    });
  }

  ngOnDestroy() {
    if (this.timerId) clearInterval(this.timerId);
  }

  private iniciarCountdown(prazo: string) {
    const atualizar = () => {
      const diff = new Date(prazo).getTime() - Date.now();
      if (diff <= 0) {
        this.dias.set('00'); this.horas.set('00');
        this.minutos.set('00'); this.segundos.set('00');
        if (this.timerId) clearInterval(this.timerId);
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      this.dias.set(String(d).padStart(2, '0'));
      this.horas.set(String(h).padStart(2, '0'));
      this.minutos.set(String(m).padStart(2, '0'));
      this.segundos.set(String(s).padStart(2, '0'));
    };
    atualizar();
    this.timerId = setInterval(atualizar, 1000);
  }
}
