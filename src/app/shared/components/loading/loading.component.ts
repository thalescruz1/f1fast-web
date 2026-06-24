// ============================================================
// COMPONENT: LoadingComponent
// ============================================================
// Overlay de carregamento global. Fica fixo cobrindo a tela
// enquanto houver requisições HTTP em andamento (controlado
// pelo LoadingService via loadingInterceptor).
//
// Deve ser incluído uma única vez no app.component:
//   <app-loading />
// ============================================================

import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    @if (loading.carregando()) {
      <div class="loading-overlay" role="status" aria-live="polite" aria-label="Carregando">
        <div class="loading-box">
          <div class="spinner"></div>
          <span class="loading-text">Carregando…</span>
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      z-index: 9998; /* abaixo do toast (9999), acima de todo o resto */
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(8, 8, 10, .55);
      backdrop-filter: blur(3px);
      animation: overlay-in .15s ease;
    }

    .loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 4px solid var(--b2, rgba(255,255,255,.15));
      border-top-color: var(--red, #e10600);
      animation: spin .7s linear infinite;
    }

    .loading-text {
      font-family: var(--font-orb, 'Orbitron', sans-serif);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: var(--w70, rgba(255,255,255,.7));
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes overlay-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner { animation-duration: 1.5s; }
      .loading-overlay { animation: none; }
    }
  `]
})
export class LoadingComponent {
  loading = inject(LoadingService);
}
