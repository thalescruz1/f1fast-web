import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

interface LogItem {
  id: number;
  dataHora: string;
  acao: string;
  usuarioId: number | null;
  usuarioLogin: string | null;
  entidade: string | null;
  entidadeId: number | null;
  detalhes: string | null;
  sucesso: boolean;
  ip: string | null;
}

@Component({
  selector: 'app-logs-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <h3>Logs de Auditoria</h3>
      <span class="sub">Registro das principais ações do sistema</span>
    </div>

    <div class="filtros">
      <div class="filtro-group">
        <label>Ação</label>
        <select [(ngModel)]="filtroAcao" (change)="buscar()">
          <option value="">Todas</option>
          @for (a of acoes; track a) {
            <option [value]="a">{{ a }}</option>
          }
        </select>
      </div>
      <div class="filtro-group">
        <label>Login</label>
        <input type="text" [(ngModel)]="filtroLogin" placeholder="Buscar por login..." (keyup.enter)="buscar()" />
      </div>
      <div class="filtro-group">
        <label>Limite</label>
        <select [(ngModel)]="limite" (change)="buscar()">
          <option [value]="50">50</option>
          <option [value]="100">100</option>
          <option [value]="200">200</option>
          <option [value]="500">500</option>
        </select>
      </div>
      <button class="btn-buscar" (click)="buscar()">Buscar</button>
    </div>

    @if (loading()) {
      <div class="loading">Carregando logs...</div>
    } @else if (logs().length === 0) {
      <div class="empty">Nenhum log encontrado.</div>
    } @else {
      <div class="stats">
        <span class="stat-count">{{ logs().length }} registros</span>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Ação</th>
              <th>Usuário</th>
              <th>Entidade</th>
              <th>Detalhes</th>
              <th>Status</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            @for (log of logs(); track log.id) {
              <tr [class.falha]="!log.sucesso">
                <td class="col-data">{{ formatData(log.dataHora) }}</td>
                <td><span class="badge" [class]="badgeClass(log.acao)">{{ log.acao }}</span></td>
                <td class="col-user">{{ log.usuarioLogin || '—' }}</td>
                <td class="col-ent">
                  @if (log.entidade) {
                    {{ log.entidade }}
                    @if (log.entidadeId) {
                      <span class="ent-id">#{{ log.entidadeId }}</span>
                    }
                  } @else {
                    —
                  }
                </td>
                <td class="col-det">{{ log.detalhes || '—' }}</td>
                <td>
                  @if (log.sucesso) {
                    <span class="status-ok">OK</span>
                  } @else {
                    <span class="status-fail">FALHA</span>
                  }
                </td>
                <td class="col-ip">{{ log.ip || '—' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .header h3 {
      font-family: var(--font-cond); font-size: var(--sz-lg); font-weight: 800;
      text-transform: uppercase; color: var(--white); margin: 0;
    }
    .header .sub { font-size: var(--sz-sm); color: var(--w45); margin-top: 4px; }
    .header { margin-bottom: 20px; }

    .filtros {
      display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;
      margin-bottom: 16px; padding: 14px; background: var(--s2);
      border: 1px solid var(--b1);
    }
    .filtro-group { display: flex; flex-direction: column; gap: 4px; }
    .filtro-group label {
      font-family: var(--font-orb); font-size: 9px; font-weight: 700;
      color: var(--w45); letter-spacing: 1.5px; text-transform: uppercase;
    }
    .filtro-group select, .filtro-group input {
      background: var(--s1); border: 1px solid var(--b1); color: var(--white);
      padding: 8px 10px; font-size: var(--sz-sm); font-family: var(--font-body);
      min-width: 140px;
    }
    .filtro-group input { min-width: 180px; }
    .btn-buscar {
      background: var(--red); color: var(--white); border: none;
      padding: 8px 20px; font-family: var(--font-cond); font-weight: 700;
      text-transform: uppercase; font-size: var(--sz-sm); cursor: pointer;
      letter-spacing: 1px; transition: opacity .15s;
    }
    .btn-buscar:hover { opacity: .85; }

    .stats { margin-bottom: 8px; }
    .stat-count { font-size: var(--sz-xs); color: var(--w45); font-family: var(--font-orb); }

    .table-wrap { overflow-x: auto; }
    .table {
      width: 100%; border-collapse: collapse; font-size: var(--sz-sm);
    }
    .table th {
      background: var(--s2); color: var(--w70); font-family: var(--font-orb);
      font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; text-align: left;
      padding: 10px 8px; border-bottom: 1px solid var(--b1);
      white-space: nowrap;
    }
    .table td {
      padding: 8px; border-bottom: 1px solid var(--b1);
      color: var(--w70); vertical-align: top;
    }
    .table tr:hover td { background: var(--s2); }
    .table tr.falha td { background: rgba(232,0,26,.04); }

    .col-data { font-family: var(--font-orb); font-size: 10px; white-space: nowrap; color: var(--w45); }
    .col-user { font-weight: 600; color: var(--white); }
    .col-ent { white-space: nowrap; }
    .ent-id { color: var(--w45); font-size: 10px; margin-left: 2px; }
    .col-det { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-ip { font-family: var(--font-orb); font-size: 10px; color: var(--w45); white-space: nowrap; }

    .badge {
      display: inline-block; padding: 2px 8px; font-size: 9px;
      font-family: var(--font-orb); font-weight: 700; letter-spacing: 1px;
      border: 1px solid var(--b1); white-space: nowrap;
    }
    .badge.auth { background: rgba(0,180,255,.1); color: #0bb4ff; border-color: rgba(0,180,255,.25); }
    .badge.palpite { background: rgba(0,200,120,.1); color: var(--green); border-color: rgba(0,200,120,.25); }
    .badge.admin-act { background: rgba(255,180,0,.1); color: var(--amber); border-color: rgba(255,180,0,.25); }
    .badge.falha { background: rgba(232,0,26,.1); color: var(--red); border-color: rgba(232,0,26,.25); }
    .badge.notif { background: rgba(160,80,255,.1); color: #a050ff; border-color: rgba(160,80,255,.25); }

    .status-ok { color: var(--green); font-family: var(--font-orb); font-size: 9px; font-weight: 700; }
    .status-fail { color: var(--red); font-family: var(--font-orb); font-size: 9px; font-weight: 700; }

    .loading, .empty { color: var(--w45); padding: 40px 0; text-align: center; }

    @media (max-width: 768px) {
      .filtros { flex-direction: column; }
      .filtro-group select, .filtro-group input { min-width: 100%; }
    }
  `]
})
export class LogsAdminComponent implements OnInit {
  private api = inject(ApiService);

  logs = signal<LogItem[]>([]);
  loading = signal(true);

  filtroAcao = '';
  filtroLogin = '';
  limite = 200;

  acoes = [
    'LOGIN_OK', 'LOGIN_FALHA', 'CADASTRO',
    'RESET_SENHA_SOLICITADO', 'RESET_SENHA_OK',
    'PALPITE_ENVIADO',
    'RESULTADO_LANCADO', 'ROLE_ALTERADA',
    'PRAZO_ALTERADO', 'ETAPA_CANCELADA',
    'LEMBRETE_ENVIADO', 'LEMBRETE_URGENTE'
  ];

  ngOnInit() { this.buscar(); }

  buscar() {
    this.loading.set(true);
    const params: any = { limite: this.limite };
    if (this.filtroAcao) params.acao = this.filtroAcao;
    if (this.filtroLogin) params.login = this.filtroLogin;

    this.api.getLogs(params).subscribe({
      next: (data) => { this.logs.set(data); this.loading.set(false); },
      error: () => { this.logs.set([]); this.loading.set(false); }
    });
  }

  formatData(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  badgeClass(acao: string): string {
    if (acao.includes('LOGIN') || acao.includes('CADASTRO') || acao.includes('RESET')) return 'auth';
    if (acao.includes('PALPITE')) return 'palpite';
    if (acao.includes('FALHA')) return 'falha';
    if (acao.includes('LEMBRETE')) return 'notif';
    return 'admin-act';
  }
}
