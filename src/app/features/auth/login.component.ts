// ============================================================
// COMPONENTE: LoginComponent
// ============================================================
// Responsável pela página de login (/entrar).
//
// Em Angular, um "Component" é a unidade básica da UI —
// combina template (HTML), estilos (CSS) e lógica (TypeScript)
// em um único arquivo.
//
// @Component = decorador que transforma uma classe TypeScript
// num componente Angular. Define como ele se comporta.
//
// standalone: true → componente autossuficiente (não precisa
//   de um NgModule para funcionar, padrão Angular 17+).
//
// imports → módulos que este componente usa no template:
//   CommonModule = diretivas básicas como @if, @for
//   FormsModule  = [(ngModel)] para two-way data binding
//   RouterLink   = diretiva [routerLink] para navegação
//
// selector: 'app-login' → tag HTML usada para inserir este
//   componente em outros templates: <app-login />
// ============================================================

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
            <!-- [(ngModel)]="login" = two-way binding: qualquer digitação
                 atualiza a variável "login" automaticamente -->
            <input type="text" [(ngModel)]="login" placeholder="Seu login" class="form-input">
          </div>
          <div class="field">
            <label>Senha</label>
            <!-- (keydown.enter)="entrar()" = chama entrar() ao pressionar Enter -->
            <input type="password" [(ngModel)]="senha" placeholder="Sua senha" class="form-input"
                   (keydown.enter)="entrar()">
          </div>

          <!-- @if = renderização condicional (sintaxe Angular 17+)
               erro() = lê o valor atual do signal (parênteses são obrigatórios) -->
          @if (erro()) {
            <div class="msg error">{{ erro() }}</div>
          }

          <!-- [disabled]="carregando()" = desabilita o botão enquanto aguarda a API -->
          <button class="btn btn-red btn-full" (click)="entrar()" [disabled]="carregando()">
            {{ carregando() ? 'Entrando...' : 'Entrar' }}
          </button>

          <div class="auth-footer">
            Não tem conta? <a routerLink="/cadastro">Cadastre-se gratuitamente</a>
          </div>
          <div class="auth-footer">
            <a routerLink="/esqueci-senha">Esqueci minha senha</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 56px);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      /* Speed lines diagonais sutis */
      background:
        repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(225,6,0,0.02) 40px, rgba(225,6,0,0.02) 42px),
        #F5F5F5;
    }
    .auth-card { width: 100%; max-width: 400px; padding: 32px; border-top: 3px solid #E10600 !important; }
    .auth-logo { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px; }
    .auth-logo span { color: #E10600; }
    .auth-header h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .auth-header p { font-size: 13px; color: #6B6B6B; margin-bottom: 24px; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-size: 13px; font-weight: 600; color: #1A1A1A; }
    .form-input { padding: 10px 12px; border: 1px solid #E0E0E0; border-radius: 6px; font-size: 14px; font-family: inherit; }
    .form-input:focus { outline: none; border-color: #E10600; box-shadow: 0 0 0 2px rgba(225,6,0,0.1); }
    .msg.error { padding: 10px 14px; border-radius: 6px; font-size: 13px; background: #fee2e2; color: #991b1b; }
    .btn { padding: 11px 22px; border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
    .btn-red { background: #0057E1; color: white; }
    .btn-full { width: 100%; }
    .auth-footer { font-size: 13px; color: #6B6B6B; text-align: center; }
    .auth-footer a { color: #0057E1; text-decoration: none; font-weight: 600; }
  `]
})
export class LoginComponent {
  // inject() = forma moderna de injeção de dependência em Angular.
  // É equivalente a usar o construtor:
  //   constructor(private authService: AuthService, private router: Router) {}
  private authService = inject(AuthService);
  private router      = inject(Router);

  // Variáveis simples para armazenar o que o usuário digita.
  // São sincronizadas com os inputs via [(ngModel)] (two-way binding).
  login = '';
  senha = '';

  // signal() = estado reativo do Angular (Angular 16+).
  // Quando o valor muda com .set(), a UI atualiza automaticamente
  // sem precisar chamar detectChanges() manualmente.
  erro       = signal('');       // mensagem de erro exibida no formulário
  carregando = signal(false);    // true enquanto aguarda resposta da API

  entrar() {
    // Validação básica antes de chamar a API
    if (!this.login || !this.senha) { this.erro.set('Preencha login e senha.'); return; }

    // Ativa o estado de carregamento (desabilita botão e muda o texto)
    this.carregando.set(true);

    // Chama o AuthService que faz POST /auth/login para a API.
    // subscribe() = "escuta" o resultado assíncrono da chamada HTTP:
    //   next  = executado quando a API retorna sucesso (200 OK)
    //   error = executado quando a API retorna erro (401 Unauthorized etc.)
    this.authService.login(this.login, this.senha).subscribe({
      next:  () => this.router.navigate(['/']),   // sucesso → navega para home
      error: () => { this.erro.set('Login ou senha inválidos.'); this.carregando.set(false); }
    });
  }
}
