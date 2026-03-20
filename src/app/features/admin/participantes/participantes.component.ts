import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header">
      <h3>Participantes</h3>
      <span class="count">{{ usuarios().length }} cadastrados</span>
    </div>

    @if (loading()) {
      <div class="loading">Carregando...</div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Login</th>
              <th>E-mail</th>
              <th>Local</th>
              <th>Cadastro</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            @for (u of usuarios(); track u.id) {
              <tr>
                <td><span class="name">{{ u.nome }} {{ u.sobrenome }}</span></td>
                <td class="muted">{{ u.login }}</td>
                <td class="muted">{{ u.email }}</td>
                <td class="muted">{{ u.localizacao }}</td>
                <td class="muted">{{ u.criadoEm | date:'dd/MM/yyyy' }}</td>
                <td>
                  <select class="role-select" [value]="u.role" (change)="alterarRole(u.id, $event)">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    @if (mensagem()) {
      <div class="msg" style="margin-top:16px">{{ mensagem() }}</div>
    }
  `,
  styles: [`
    .header {
      padding: 16px 0; border-bottom: 1px solid var(--b1);
      display: flex; justify-content: space-between; align-items: center;
    }
    .header h3 {
      font-family: var(--font-orb); font-size: 12px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px; color: var(--red);
    }
    .count { font-size: var(--sz-sm); color: var(--w45); }

    .table-wrap { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; }
    .table th {
      font-size: 11px; font-weight: 700; color: var(--w45);
      text-transform: uppercase; letter-spacing: 1px; padding: 12px 14px;
      text-align: left; border-bottom: 1px solid var(--b1);
    }
    .table td { padding: 10px 14px; border-bottom: 1px solid var(--b1); font-size: var(--sz-sm); }
    .table tbody tr { transition: background .1s; }
    .table tbody tr:hover { background: var(--s2); }
    .name { font-weight: 700; }
    .muted { color: var(--w45); }

    .role-select {
      padding: 5px 10px; background: var(--s2); border: 1.5px solid var(--b2);
      color: var(--white); font-size: var(--sz-sm); font-family: var(--font-body);
    }
    .role-select option { background: var(--s2); color: var(--white); }

    .loading { text-align: center; padding: 40px; color: var(--w45); }
  `]
})
export class ParticipantesComponent implements OnInit {
  private api = inject(ApiService);

  usuarios = signal<any[]>([]);
  loading  = signal(true);
  mensagem = signal('');

  ngOnInit() {
    this.api.getUsuarios().subscribe({
      next:  u => { this.usuarios.set(u); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  alterarRole(id: number, event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    this.api.alterarRole(id, role).subscribe({
      next:  () => this.mensagem.set(`Role atualizada para ${role}.`),
      error: () => this.mensagem.set('Erro ao atualizar role.')
    });
  }
}
