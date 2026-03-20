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
    <div class="auth-center">
      <div class="auth-card">
        <div class="form-tag">Recuperação</div>
        <h1 class="form-h">ESQUECI<br>MINHA SENHA</h1>
        <p class="form-p">Informe seu e-mail para receber o link de redefinição</p>

        @if (!enviado()) {
          <div class="field">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="email" placeholder="seu@email.com"
                   (keydown.enter)="enviar()">
          </div>

          @if (erro()) {
            <div class="msg error">{{ erro() }}</div>
          }

          <button class="form-submit" (click)="enviar()" [disabled]="carregando()">
            {{ carregando() ? 'Enviando...' : 'Enviar link' }}
          </button>
        } @else {
          <div class="msg success">
            Se o e-mail estiver cadastrado, você receberá o link de redefinição em instantes.
            Verifique também a pasta de spam.
          </div>
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
    .field { margin-bottom: 28px; }
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
export class EsqueciSenhaComponent {
  private api = inject(ApiService);

  email      = '';
  erro       = signal('');
  carregando = signal(false);
  enviado    = signal(false);

  enviar() {
    if (!this.email) { this.erro.set('Informe seu e-mail.'); return; }
    this.carregando.set(true);

    this.api.esqueciSenha(this.email).subscribe({
      next:  () => { this.enviado.set(true); this.carregando.set(false); },
      error: (e: any) => { this.erro.set(e.error?.mensagem || 'Erro ao enviar. Tente novamente.'); this.carregando.set(false); }
    });
  }
}
