// ============================================================
// SERVICE: AuthService (Angular)
// ============================================================
// Em Angular, um "Service" é uma classe compartilhada entre
// componentes que não deveria ficar em um componente específico.
//
// Este service gerencia toda a autenticação do lado do frontend:
//   - Fazer login e salvar o token JWT no localStorage
//   - Fazer logout (apagar dados da sessão)
//   - Restaurar a sessão quando a página é recarregada
//   - Verificar se o usuário está logado ou é admin
//
// "@Injectable({ providedIn: 'root' })" = registra o service
// globalmente — existe uma única instância em toda a aplicação.
// ============================================================

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

// @Injectable = permite que o Angular injete este service em outros lugares
// { providedIn: 'root' } = instância única (singleton) em toda a aplicação
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Chaves usadas para guardar dados no localStorage do navegador
  private readonly TOKEN_KEY = 'f1fast_token'; // chave para o JWT
  private readonly USER_KEY  = 'f1fast_user';  // chave para os dados do usuário

  // "signal" é o novo sistema reativo do Angular (como useState do React).
  // Quando o valor muda, todos os componentes que usam este signal re-renderizam.
  isLoggedIn  = signal(false);  // true se o usuário está autenticado
  currentUser = signal<{ login: string; nome: string; role: string } | null>(null);

  // O construtor é chamado pelo Angular quando o service é criado.
  // "private http" e "private router" são injeção de dependência automática.
  constructor(private http: HttpClient, private router: Router) {
    // Tenta restaurar a sessão do localStorage ao iniciar a aplicação
    this.restoreSession();
  }

  /**
   * Envia as credenciais para a API e salva a sessão se bem-sucedido.
   * Retorna um Observable — o componente precisa fazer .subscribe() para executar.
   */
  login(login: string, senha: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { login, senha })
      // .pipe(tap(...)) = executa uma ação secundária sem alterar o fluxo
      // Aqui salvamos a sessão quando a API responde com sucesso
      .pipe(tap(res => this.saveSession(res)));
  }

  /** Envia os dados de cadastro para a API */
  register(data: {
    login: string; nome: string; sobrenome: string;
    cpf: string; senha: string; localizacao: string; email: string;
  }) {
    // { responseType: 'text' } = a API retorna texto puro, não JSON
    return this.http.post(
      `${environment.apiUrl}/auth/register`, data, { responseType: 'text' });
  }

  /**
   * Faz logout: remove os dados do localStorage, reseta os signals
   * e navega para a página inicial.
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedIn.set(false);    // .set() = atualiza o valor do signal
    this.currentUser.set(null);
    this.router.navigate(['/']);   // redireciona para a home
  }

  /** Retorna o token JWT salvo, ou null se não estiver logado */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Verifica se o usuário logado tem role "Admin" */
  isAdmin(): boolean {
    // "?." = optional chaining: retorna undefined se currentUser() for null
    return this.currentUser()?.role === 'Admin';
  }

  /**
   * Salva o token JWT e os dados do usuário no localStorage.
   * Private = só pode ser chamado dentro desta classe.
   */
  private saveSession(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    // JSON.stringify converte o objeto para string (localStorage só guarda strings)
    localStorage.setItem(this.USER_KEY, JSON.stringify(
      { login: res.login, nome: res.nome, role: res.role }
    ));
    this.isLoggedIn.set(true);
    this.currentUser.set({ login: res.login, nome: res.nome, role: res.role });
  }

  /**
   * Tenta restaurar a sessão ao recarregar a página.
   * Se o token e os dados do usuário estiverem no localStorage, restaura o estado.
   */
  private restoreSession() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user  = localStorage.getItem(this.USER_KEY);
    if (token && user) {
      this.isLoggedIn.set(true);
      // JSON.parse converte a string de volta para objeto
      this.currentUser.set(JSON.parse(user));
    }
  }
}
