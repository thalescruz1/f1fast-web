// ============================================================
// COMPONENTE: EsqueciSenhaComponent
// ============================================================
// Responsável pela página /esqueci-senha.
// O usuário informa o e-mail e recebe um link de redefinição.
//
// Padrão de segurança importante: a API sempre retorna sucesso
// independente de o e-mail existir ou não — isso evita que
// alguém descubra quais e-mails estão cadastrados no sistema
// (enumeration attack). Por isso, sempre mostramos a mensagem
// de "verifique seu e-mail" mesmo sem saber se encontrou conta.
// ============================================================

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-esqueci-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">F1<span>FAST</span></div>
          <h2>Esqueci minha senha</h2>
          <p>Informe seu e-mail para receber o link de redefinição</p>
        </div>

        <div class="auth-form">
          <!-- @if(!enviado()) = mostra o formulário ANTES de enviar.
               Quando enviado() = true, troca para a mensagem de confirmação. -->
          @if (!enviado()) {
            <div class="field">
              <label>E-mail</label>
              <input type="email" [(ngModel)]="email" placeholder="seu@email.com" class="form-input"
                     (keydown.enter)="enviar()">
            </div>

            @if (erro()) {
              <div class="msg error">{{ erro() }}</div>
            }

            <button class="btn btn-red btn-full" (click)="enviar()" [disabled]="carregando()">
              {{ carregando() ? 'Enviando...' : 'Enviar link' }}
            </button>
          } @else {
            <!-- Estado pós-envio: esconde o formulário e mostra confirmação.
                 Por segurança, não confirmamos se o e-mail está cadastrado. -->
            <div class="msg success">
              Se o e-mail estiver cadastrado, você receberá o link de redefinição em instantes.
              Verifique também a pasta de spam.
            </div>
          }

          <div class="auth-footer">
            <a routerLink="/entrar">← Voltar para o login</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 56px); display: flex; align-items: center; justify-content: center; background: #F5F5F5; padding: 24px; }
    .auth-card { width: 100%; max-width: 400px; padding: 32px; }
    .auth-logo { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
    .auth-logo span { color: #E10600; }
    .auth-header h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .auth-header p { font-size: 13px; color: #6B6B6B; margin-bottom: 24px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 13px; font-weight: 600; color: #1A1A1A; }
    .form-input { padding: 10px 12px; border: 1px solid #E0E0E0; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .form-input:focus { outline: none; border-color: #E10600; }
    .msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .msg.success { background: #dcfce7; color: #166534; line-height: 1.5; }
    .btn { padding: 11px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .btn-red { background: #E10600; color: white; }
    .btn-full { width: 100%; }
    .auth-footer { font-size: 13px; color: #6B6B6B; text-align: center; }
    .auth-footer a { color: #E10600; text-decoration: none; font-weight: 600; }
  `]
})
export class EsqueciSenhaComponent {
  private api = inject(ApiService);

  email      = '';              // e-mail digitado pelo usuário
  erro       = signal('');      // mensagem de erro de validação
  carregando = signal(false);   // true enquanto aguarda resposta da API
  enviado    = signal(false);   // true após o envio — troca o formulário pela confirmação

  enviar() {
    if (!this.email) { this.erro.set('Informe seu e-mail.'); return; }
    this.carregando.set(true);

    // POST /auth/esqueci-senha — a API envia o e-mail se encontrar a conta
    this.api.esqueciSenha(this.email).subscribe({
      // next: sempre vem como sucesso (mesmo que o e-mail não exista no banco)
      // Isso é intencional por segurança — não revelamos se o e-mail existe
      next:  () => { this.enviado.set(true); this.carregando.set(false); },
      error: () => { this.erro.set('Erro ao enviar. Tente novamente.'); this.carregando.set(false); }
    });
  }
}
