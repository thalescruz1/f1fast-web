import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PilotoAdmin, EquipeAdmin } from '../../../core/models';

@Component({
  selector: 'app-pilotos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <h3>Gerenciar Pilotos</h3>
      <span class="sub">Adicione substitutos, troque a equipe ou ative/desative pilotos</span>
    </div>

    <!-- Adicionar piloto -->
    <div class="add-box">
      <input class="in in-num" type="number" placeholder="Nº" [(ngModel)]="novoNumero">
      <input class="in in-nome" placeholder="Nome do piloto" [(ngModel)]="novoNome">
      <select class="in in-eq" [(ngModel)]="novoEquipeId">
        <option [ngValue]="0">Equipe</option>
        @for (e of equipes(); track e.id) {
          <option [ngValue]="e.id">{{ e.nome }}</option>
        }
      </select>
      <button class="btn-add" (click)="adicionar()" [disabled]="salvandoNovo">
        {{ salvandoNovo ? 'Adicionando...' : '+ Adicionar' }}
      </button>
    </div>
    @if (msgNovo) {
      <div class="msg" [class.err]="errNovo">{{ msgNovo }}</div>
    }

    @if (loading()) {
      <div class="loading">Carregando pilotos...</div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Piloto</th>
              <th>Equipe</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (p of pilotos(); track p.id) {
              <tr [class.inativo]="!p.ativo">
                <td class="num">{{ p.numero }}</td>
                <td class="nome">
                  <span class="cor" [style.background]="p.equipeCor"></span>{{ p.nome }}
                </td>
                <td>
                  <select class="in in-eq" [ngModel]="p.equipeId"
                          (ngModelChange)="trocarEquipe(p, $event)" [disabled]="salvando[p.id]">
                    @for (e of equipes(); track e.id) {
                      <option [ngValue]="e.id">{{ e.nome }}</option>
                    }
                  </select>
                </td>
                <td>
                  @if (p.ativo) {
                    <span class="badge ok">Ativo</span>
                  } @else {
                    <span class="badge off">Inativo</span>
                  }
                </td>
                <td class="acts">
                  <button class="btn-toggle" [class.reativar]="!p.ativo"
                          (click)="toggleAtivo(p)" [disabled]="salvando[p.id]">
                    {{ salvando[p.id] ? '...' : (p.ativo ? 'Desativar' : 'Ativar') }}
                  </button>
                </td>
              </tr>
              @if (msg[p.id]) {
                <tr class="msg-row">
                  <td colspan="5"><span class="msg" [class.err]="err[p.id]">{{ msg[p.id] }}</span></td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: [`
    .header { padding-bottom: 16px; border-bottom: 1px solid var(--b1); margin-bottom: 16px; }
    .header h3 {
      font-family: var(--font-orb); font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px; color: var(--red);
    }
    .header .sub { font-size: var(--sz-sm); color: var(--w45); }

    .add-box {
      display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
      background: var(--s2); border: 1.5px solid var(--b1); padding: 12px; margin-bottom: 8px;
    }
    .in {
      padding: 8px 10px; background: var(--s1); border: 1.5px solid var(--b2);
      color: var(--white); font-size: var(--sz-sm); font-family: var(--font-body);
    }
    .in:focus { outline: none; border-color: var(--red); }
    .in-num { width: 64px; }
    .in-nome { flex: 1; min-width: 160px; }
    .in-eq { min-width: 150px; }
    .btn-add {
      padding: 8px 16px; background: var(--red); border: none;
      color: #fff; font-size: var(--sz-sm); font-weight: 700; cursor: pointer;
    }
    .btn-add:disabled { opacity: .5; cursor: not-allowed; }

    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; font-size: var(--sz-sm); }
    .table th {
      font-size: 11px; font-weight: 700; color: var(--w45); text-transform: uppercase;
      letter-spacing: 1px; padding: 10px; text-align: left;
      border-bottom: 1px solid var(--b1); white-space: nowrap;
    }
    .table td { padding: 8px 10px; border-bottom: 1px solid var(--b1); vertical-align: middle; }
    .table tbody tr:hover:not(.msg-row) { background: var(--s2); }
    .table tbody tr.inativo { opacity: .5; }

    .num { font-family: var(--font-orb); font-weight: 700; color: var(--w45); width: 44px; }
    .nome { font-weight: 700; white-space: nowrap; }
    .cor { display: inline-block; width: 4px; height: 14px; margin-right: 8px; vertical-align: -2px; border-radius: 1px; }

    .badge { font-size: 10px; font-weight: 700; padding: 3px 8px; text-transform: uppercase; letter-spacing: .5px; }
    .badge.ok  { background: rgba(0,230,118,.12); color: var(--green); }
    .badge.off { background: var(--s3); color: var(--w45); }

    .acts { text-align: right; }
    .btn-toggle {
      padding: 6px 12px; background: transparent; border: 1.5px solid var(--w45);
      color: var(--w45); font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap;
    }
    .btn-toggle:hover:not(:disabled) { border-color: var(--red); color: var(--red); }
    .btn-toggle.reativar { border-color: var(--green); color: var(--green); }
    .btn-toggle.reativar:hover:not(:disabled) { background: rgba(0,230,118,.08); }
    .btn-toggle:disabled { opacity: .5; cursor: not-allowed; }

    .msg { font-size: var(--sz-sm); color: var(--green); padding: 6px 2px; }
    .msg.err { color: var(--red); }
    .msg-row td { padding: 0 10px 8px; }

    .loading { text-align: center; padding: 40px; color: var(--w45); }
  `]
})
export class PilotosAdminComponent implements OnInit {
  private api = inject(ApiService);

  pilotos = signal<PilotoAdmin[]>([]);
  equipes = signal<EquipeAdmin[]>([]);
  loading = signal(true);

  // Form "adicionar"
  novoNumero: number | null = null;
  novoNome = '';
  novoEquipeId = 0;
  salvandoNovo = false;
  msgNovo = '';
  errNovo = false;

  // Estado por linha
  salvando: Record<number, boolean> = {};
  msg: Record<number, string> = {};
  err: Record<number, boolean> = {};

  ngOnInit() {
    this.api.getEquipesAdmin().subscribe({ next: e => this.equipes.set(e) });
    this.carregar();
  }

  private carregar() {
    this.loading.set(true);
    this.api.getPilotosAdmin().subscribe({
      next:  p => { this.pilotos.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  adicionar() {
    if (!this.novoNumero || !this.novoNome.trim() || !this.novoEquipeId) {
      this.setMsgNovo('Preencha número, nome e equipe.', true);
      return;
    }
    this.salvandoNovo = true; this.msgNovo = '';
    this.api.addPiloto({
      numero: this.novoNumero, nome: this.novoNome.trim(), equipeId: this.novoEquipeId, ativo: true
    }).subscribe({
      next: (p) => {
        this.salvandoNovo = false;
        this.setMsgNovo(`${p.nome} adicionado.`, false);
        this.novoNumero = null; this.novoNome = ''; this.novoEquipeId = 0;
        this.carregar();
      },
      error: (e: any) => { this.salvandoNovo = false; this.setMsgNovo(e.error?.mensagem || 'Erro ao adicionar.', true); }
    });
  }

  trocarEquipe(p: PilotoAdmin, equipeId: number) {
    if (equipeId === p.equipeId) return;
    this.atualizar(p, { ...p, equipeId });
  }

  toggleAtivo(p: PilotoAdmin) {
    this.atualizar(p, { ...p, ativo: !p.ativo });
  }

  private atualizar(p: PilotoAdmin, dados: PilotoAdmin) {
    this.salvando[p.id] = true; this.msg[p.id] = '';
    this.api.updatePiloto(p.id, {
      numero: dados.numero, nome: dados.nome, equipeId: dados.equipeId, ativo: dados.ativo
    }).subscribe({
      next: (atualizado) => {
        this.salvando[p.id] = false;
        this.pilotos.update(list => list.map(x => x.id === atualizado.id ? atualizado : x));
        this.setMsg(p.id, 'Atualizado.', false);
      },
      error: (e: any) => {
        this.salvando[p.id] = false;
        this.setMsg(p.id, e.error?.mensagem || 'Erro ao atualizar.', true);
        this.carregar(); // resincroniza o dropdown com o valor real
      }
    });
  }

  private setMsg(id: number, m: string, erro: boolean) {
    this.msg[id] = m; this.err[id] = erro;
    setTimeout(() => { if (this.msg[id] === m) this.msg[id] = ''; }, 3000);
  }

  private setMsgNovo(m: string, erro: boolean) {
    this.msgNovo = m; this.errNovo = erro;
  }
}
