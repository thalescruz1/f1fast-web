import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Piloto, Etapa, PalpiteRequest, PalpitePublico,
  RankingItem, ResultadoRequest
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Pilotos
  getPilotos() {
    return this.http.get<Piloto[]>(`${this.base}/pilotos`);
  }

  // Etapas
  getEtapas() {
    return this.http.get<Etapa[]>(`${this.base}/etapas`);
  }

  getProximaEtapa() {
    return this.http.get<Etapa>(`${this.base}/etapas/proxima`);
  }

  // Palpites
  enviarPalpite(req: PalpiteRequest) {
    return this.http.post(`${this.base}/palpites`, req, { responseType: 'text' });
  }

  getMeuPalpite(etapaId: number) {
    return this.http.get(`${this.base}/palpites/${etapaId}/meu`);
  }

  getPalpitesPublicos(etapaId: number) {
    return this.http.get<PalpitePublico[]>(`${this.base}/palpites/${etapaId}/publico`);
  }

  // Ranking
  getRanking() {
    return this.http.get<RankingItem[]>(`${this.base}/ranking`);
  }

  // Admin
  inserirResultado(req: ResultadoRequest) {
    return this.http.post(`${this.base}/admin/resultado`, req, { responseType: 'text' });
  }

  getUsuarios() {
    return this.http.get<any[]>(`${this.base}/admin/resultado/usuarios`);
  }

  alterarRole(id: number, role: string) {
    return this.http.patch(
      `${this.base}/admin/resultado/usuarios/${id}/role`,
      JSON.stringify(role),
      { headers: { 'Content-Type': 'application/json' }, responseType: 'text' }
    );
  }
}
