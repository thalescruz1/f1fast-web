// ============================================================
// COMPONENTE: EtapasAdminComponent
// ============================================================
// Tela do painel admin em /admin/etapas — "Gerenciar Prazos".
// Permite ao administrador visualizar e editar o PrazoQualify
// (prazo de apostas) de qualquer etapa do calendário.
//
// Caso de uso principal: reabrir apostas de uma corrida cujo
// prazo já passou (ex: qualifying atrasado, data errada).
//
// Cada linha da tabela tem um input datetime-local independente
// e um botão "Salvar" com loading state individual (usando um
// Record<number, boolean> indexado pelo id da etapa).
//
// IMPORTANTE: as datas vêm da API em UTC. O input datetime-local
// do HTML trabalha no horário LOCAL do navegador. O método
// toDatetimeLocal() faz a conversão para exibição correta,
// e ao salvar enviamos de volta em UTC para a API.
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-etapas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <h3>Gerenciar Prazos de Apostas</h3>
      <span class="sub">Altere o prazo (PrazoQualify) de qualquer etapa para abrir ou fechar apostas.</span>
    </div>

    @if (loading()) {
      <div class="loading">Carregando etapas...</div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>GP</th>
              <th>Corrida</th>
              <th>Prazo atual</th>
              <th>Status</th>
              <th>Novo prazo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (e of etapas(); track e.id) {
              <!-- Linha dimmed quando a etapa está encerrada -->
              <tr [class.done]="e.encerrada">
                <td class="num">{{ e.numero }}</td>
                <td>
                  <span class="flag">{{ e.pais }}</span>
                  <span class="gp-name">{{ e.nome }}</span>
                </td>
                <!-- | date pipe: formata a data UTC para exibição local -->
                <td class="date">{{ e.dataCorrida | date:'dd/MM HH:mm' }}</td>
                <td class="date">{{ e.prazoQualify | date:'dd/MM/yy HH:mm' }}</td>
                <td>
                  <!-- Badge de status visual -->
                  @if (e.encerrada) {
                    <span class="badge badge-done">🔒 Encerrada</span>
                  } @else if (e.prazoExpirado) {
                    <span class="badge badge-exp">⏱ Expirado</span>
                  } @else {
                    <span class="badge badge-ok">✅ Aberta</span>
                  }
                </td>
                <td>
                  <!-- input datetime-local: permite editar data e hora localmente.
                       [(ngModel)]="form[e.id]" = two-way binding com o map de valores.
                       [disabled]="salvando[e.id]" = bloqueia durante o salvamento. -->
                  <input
                    type="datetime-local"
                    class="dt-input"
                    [(ngModel)]="form[e.id]"
                    [disabled]="salvando[e.id]"
                  >
                </td>
                <td>
                  <button
                    class="btn btn-red btn-sm"
                    (click)="salvar(e)"
                    [disabled]="salvando[e.id] || !form[e.id]"
                  >
                    {{ salvando[e.id] ? '...' : 'Salvar' }}
                  </button>
                </td>
              </tr>
              <!-- Mensagem de feedback inline por linha -->
              @if (mensagens[e.id]) {
                <tr class="msg-row">
                  <td colspan="7">
                    <div class="msg" [class.error]="erros[e.id]">{{ mensagens[e.id] }}</div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .header { padding: 16px 20px; border-bottom: 1px solid #E0E0E0; }
    .header h3 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
    .sub { font-size: 12px; color: #6B6B6B; }

    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .table th { font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase;
                letter-spacing: 1px; padding: 10px 12px; text-align: left;
                border-bottom: 1px solid #E0E0E0; white-space: nowrap; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #E0E0E0; vertical-align: middle; }
    .table tbody tr:hover:not(.msg-row) { background: #FAFAFA; }

    /* Linha de etapa encerrada fica com menor opacidade */
    .table tbody tr.done { opacity: 0.45; }

    .num { font-weight: 700; color: #6B6B6B; width: 32px; }
    .flag { font-size: 18px; margin-right: 6px; }
    .gp-name { font-weight: 600; }
    .date { color: #6B6B6B; white-space: nowrap; }

    /* Badges de status */
    .badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
    .badge-ok   { background: rgba(22,163,74,0.1);   color: #166534; }
    .badge-exp  { background: rgba(234,179,8,0.12);  color: #854D0E; }
    .badge-done { background: rgba(0,0,0,0.06);      color: #6B6B6B; }

    /* Input de data/hora */
    .dt-input { padding: 6px 8px; border: 1px solid #E0E0E0; border-radius: 5px;
                font-size: 12px; font-family: inherit; color: #1A1A1A; }
    .dt-input:focus { outline: none; border-color: #0057E1; }
    .dt-input:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Botões */
    .btn { padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600;
           cursor: pointer; border: none; }
    .btn-red { background: #0057E1; color: white; }
    .btn-red:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-sm { padding: 5px 12px; }

    /* Linha de feedback */
    .msg-row td { padding: 0 12px 8px; }
    .msg { padding: 7px 12px; border-radius: 5px; font-size: 12px;
           background: #dcfce7; color: #166534; }
    .msg.error { background: #fee2e2; color: #991b1b; }

    .loading { text-align: center; padding: 40px; color: #6B6B6B; }
  `]
})
export class EtapasAdminComponent implements OnInit {
  private api = inject(ApiService);

  etapas  = signal<any[]>([]);
  loading = signal(true);

  // Record<number, string> = mapa de id da etapa → valor do input datetime-local.
  // Pré-populado com o prazo atual de cada etapa ao carregar.
  form:      Record<number, string>  = {};

  // Record<number, boolean> = mapa de id da etapa → estado de loading individual.
  // Cada linha tem seu próprio estado para não bloquear as demais.
  salvando:  Record<number, boolean> = {};

  // Record<number, string> e Record<number, boolean> para mensagens por linha.
  mensagens: Record<number, string>  = {};
  erros:     Record<number, boolean> = {};

  ngOnInit() {
    this.api.getEtapasAdmin().subscribe({
      next: etapas => {
        this.etapas.set(etapas);
        // Pré-preenche o campo "Novo prazo" com o prazo atual de cada etapa.
        // toDatetimeLocal() converte a string ISO UTC para o formato aceito
        // pelo input datetime-local (YYYY-MM-DDTHH:mm, horário local).
        etapas.forEach(e => {
          this.form[e.id]     = this.toDatetimeLocal(e.prazoQualify);
          this.salvando[e.id] = false;
          this.mensagens[e.id] = '';
          this.erros[e.id]    = false;
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // Converte uma string ISO 8601 UTC (ex: "2026-03-14T12:00:00Z")
  // para o formato do input datetime-local (ex: "2026-03-14T09:00")
  // considerando o fuso horário LOCAL do navegador.
  toDatetimeLocal(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    // Offset em milissegundos entre UTC e o fuso local
    const offset = d.getTimezoneOffset() * 60000;
    // Subtrai o offset para converter de UTC para local
    const local  = new Date(d.getTime() - offset);
    // slice(0, 16) = remove os segundos e o "Z" → "YYYY-MM-DDTHH:mm"
    return local.toISOString().slice(0, 16);
  }

  // Converte o valor do input datetime-local (horário local) de volta para UTC ISO 8601.
  // O backend espera UTC para armazenar corretamente no banco.
  toUtcIso(datetimeLocal: string): string {
    // new Date(string sem timezone) = interpreta como horário LOCAL
    return new Date(datetimeLocal).toISOString();
  }

  // Salva o novo prazo de uma etapa específica.
  // Usa o id da etapa como chave nos Records para ter estado independente por linha.
  salvar(etapa: any) {
    const novoValor = this.form[etapa.id];
    if (!novoValor) return;

    this.salvando[etapa.id]  = true;
    this.mensagens[etapa.id] = '';

    // Converte o valor local do input para UTC antes de enviar para a API
    const novoPrazoUtc = this.toUtcIso(novoValor);

    this.api.atualizarPrazo(etapa.id, novoPrazoUtc).subscribe({
      next: () => {
        this.salvando[etapa.id]  = false;
        this.erros[etapa.id]     = false;
        this.mensagens[etapa.id] = `✅ Prazo de ${etapa.pais} ${etapa.nome} atualizado!`;

        // Atualiza o prazo na lista local para refletir a mudança imediatamente
        // sem precisar recarregar a página
        const idx = this.etapas().findIndex(e => e.id === etapa.id);
        if (idx !== -1) {
          const lista = [...this.etapas()];
          lista[idx] = { ...lista[idx], prazoQualify: novoPrazoUtc, prazoExpirado: new Date(novoPrazoUtc) < new Date() };
          this.etapas.set(lista);
        }
      },
      error: (err) => {
        this.salvando[etapa.id]  = false;
        this.erros[etapa.id]     = true;
        this.mensagens[etapa.id] = err.error || 'Erro ao salvar prazo.';
      }
    });
  }
}
