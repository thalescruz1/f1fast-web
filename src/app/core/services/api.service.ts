// ============================================================
// SERVICE: ApiService (Angular)
// ============================================================
// Centraliza TODAS as chamadas HTTP para o backend .NET.
// Funciona como uma "biblioteca de chamadas": cada método
// aqui corresponde a um endpoint da API.
//
// Por que centralizar? Se a URL da API mudar, só mudamos aqui.
// Os componentes não precisam saber qual URL chamar — só
// chamam os métodos deste service.
//
// Todos os métodos retornam "Observable" (RxJS), que é o
// sistema reativo de chamadas HTTP do Angular.
// O componente precisa fazer .subscribe() para executar.
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Piloto, Etapa, PalpiteRequest, PalpitePublico,
  RankingItem, ResultadoRequest, ResultadoPublico, HistoricoEtapa
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // URL base da API (ex: "https://api.f1fast.com.br/api")
  // Vem do arquivo environment.ts (diferente em dev e produção)
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ──────────────────────────────────────────────────────────
  // PILOTOS
  // ──────────────────────────────────────────────────────────

  /** GET /api/pilotos → lista os 22 pilotos ativos com suas equipes */
  getPilotos() {
    // http.get<Piloto[]>(...) = faz GET e tipifica a resposta como array de Piloto
    return this.http.get<Piloto[]>(`${this.base}/pilotos`);
  }

  // ──────────────────────────────────────────────────────────
  // ETAPAS
  // ──────────────────────────────────────────────────────────

  /** GET /api/etapas → retorna todas as 30 etapas do calendário */
  getEtapas() {
    return this.http.get<Etapa[]>(`${this.base}/etapas`);
  }

  /** GET /api/etapas/proxima → retorna a próxima etapa com palpite aberto */
  getProximaEtapa() {
    return this.http.get<Etapa>(`${this.base}/etapas/proxima`);
  }

  // ──────────────────────────────────────────────────────────
  // PALPITES
  // ──────────────────────────────────────────────────────────

  /** POST /api/palpites → envia ou atualiza o palpite do usuário logado */
  enviarPalpite(req: PalpiteRequest) {
    // { responseType: 'text' } = a API retorna texto puro (não JSON) neste endpoint
    return this.http.post(`${this.base}/palpites`, req, { responseType: 'text' });
  }

  /** GET /api/palpites/{etapaId}/meu → retorna o palpite do usuário logado */
  getMeuPalpite(etapaId: number) {
    return this.http.get(`${this.base}/palpites/${etapaId}/meu`);
  }

  /** GET /api/palpites/{etapaId}/publico → palpites de todos (após prazo fechar) */
  getPalpitesPublicos(etapaId: number) {
    return this.http.get<PalpitePublico[]>(`${this.base}/palpites/${etapaId}/publico`);
  }

  // ──────────────────────────────────────────────────────────
  // RANKING
  // ──────────────────────────────────────────────────────────

  /** GET /api/ranking → classificação geral de todos os participantes */
  getRanking() {
    return this.http.get<RankingItem[]>(`${this.base}/ranking`);
  }

  /** GET /api/ranking/{login}/historico → pontuação por corrida de um participante */
  getHistoricoParticipante(login: string) {
    return this.http.get<HistoricoEtapa[]>(`${this.base}/ranking/${login}/historico`);
  }

  /** GET /api/ranking/ultimo-gp → nome do último GP com resultado cadastrado */
  getUltimoGp() {
    return this.http.get<{ nomeGp: string | null }>(`${this.base}/ranking/ultimo-gp`);
  }

  /** GET /api/palpites/{etapaId}/resultado → resultado oficial público */
  getResultadoPublico(etapaId: number) {
    return this.http.get<ResultadoPublico>(`${this.base}/palpites/${etapaId}/resultado`);
  }

  // ──────────────────────────────────────────────────────────
  // ADMIN (requer token de usuário com Role="Admin")
  // ──────────────────────────────────────────────────────────

  /** POST /api/admin/resultado → lança resultado de uma corrida */
  inserirResultado(req: ResultadoRequest) {
    return this.http.post(`${this.base}/admin/resultado`, req, { responseType: 'text' });
  }

  /** GET /api/admin/resultado/usuarios → lista todos os participantes */
  getUsuarios() {
    return this.http.get<any[]>(`${this.base}/admin/resultado/usuarios`);
  }

  /** GET /api/admin/etapas → lista todas as etapas com prazo e status */
  getEtapasAdmin() {
    return this.http.get<any[]>(`${this.base}/admin/etapas`);
  }

  /**
   * PATCH /api/admin/etapas/{id}/prazo → atualiza o prazo de apostas de uma etapa.
   * novoPrazo deve ser uma string ISO 8601 em UTC (ex: "2026-03-16T23:59:00Z").
   */
  atualizarPrazo(id: number, novoPrazo: string) {
    return this.http.patch(
      `${this.base}/admin/etapas/${id}/prazo`,
      { novoPrazo },
      { responseType: 'text' }
    );
  }

  toggleCancelada(id: number) {
    return this.http.patch<{ mensagem: string; cancelada: boolean }>(
      `${this.base}/admin/etapas/${id}/cancelar`, {});
  }

  /**
   * PATCH /api/admin/resultado/usuarios/{id}/role → altera o papel de um usuário
   * JSON.stringify(role) = serializa a string para enviar como body JSON
   */
  alterarRole(id: number, role: string) {
    return this.http.patch(
      `${this.base}/admin/resultado/usuarios/${id}/role`,
      JSON.stringify(role),
      { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
    );
  }

  // ──────────────────────────────────────────────────────────
  // RECUPERAÇÃO DE SENHA
  // ──────────────────────────────────────────────────────────

  /** POST /api/auth/esqueci-senha → solicita e-mail de recuperação */
  esqueciSenha(email: string) {
    return this.http.post(`${this.base}/auth/esqueci-senha`, { email }, { responseType: 'text' });
  }

  /** POST /api/auth/redefinir-senha → redefine a senha com o token do e-mail */
  redefinirSenha(token: string, novaSenha: string) {
    return this.http.post(`${this.base}/auth/redefinir-senha`, { token, novaSenha }, { responseType: 'text' });
  }
}
