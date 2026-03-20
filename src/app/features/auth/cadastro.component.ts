import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-layout">
      <div class="auth-visual">
        <div class="auth-vis-bg"></div>
        <div class="auth-vis-stripe"></div>
        <div class="auth-vis-content">
          <div class="auth-vis-logo">F1<span>FAST</span></div>
          <div class="auth-vis-ghost">JOIN<br>THE<br>RACE</div>
          <div class="auth-vis-sub">
            Faça seus palpites e dispute o título<br>
            do Campeonato Virtual F1Fast 2026
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form">
          <div class="form-tag">Novo piloto</div>
          <h1 class="form-h">CADASTRO</h1>
          <p class="form-p">Crie sua conta gratuitamente e participe do CV2026</p>

          <div class="field-row">
            <div class="field">
              <label>Nome</label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Primeiro nome">
            </div>
            <div class="field">
              <label>Sobrenome</label>
              <input type="text" [(ngModel)]="form.sobrenome" placeholder="Sobrenome">
            </div>
          </div>
          <div class="field">
            <label>Login <span class="hint">(máx. 10 caracteres)</span></label>
            <input type="text" [(ngModel)]="form.login" placeholder="Seu login" maxlength="10">
          </div>
          <div class="field">
            <label>CPF</label>
            <input type="text" [(ngModel)]="form.cpf" placeholder="Sem pontos ou traços">
          </div>
          <div class="field">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="form.email" placeholder="seu@email.com">
          </div>
          <div class="field">
            <label>Cidade / Estado <span class="hint">(ex: São Paulo-SP)</span></label>
            <input type="text" [(ngModel)]="form.localizacao" placeholder="São Paulo-SP">
          </div>
          <div class="field">
            <label>Senha <span class="hint">(máx. 8 caracteres)</span></label>
            <input type="password" [(ngModel)]="form.senha" placeholder="Sua senha" maxlength="8"
                   (keydown.enter)="cadastrar()">
          </div>

          @if (mensagem()) {
            <div class="msg" [class.error]="msgErro()" [class.success]="!msgErro()">{{ mensagem() }}</div>
          }

          <button class="form-submit" (click)="cadastrar()" [disabled]="carregando()">
            {{ carregando() ? 'Cadastrando...' : 'Criar Conta' }}
          </button>

          <div class="form-footer">
            Já tem conta? <a routerLink="/entrar">Entrar</a>
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
      overflow-y: auto;
    }
    .auth-form { width: 100%; max-width: 420px; }
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

    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field { margin-bottom: 24px; }
    .field label {
      display: block; font-size: var(--sz-sm); font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.5px; color: var(--w45); margin-bottom: 10px;
    }
    .hint { font-weight: 500; font-size: var(--sz-xs); letter-spacing: 0; text-transform: none; }
    .field input {
      width: 100%; padding: 14px 0;
      background: transparent; border: none; border-bottom: 2px solid var(--b3);
      color: var(--white); font-size: var(--sz-md); font-family: var(--font-body);
      outline: none; transition: border-color .2s;
    }
    .field input:focus { border-bottom-color: var(--red); }
    .field input::placeholder { color: var(--w20); }

    .form-submit {
      width: 100%; margin-top: 20px; padding: 18px;
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
export class CadastroComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  form = { nome: '', sobrenome: '', login: '', cpf: '', email: '', localizacao: '', senha: '' };

  mensagem   = signal('');
  msgErro    = signal(false);
  carregando = signal(false);

  cadastrar() {
    const { nome, sobrenome, login, cpf, email, localizacao, senha } = this.form;

    if (!nome || !sobrenome || !login || !cpf || !email || !localizacao || !senha) {
      this.setMsg('Preencha todos os campos.', true); return;
    }

    this.carregando.set(true);

    this.authService.register(this.form).subscribe({
      next: () => {
        this.setMsg('Conta criada! Redirecionando...', false);
        setTimeout(() => this.router.navigate(['/entrar']), 1500);
      },
      error: (e: any) => { this.setMsg(e.error?.mensagem || 'Erro ao cadastrar.', true); this.carregando.set(false); }
    });
  }

  private setMsg(msg: string, erro: boolean) {
    this.mensagem.set(msg); this.msgErro.set(erro);
  }
}
