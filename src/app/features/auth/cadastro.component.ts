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
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">F1<span>FAST</span></div>
          <h2>Cadastro</h2>
          <p>Crie sua conta gratuitamente e participe do CV2026</p>
        </div>

        <div class="auth-form">
          <div class="field-row">
            <div class="field">
              <label>Nome</label>
              <input type="text" [(ngModel)]="form.nome" placeholder="Primeiro nome" class="form-input">
            </div>
            <div class="field">
              <label>Sobrenome</label>
              <input type="text" [(ngModel)]="form.sobrenome" placeholder="Sobrenome" class="form-input">
            </div>
          </div>
          <div class="field">
            <label>Login <span class="hint">(máx. 10 caracteres)</span></label>
            <input type="text" [(ngModel)]="form.login" placeholder="Seu login" class="form-input" maxlength="10">
          </div>
          <div class="field">
            <label>CPF</label>
            <input type="text" [(ngModel)]="form.cpf" placeholder="Sem pontos ou traços" class="form-input">
          </div>
          <div class="field">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="form.email" placeholder="seu@email.com" class="form-input">
          </div>
          <div class="field">
            <label>Cidade / Estado <span class="hint">(ex: São Paulo-SP)</span></label>
            <input type="text" [(ngModel)]="form.localizacao" placeholder="São Paulo-SP" class="form-input">
          </div>
          <div class="field">
            <label>Senha <span class="hint">(máx. 8 caracteres)</span></label>
            <input type="password" [(ngModel)]="form.senha" placeholder="Sua senha" class="form-input" maxlength="8">
          </div>

          @if (mensagem()) {
            <div class="msg" [class.error]="msgErro()">{{ mensagem() }}</div>
          }

          <button class="btn btn-red btn-full" (click)="cadastrar()" [disabled]="carregando()">
            {{ carregando() ? 'Cadastrando...' : 'Criar Conta' }}
          </button>

          <div class="auth-footer">
            Já tem conta? <a routerLink="/entrar">Entrar</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 56px); display: flex; align-items: center; justify-content: center; background: #F5F5F5; padding: 24px; }
    .auth-card { width: 100%; max-width: 480px; padding: 32px; }
    .auth-logo { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
    .auth-logo span { color: #E10600; }
    .auth-header h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .auth-header p { font-size: 13px; color: #6B6B6B; margin-bottom: 24px; }
    .auth-form { display: flex; flex-direction: column; gap: 14px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 13px; font-weight: 600; color: #1A1A1A; }
    .hint { font-size: 11px; color: #6B6B6B; font-weight: 400; }
    .form-input { padding: 10px 12px; border: 1px solid #E0E0E0; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .form-input:focus { outline: none; border-color: #E10600; }
    .msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; background: #dcfce7; color: #166534; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .btn { padding: 11px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .btn-red { background: #E10600; color: white; }
    .btn-full { width: 100%; }
    .auth-footer { font-size: 13px; color: #6B6B6B; text-align: center; }
    .auth-footer a { color: #E10600; text-decoration: none; font-weight: 600; }
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
      next:  () => { this.setMsg('Conta criada! Redirecionando...', false); setTimeout(() => this.router.navigate(['/entrar']), 1500); },
      error: e  => { this.setMsg(e.error || 'Erro ao cadastrar.', true); this.carregando.set(false); }
    });
  }

  private setMsg(msg: string, erro: boolean) {
    this.mensagem.set(msg); this.msgErro.set(erro);
  }
}
