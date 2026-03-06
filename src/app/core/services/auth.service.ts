import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'f1fast_token';
  private readonly USER_KEY  = 'f1fast_user';

  isLoggedIn  = signal(false);
  currentUser = signal<{ login: string; nome: string; role: string } | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  login(login: string, senha: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { login, senha })
      .pipe(tap(res => this.saveSession(res)));
  }

  register(data: {
    login: string; nome: string; sobrenome: string;
    cpf: string; senha: string; localizacao: string; email: string;
  }) {
    return this.http.post(
      `${environment.apiUrl}/auth/register`, data, { responseType: 'text' });
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(
      { login: res.login, nome: res.nome, role: res.role }
    ));
    this.isLoggedIn.set(true);
    this.currentUser.set({ login: res.login, nome: res.nome, role: res.role });
  }

  private restoreSession() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user  = localStorage.getItem(this.USER_KEY);
    if (token && user) {
      this.isLoggedIn.set(true);
      this.currentUser.set(JSON.parse(user));
    }
  }
}
