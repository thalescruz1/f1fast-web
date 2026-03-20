// ============================================================
// SERVICE: ToastService
// ============================================================
// Serviço centralizado para exibir notificações (toasts) ao
// usuário. Qualquer componente ou interceptor pode chamar
// toast.erro() ou toast.sucesso() para exibir uma mensagem.
//
// Os toasts são armazenados como signals e renderizados pelo
// ToastComponent (que fica no app.component.html).
// ============================================================

import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'erro' | 'sucesso' | 'aviso';
  mensagem: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;

  /** Lista reativa de toasts ativos */
  toasts = signal<Toast[]>([]);

  /** Exibe um toast de erro (vermelho) */
  erro(mensagem: string) {
    this.adicionar('erro', mensagem);
  }

  /** Exibe um toast de sucesso (verde) */
  sucesso(mensagem: string) {
    this.adicionar('sucesso', mensagem);
  }

  /** Exibe um toast de aviso (âmbar) */
  aviso(mensagem: string) {
    this.adicionar('aviso', mensagem);
  }

  /** Remove um toast pelo ID */
  remover(id: number) {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }

  private adicionar(tipo: Toast['tipo'], mensagem: string) {
    const id = this.nextId++;
    this.toasts.update(lista => [...lista, { id, tipo, mensagem }]);

    // Auto-remove após 5 segundos
    setTimeout(() => this.remover(id), 5000);
  }
}
