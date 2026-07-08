// ============================================================
// SERVICE: PushService
// ============================================================
// Gerencia a inscrição de Web Push do dispositivo:
//   - ativar():   pede permissão, inscreve no PushManager e envia
//                 a inscrição para o backend (/api/push/subscribe)
//   - desativar(): cancela a inscrição local e no backend
//   - sincronizar(): reflete o estado atual (usado pelo sino no navbar)
//
// A chave pública VAPID vem de environment.vapidPublicKey.
// Requer o service worker registrado (main.ts, produção).
// ============================================================

import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  /** O navegador suporta Web Push? */
  readonly suportado =
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'Notification' in window;

  /** true quando este dispositivo está inscrito para receber push. */
  inscrito = signal(false);

  /** Reflete o estado atual da inscrição (chamar ao montar o navbar). */
  async sincronizar() {
    if (!this.suportado) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      this.inscrito.set(!!sub);
    } catch {
      this.inscrito.set(false);
    }
  }

  /** Alterna entre ativar e desativar. */
  async alternar() {
    if (this.inscrito()) await this.desativar();
    else await this.ativar();
  }

  /** Pede permissão, inscreve e registra no backend. */
  async ativar() {
    if (!this.suportado) {
      this.toast.aviso('Seu navegador não suporta notificações.');
      return;
    }

    // iOS só entrega push com o app instalado na tela inicial (standalone)
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = (navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    if (iOS && !standalone) {
      this.toast.aviso('No iPhone, adicione o app à Tela de Início para ativar as notificações.');
      return;
    }

    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== 'granted') {
        this.toast.aviso('Permissão de notificações negada.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.vapidPublicKey) as BufferSource
      });

      const json: any = sub.toJSON();
      await this.api.subscribePush({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? ''
      }).toPromise();

      this.inscrito.set(true);
      this.toast.sucesso('Notificações ativadas! 🔔');
    } catch (err) {
      console.error('Erro ao ativar push:', err);
      this.toast.erro('Não foi possível ativar as notificações.');
    }
  }

  /** Cancela a inscrição local e avisa o backend. */
  async desativar() {
    if (!this.suportado) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await this.api.unsubscribePush(endpoint).toPromise().catch(() => {});
      }
      this.inscrito.set(false);
      this.toast.sucesso('Notificações desativadas.');
    } catch (err) {
      console.error('Erro ao desativar push:', err);
    }
  }

  /** Converte a chave VAPID base64url em Uint8Array (formato do PushManager). */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }
}
