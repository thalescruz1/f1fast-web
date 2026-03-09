// ============================================================
// COMPONENTE: RedefinirSenhaComponent
// ============================================================
// Responsável pela página /redefinir-senha.
// Esta página é acessada através do link enviado por e-mail.
// A URL contém um token de segurança como query parameter:
//   /redefinir-senha?token=abc123xyz
//
// O fluxo tem 3 estados visuais:
//   1. tokenInvalido() = true → URL sem token ou já expirado
//   2. !concluido()           → formulário para digitar a nova senha
//   3. concluido()    = true  → senha alterada com sucesso
//
// ActivatedRoute = serviço Angular para ler dados da rota atual
// (parâmetros de URL, query strings, etc.)
// ============================================================

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">F1<span>FAST</span></div>
          <h2>Redefinir senha</h2>
          <p>Escolha uma nova senha para sua conta</p>
        </div>

        <div class="auth-form">
          <!-- Estado 1: token ausente ou inválido na URL -->
          @if (tokenInvalido()) {
            <div class="msg error">
              Link inválido ou expirado. Solicite um novo link de redefinição.
            </div>
            <a routerLink="/esqueci-senha" class="btn btn-red btn-full" style="text-align:center;text-decoration:none;display:block;padding:11px;">
              Solicitar novo link
            </a>
          <!-- Estado 2: formulário ativo para digitar nova senha -->
          } @else if (!concluido()) {
            <div class="field">
              <label>Nova senha</label>
              <input type="password" [(ngModel)]="novaSenha" placeholder="Mínimo 6 caracteres" class="form-input">
            </div>
            <div class="field">
              <label>Confirmar senha</label>
              <input type="password" [(ngModel)]="confirmarSenha" placeholder="Repita a nova senha" class="form-input"
                     (keydown.enter)="redefinir()">
            </div>

            @if (erro()) {
              <div class="msg error">{{ erro() }}</div>
            }

            <button class="btn btn-red btn-full" (click)="redefinir()" [disabled]="carregando()">
              {{ carregando() ? 'Salvando...' : 'Salvar nova senha' }}
            </button>
          <!-- Estado 3: senha redefinida com sucesso -->
          } @else {
            <div class="msg success">
              Senha redefinida com sucesso! Você já pode fazer login com a nova senha.
            </div>
            <a routerLink="/entrar" class="btn btn-red btn-full" style="text-align:center;text-decoration:none;display:block;padding:11px;">
              Ir para o login
            </a>
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
    .msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; line-height: 1.5; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .msg.success { background: #dcfce7; color: #166534; }
    .btn { padding: 11px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .btn-red { background: #E10600; color: white; }
    .btn-full { width: 100%; }
    .auth-footer { font-size: 13px; color: #6B6B6B; text-align: center; }
    .auth-footer a { color: #E10600; text-decoration: none; font-weight: 600; }
  `]
})
export class RedefinirSenhaComponent implements OnInit {
  private api   = inject(ApiService);
  // ActivatedRoute = serviço que representa a rota atualmente ativa.
  // Usamos para ler o ?token=... da URL.
  private route  = inject(ActivatedRoute);

  private token  = '';         // token lido da URL — não exibido ao usuário
  novaSenha      = '';         // nova senha digitada
  confirmarSenha = '';         // confirmação da senha
  erro           = signal('');
  carregando     = signal(false);
  concluido      = signal(false);      // true após redefinição bem-sucedida
  tokenInvalido  = signal(false);      // true se a URL não tiver token

  ngOnInit() {
    // route.snapshot = foto instantânea da rota no momento do carregamento.
    // queryParamMap.get('token') = lê o valor de ?token=... da URL.
    // ?? '' = operador "nullish coalescing": usa '' se o valor for null/undefined
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    // Se a URL não tiver token, já mostramos o estado de erro imediatamente
    if (!this.token) this.tokenInvalido.set(true);
  }

  redefinir() {
    // Validações locais antes de chamar a API
    if (!this.novaSenha || !this.confirmarSenha) { this.erro.set('Preencha todos os campos.'); return; }
    if (this.novaSenha.length < 6) { this.erro.set('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (this.novaSenha !== this.confirmarSenha) { this.erro.set('As senhas não coincidem.'); return; }

    this.carregando.set(true);

    // POST /auth/redefinir-senha com o token e a nova senha.
    // A API valida se o token existe e não expirou (1 hora de validade).
    this.api.redefinirSenha(this.token, this.novaSenha).subscribe({
      next:  () => { this.concluido.set(true); this.carregando.set(false); },
      error: (err) => {
        // err?.error = acessa a mensagem de erro do corpo da resposta HTTP.
        // ?? = usa a mensagem padrão se o erro não tiver body
        const msg = err?.error ?? 'Token inválido ou expirado.';
        this.erro.set(msg);
        this.carregando.set(false);
      }
    });
  }
}
