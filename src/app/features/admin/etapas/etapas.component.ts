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
      <h3>Gerenciar Prazos</h3>
      <span class="sub">Altere o prazo (PrazoQualify) de qualquer etapa</span>
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
              <th>Prazo</th>
              <th>Status</th>
              <th>Novo prazo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (e of etapas(); track e.id) {
              <tr [class.done]="e.encerrada">
                <td class="num">{{ e.numero }}</td>
                <td>
                  <span class="flag">{{ e.pais }}</span>
                  <span class="gp-name">{{ e.nome }}</span>
                </td>
                <td class="date">{{ e.dataCorrida | date:'dd/MM HH:mm' }}</td>
                <td class="date">{{ e.prazoQualify | date:'dd/MM/yy HH:mm' }}</td>
                <td>
                  @if (e.encerrada) {
                    <span class="badge done">Encerrada</span>
                  } @else if (e.prazoExpirado) {
                    <span class="badge exp">Expirado</span>
                  } @else {
                    <span class="badge ok">Aberta</span>
                  }
                </td>
                <td>
                  <input type="datetime-local" class="dt-input"
                         [(ngModel)]="form[e.id]" [disabled]="salvando[e.id]">
                </td>
                <td>
                  <button class="btn-save" (click)="salvar(e)"
                          [disabled]="salvando[e.id] || !form[e.id]">
                    {{ salvando[e.id] ? '...' : 'Salvar' }}
                  </button>
                </td>
              </tr>
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
    .header { padding: 16px 0; border-bottom: 1px solid var(--b1); }
    .header h3 {
      font-family: var(--font-orb); font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px; color: var(--red); margin-bottom: 4px;
    }
    .sub { font-size: var(--sz-sm); color: var(--w45); }

    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: var(--sz-sm); }
    .table th {
      font-size: 11px; font-weight: 700; color: var(--w45); text-transform: uppercase;
      letter-spacing: 1px; padding: 10px 10px; text-align: left;
      border-bottom: 1px solid var(--b1); white-space: nowrap;
    }
    .table td { padding: 8px 10px; border-bottom: 1px solid var(--b1); vertical-align: middle; }
    .table tbody tr { transition: background .1s; }
    .table tbody tr:hover:not(.msg-row) { background: var(--s2); }
    .table tbody tr.done { opacity: .45; }

    .num { font-family: var(--font-orb); font-weight: 700; color: var(--w45); width: 32px; }
    .flag { font-size: 16px; margin-right: 6px; }
    .gp-name { font-weight: 700; }
    .date { color: var(--w45); white-space: nowrap; }

    .badge {
      font-size: 10px; font-weight: 700; padding: 3px 8px;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .badge.ok { background: rgba(0,230,118,.12); color: var(--green); }
    .badge.exp { background: rgba(255,180,0,.12); color: var(--amber); }
    .badge.done { background: var(--s3); color: var(--w45); }

    .dt-input {
      padding: 7px 10px; background: var(--s2); border: 1.5px solid var(--b2);
      color: var(--white); font-size: var(--sz-sm); font-family: var(--font-body);
    }
    .dt-input:focus { outline: none; border-color: var(--red); }
    .dt-input:disabled { opacity: .5; cursor: not-allowed; }

    .btn-save {
      padding: 7px 14px; background: var(--red); border: none;
      color: #fff; font-size: var(--sz-sm); font-weight: 600; cursor: pointer;
    }
    .btn-save:disabled { opacity: .5; cursor: not-allowed; }

    .msg-row td { padding: 0 10px 8px; }

    .loading { text-align: center; padding: 40px; color: var(--w45); }
  `]
})
export class EtapasAdminComponent implements OnInit {
  private api = inject(ApiService);

  etapas  = signal<any[]>([]);
  loading = signal(true);

  form:      Record<number, string>  = {};
  salvando:  Record<number, boolean> = {};
  mensagens: Record<number, string>  = {};
  erros:     Record<number, boolean> = {};

  ngOnInit() {
    this.api.getEtapasAdmin().subscribe({
      next: etapas => {
        this.etapas.set(etapas);
        etapas.forEach((e: any) => {
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

  toDatetimeLocal(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const offset = d.getTimezoneOffset() * 60000;
    const local  = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 16);
  }

  toUtcIso(datetimeLocal: string): string {
    return new Date(datetimeLocal).toISOString();
  }

  salvar(etapa: any) {
    const novoValor = this.form[etapa.id];
    if (!novoValor) return;

    this.salvando[etapa.id]  = true;
    this.mensagens[etapa.id] = '';

    const novoPrazoUtc = this.toUtcIso(novoValor);

    this.api.atualizarPrazo(etapa.id, novoPrazoUtc).subscribe({
      next: () => {
        this.salvando[etapa.id]  = false;
        this.erros[etapa.id]     = false;
        this.mensagens[etapa.id] = `Prazo de ${etapa.pais} ${etapa.nome} atualizado!`;

        const idx = this.etapas().findIndex((e: any) => e.id === etapa.id);
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
