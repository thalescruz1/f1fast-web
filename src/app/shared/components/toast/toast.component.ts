// ============================================================
// COMPONENT: ToastComponent
// ============================================================
// Renderiza os toasts (notificações) na tela. Fica fixo no
// canto superior direito e empilha múltiplos toasts.
//
// Deve ser incluído uma única vez no app.component.html:
//   <app-toast />
// ============================================================

import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast-' + toast.tipo" (click)="toastService.remover(toast.id)">
          <span class="toast-icon">
            @switch (toast.tipo) {
              @case ('erro')    { ✕ }
              @case ('sucesso') { ✓ }
              @case ('aviso')   { ! }
            }
          </span>
          <span class="toast-msg">{{ toast.mensagem }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 420px;
      width: calc(100% - 40px);
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 8px;
      background: var(--s2, #1a1a1f);
      border: 1px solid var(--w20, rgba(255,255,255,.12));
      color: var(--w90, #e5e5e5);
      font-family: var(--body, 'Barlow', sans-serif);
      font-size: .875rem;
      line-height: 1.4;
      cursor: pointer;
      animation: toast-in .3s ease;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 24px rgba(0,0,0,.5);
    }

    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: .75rem;
    }

    .toast-erro {
      border-color: var(--red, #E8001A);
    }
    .toast-erro .toast-icon {
      background: var(--red, #E8001A);
      color: #fff;
    }

    .toast-sucesso {
      border-color: var(--green, #00C853);
    }
    .toast-sucesso .toast-icon {
      background: var(--green, #00C853);
      color: #fff;
    }

    .toast-aviso {
      border-color: var(--amber, #FFB300);
    }
    .toast-aviso .toast-icon {
      background: var(--amber, #FFB300);
      color: #000;
    }

    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateX(40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 600px) {
      .toast-container {
        top: auto;
        bottom: 20px;
        right: 12px;
        left: 12px;
        max-width: none;
        width: auto;
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
