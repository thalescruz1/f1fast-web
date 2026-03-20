import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-center">
      <div class="auth-card">
        <div class="form-tag">Segurança</div>
        <h1 class="form-h">REDEFINIR<br>SENHA</h1>
        <p class="form-p">Escolha uma nova senha para sua conta</p>

        @if (tokenInvalido()) {
          <div class="msg error">
            Link inválido ou expirado. Solicite um novo link de redefinição.
          </div>
          <a routerLink="/esqueci-senha" class="form-submit" style="text-align:center;text-decoration:none;display:block;">
            Solicitar novo link
          </a>
        } @else if (!concluido()) {
          <div class="field">
            <label>Nova senha</label>
            <input type="password" [(ngModel)]="novaSenha" placeholder="Entre 6 e 8 caracteres" maxlength="8">
            <span class="field-hint">{{ novaSenha.length }}/8 caracteres</span>
          </div>
          <div class="field">
            <label>Confirmar senha</label>
            <input type="password" [(ngModel)]="confirmarSenha" placeholder="Repita a nova senha"
                   maxlength="8" (keydown.enter)="redefinir()">
          </div>

          @if (erro()) {
            <div class="msg error">{{ erro() }}</div>
          }

          <button class="form-submit" (click)="redefinir()" [disabled]="carregando()">
            {{ carregando() ? 'Salvando...' : 'Salvar nova senha' }}
          </button>
        } @else {
          <div class="msg success">
            Senha redefinida com sucesso! Você já pode fazer login com a nova senha.
          </div>
          <a routerLink="/entrar" class="form-submit" style="text-align:center;text-decoration:none;display:block;">
            Ir para o login
          </a>
        }

        <div class="form-footer">
          <a routerLink="/entrar">← Voltar para o login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-center {
      min-height: calc(100vh - 64px);
      display: flex; align-items: center; justify-content: center;
      padding: 32px;
    }
    .auth-card { width: 100%; max-width: 400px; }
    .form-tag {
      display: inline-flex; align-items: center; gap: 10px;
      font-size: var(--sz-sm); font-weight: 700; color: var(--red);
      text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;
    }
    .form-tag::before { content: ''; width: 20px; height: 2px; background: var(--red); }
    .form-h {
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: var(--sz-2xl); text-transform: uppercase; line-height: .9; margin-bottom: 8px;
    }
    .form-p { font-size: var(--sz-base); color: var(--w45); margin-bottom: 36px; }
    .field { margin-bottom: 24px; }
    .field label {
      display: block; font-size: var(--sz-sm); font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.5px; color: var(--w45); margin-bottom: 10px;
    }
    .field input {
      width: 100%; padding: 14px 0;
      background: transparent; border: none; border-bottom: 2px solid var(--b3);
      color: var(--white); font-size: var(--sz-md); font-family: var(--font-body);
      outline: none; transition: border-color .2s;
    }
    .field input:focus { border-bottom-color: var(--red); }
    .field input::placeholder { color: var(--w20); }
    .field-hint { font-size: var(--sz-xs); color: var(--w45); margin-top: 6px; display: block; }
    .form-submit {
      width: 100%; margin-top: 12px; padding: 18px;
      background: var(--red); border: 2px solid var(--red); color: #fff;
      font-size: var(--sz-base); font-weight: 700; font-family: var(--font-body);
      letter-spacing: 1px; cursor: pointer; transition: all .2s;
    }
    .form-submit:hover { background: transparent; color: var(--red); }
    .form-submit:disabled { opacity: .5; cursor: not-allowed; }
    .form-footer {
      margin-top: 24px; text-align: center;
      font-size: var(--sz-sm); color: var(--w45);
    }
    .form-footer a { color: var(--red); text-decoration: none; font-weight: 700; }
  `]
})
export class RedefinirSenhaComponent implements OnInit {
  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);

  private token  = '';
  novaSenha      = '';
  confirmarSenha = '';
  erro           = signal('');
  carregando     = signal(false);
  concluido      = signal(false);
  tokenInvalido  = signal(false);

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.tokenInvalido.set(true);
  }

  redefinir() {
    if (!this.novaSenha || !this.confirmarSenha) { this.erro.set('Preencha todos os campos.'); return; }
    if (this.novaSenha.length < 6) { this.erro.set('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (this.novaSenha.length > 8) { this.erro.set('A senha deve ter no máximo 8 caracteres.'); return; }
    if (this.novaSenha !== this.confirmarSenha) { this.erro.set('As senhas não coincidem.'); return; }

    this.carregando.set(true);

    this.api.redefinirSenha(this.token, this.novaSenha).subscribe({
      next:  () => { this.concluido.set(true); this.carregando.set(false); },
      error: (err) => {
        this.erro.set(err?.error?.mensagem ?? 'Token inválido ou expirado.');
        this.carregando.set(false);
      }
    });
  }
}
