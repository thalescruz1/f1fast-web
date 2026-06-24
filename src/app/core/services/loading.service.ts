// ============================================================
// SERVICE: LoadingService
// ============================================================
// Controla o overlay de carregamento global. O loadingInterceptor
// chama iniciar()/finalizar() em TODA requisição HTTP, e o
// LoadingComponent (montado no app.component) reage ao signal.
//
// Usa um contador de requisições ativas para suportar várias
// chamadas simultâneas: o overlay só some quando a última termina.
//
// Pequeno atraso anti-flicker (180ms): requisições muito rápidas
// não chegam a piscar o overlay na tela.
// ============================================================

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  /** Número de requisições HTTP em andamento */
  private ativos = 0;

  /** Timer do atraso anti-flicker (null quando inativo) */
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** true quando há requisições em andamento (após o atraso anti-flicker) */
  carregando = signal(false);

  /** Registra o início de uma requisição */
  iniciar() {
    this.ativos++;

    // Primeira requisição da fila: agenda a exibição do overlay
    if (this.ativos === 1 && this.timer === null) {
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.ativos > 0) this.carregando.set(true);
      }, 180);
    }
  }

  /** Registra o fim de uma requisição (sucesso ou erro) */
  finalizar() {
    if (this.ativos > 0) this.ativos--;

    // Última requisição terminou: esconde o overlay e cancela o timer pendente
    if (this.ativos === 0) {
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.carregando.set(false);
    }
  }
}
