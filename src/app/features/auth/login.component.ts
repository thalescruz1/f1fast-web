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
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">F1<span>FAST</span></div>
          <h2>Entrar</h2>
          <p>Acesse sua conta para fazer palpites</p>
        </div>

        <div class="auth-form">
          <div class="field">
            <label>Login</label>
            <input type="text" [(ngModel)]="login" placeholder="Seu login" class="form-input">
          </div>
          <div class="field">
            <label>Senha</label>
            <input type="password" [(ngModel)]="senha" placeholder="Sua senha" class="form-input"
                   (keydown.enter)="entrar()">
          </div>

          @if (erro()) {
            <div class="msg error">{{ erro() }}</div>
          }

          <button class="btn btn-red btn-full" (click)="entrar()" [disabled]="carregando()">
            {{ carregando() ? 'Entrando...' : 'Entrar' }}
          </button>

          <div class="auth-footer">
            Não tem conta? <a routerLink="/cadastro">Cadastre-se gratuitamente</a>
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
    .msg.error { padding: 10px 14px; border-radius: 6px; font-size: 13px; background: #fee2e2; color: #991b1b; }
    .btn { padding: 11px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .btn-red { background: #E10600; color: white; }
    .btn-full { width: 100%; }
    .auth-footer { font-size: 13px; color: #6B6B6B; text-align: center; }
    .auth-footer a { color: #E10600; text-decoration: none; font-weight: 600; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  login      = '';
  senha      = '';
  erro       = signal('');
  carregando = signal(false);

  entrar() {
    if (!this.login || !this.senha) { this.erro.set('Preencha login e senha.'); return; }
    this.carregando.set(true);
    this.authService.login(this.login, this.senha).subscribe({
      next:  () => this.router.navigate(['/']),
      error: () => { this.erro.set('Login ou senha inválidos.'); this.carregando.set(false); }
    });
  }
}
