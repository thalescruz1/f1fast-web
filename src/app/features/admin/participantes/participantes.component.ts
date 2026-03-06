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
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Login</th>
            <th>E-mail</th>
            <th>Localização</th>
            <th>Cadastro</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          @for (u of usuarios(); track u.id) {
            <tr>
              <td><div class="name">{{ u.nome }} {{ u.sobrenome }}</div></td>
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
    }

    @if (mensagem()) {
      <div class="msg" style="margin:16px 20px">{{ mensagem() }}</div>
    }
  `,
  styles: [`
    .header { padding: 16px 20px; border-bottom: 1px solid #E0E0E0; display: flex; justify-content: space-between; align-items: center; }
    .header h3 { font-size: 15px; font-weight: 700; }
    .count { font-size: 12px; color: #6B6B6B; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { font-size: 11px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 1px; padding: 10px 16px; text-align: left; border-bottom: 1px solid #E0E0E0; }
    .table td { padding: 10px 16px; border-bottom: 1px solid #E0E0E0; font-size: 13px; }
    .table tbody tr:hover { background: #FAFAFA; }
    .name { font-weight: 600; }
    .muted { color: #6B6B6B; }
    .role-select { padding: 4px 8px; border: 1px solid #E0E0E0; border-radius: 4px; font-size: 12px; font-family: inherit; }
    .msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; background: #dcfce7; color: #166534; }
    .loading { text-align: center; padding: 40px; color: #6B6B6B; }
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
      next:  () => this.mensagem.set(`Role atualizada para ${role}. ✅`),
      error: () => this.mensagem.set('Erro ao atualizar role.')
    });
  }
}
