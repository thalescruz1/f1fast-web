import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-visual">
        <div class="auth-vis-bg"></div>
        <div class="auth-vis-stripe"></div>
        <div class="auth-vis-content">
          <div class="auth-vis-logo">F1<span>FAST</span></div>
          <div class="auth-vis-ghost">ENTER<br>THE<br>GRID</div>
          <div class="auth-vis-sub">
            Campeonato Virtual de Fórmula 1<br>
            30 etapas · Até 35 pontos por corrida
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form">
          <div class="form-tag">Acesso</div>
          <h1 class="form-h">ENTRAR</h1>
          <p class="form-p">Acesse sua conta para fazer seus palpites</p>

          <div class="field">
            <label>Login ou E-mail</label>
            <input type="text" [(ngModel)]="login" placeholder="Seu login ou e-mail">
          </div>
          <div class="field">
            <label>Senha</label>
            <input type="password" [(ngModel)]="senha" placeholder="Sua senha"
                   (keydown.enter)="entrar()">
          </div>

          @if (erro()) {
            <div class="msg error">{{ erro() }}</div>
          }

          <button class="form-submit" (click)="entrar()" [disabled]="carregando()">
            {{ carregando() ? 'Entrando...' : 'Entrar' }}
          </button>

          <div class="form-footer">
            Não tem conta? <a routerLink="/cadastro">Cadastre-se gratuitamente</a><br>
            <a routerLink="/esqueci-senha">Esqueci minha senha</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      display: grid; grid-template-columns: 1fr 1fr;
      min-height: calc(100vh - 64px);
    }
    .auth-visual {
      position: relative; overflow: hidden;
      background: var(--s1); border-right: 1px solid var(--b1);
      display: flex; align-items: center; justify-content: center;
      padding: 48px;
    }
    .auth-vis-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at 35% 55%, rgba(232,0,26,.14) 0%, transparent 60%);
    }
    .auth-vis-stripe {
      position: absolute; inset: 0;
      background-image: repeating-linear-gradient(-12deg, transparent, transparent 72px, rgba(255,255,255,.02) 72px, rgba(255,255,255,.02) 73px);
    }
    .auth-vis-content { position: relative; z-index: 2; text-align: center; }
    .auth-vis-logo {
      font-family: var(--font-orb); font-size: 26px; font-weight: 900;
      letter-spacing: 3px; margin-bottom: 28px; color: var(--white);
    }
    .auth-vis-logo span { color: var(--red); }
    .auth-vis-ghost {
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: clamp(80px, 12vw, 130px); text-transform: uppercase; line-height: .88;
      color: transparent; -webkit-text-stroke: 1.5px rgba(255,255,255,.1);
      letter-spacing: -3px; user-select: none;
    }
    .auth-vis-sub {
      font-size: var(--sz-base); font-weight: 500; color: var(--w45);
      margin-top: 28px; line-height: 1.8;
    }

    .auth-right {
      display: flex; align-items: center; justify-content: center;
      padding: 48px 56px; background: var(--bg);
    }
    .auth-form { width: 100%; max-width: 380px; }
    .form-tag {
      display: inline-flex; align-items: center; gap: 10px;
      font-size: var(--sz-sm); font-weight: 700; color: var(--red);
      text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px;
    }
    .form-tag::before { content: ''; width: 20px; height: 2px; background: var(--red); }
    .form-h {
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: var(--sz-3xl); text-transform: uppercase; line-height: .9; margin-bottom: 8px;
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
      width: 100%; margin-top: 36px; padding: 18px;
      background: var(--red); border: 2px solid var(--red); color: #fff;
      font-size: var(--sz-base); font-weight: 700; font-family: var(--font-body);
      letter-spacing: 1px; cursor: pointer; transition: all .2s;
    }
    .form-submit:hover { background: transparent; color: var(--red); }
    .form-submit:disabled { opacity: .5; cursor: not-allowed; }

    .form-footer {
      margin-top: 24px; text-align: center;
      font-size: var(--sz-sm); font-weight: 500; color: var(--w45); line-height: 2.2;
    }
    .form-footer a { color: var(--red); text-decoration: none; font-weight: 700; }
    .form-footer a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .auth-layout { grid-template-columns: 1fr; }
      .auth-visual { display: none; }
      .auth-right { padding: 32px 20px; }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  login = '';
  senha = '';

  erro       = signal('');
  carregando = signal(false);

  entrar() {
    if (!this.login || !this.senha) { this.erro.set('Preencha login/e-mail e senha.'); return; }

    this.carregando.set(true);

    this.authService.login(this.login, this.senha).subscribe({
      next:  () => this.router.navigate(['/']),
      error: (e: any) => { this.erro.set(e.error?.mensagem || 'Login ou senha inválidos.'); this.carregando.set(false); }
    });
  }
}
