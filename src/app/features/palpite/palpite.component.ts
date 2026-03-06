import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Piloto, Etapa, PalpiteRequest } from '../../core/models';

@Component({
  selector: 'app-palpite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="section-head">
        <h2>Fazer Palpite</h2>
        <p>Escolha Pole, 1° ao 10° e Melhor Volta. Envie antes do prazo!</p>
      </div>

      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (!proximaEtapa()) {
        <div class="card empty">Não há etapas disponíveis para palpite no momento.</div>
      } @else {
        <div class="bolao-layout">
          <div class="card">
            <div class="bolao-header">
              <h3>{{ proximaEtapa()!.pais }} {{ proximaEtapa()!.nome }}</h3>
              <span class="deadline-tag">⏱ Prazo: {{ proximaEtapa()!.prazoQualify | date:'dd/MM HH:mm' }}</span>
            </div>
            <div class="bolao-form">

              <div class="form-row">
                <label class="form-label pole">Pole</label>
                <select class="form-select" [(ngModel)]="form['poleId']">
                  <option [ngValue]="0">Selecione o Pole Position</option>
                  @for (p of pilotos(); track p.id) {
                    <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }} ({{ p.equipe }})</option>
                  }
                </select>
              </div>

              <div class="divider"></div>

              @for (pos of posicoes; track pos.key) {
                <div class="form-row">
                  <label class="form-label">{{ pos.label }}</label>
                  <select class="form-select" [(ngModel)]="form[pos.key]">
                    <option [ngValue]="0">Selecione</option>
                    @for (p of pilotosDisponiveis(pos.key); track p.id) {
                      <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }} ({{ p.equipe }})</option>
                    }
                  </select>
                </div>
              }

              <div class="divider"></div>

              <div class="form-row">
                <label class="form-label mv">Mel. Volta</label>
                <select class="form-select" [(ngModel)]="form['melhorVoltaId']">
                  <option [ngValue]="0">Selecione a Melhor Volta</option>
                  @for (p of pilotos(); track p.id) {
                    <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }}</option>
                  }
                </select>
              </div>

              <div class="form-footer">
                <span class="form-info">Máximo: <strong>35 pontos</strong></span>
                <button class="btn btn-red" (click)="enviar()" [disabled]="enviando()">
                  {{ enviando() ? 'Enviando...' : 'Enviar Palpite' }}
                </button>
              </div>

              @if (mensagem()) {
                <div class="msg" [class.error]="msgErro()">{{ mensagem() }}</div>
              }
            </div>
          </div>

          <div class="card">
            <div class="drivers-header">
              <h4>Grid 2026</h4>
              <input class="search-input" placeholder="Buscar piloto..." [(ngModel)]="busca">
            </div>
            <div class="drivers-list">
              @for (p of pilotosFiltrados(); track p.id) {
                <div class="driver-row">
                  <div class="driver-num">{{ p.numero }}</div>
                  <div class="team-bar" [style.background]="p.corEquipe"></div>
                  <div>
                    <div class="driver-name">{{ p.nome }}</div>
                    <div class="driver-team">{{ p.equipe }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bolao-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
    .bolao-header { padding: 16px 20px; border-bottom: 1px solid #E0E0E0; display: flex; justify-content: space-between; align-items: center; }
    .bolao-header h3 { font-size: 15px; font-weight: 700; }
    .deadline-tag { font-size: 12px; color: #E10600; font-weight: 600; background: rgba(225,6,0,0.07); padding: 4px 10px; border-radius: 20px; }
    .bolao-form { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .form-row { display: grid; grid-template-columns: 80px 1fr; gap: 12px; align-items: center; }
    .form-label { font-size: 12px; font-weight: 600; color: #6B6B6B; text-align: right; }
    .form-label.pole { color: #E5A800; } .form-label.mv { color: #16A34A; }
    .form-select { width: 100%; padding: 9px 12px; background: white; border: 1px solid #E0E0E0; border-radius: 6px; font-size: 13px; }
    .form-select:focus { outline: none; border-color: #E10600; }
    .divider { height: 1px; background: #E0E0E0; margin: 4px 0; }
    .form-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #E0E0E0; }
    .form-info { font-size: 12px; color: #6B6B6B; }
    .msg { margin-top: 8px; padding: 10px 14px; border-radius: 6px; font-size: 13px; background: #dcfce7; color: #166534; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .drivers-header { padding: 14px 16px; border-bottom: 1px solid #E0E0E0; }
    .drivers-header h4 { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .search-input { width: 100%; padding: 7px 10px; border: 1px solid #E0E0E0; border-radius: 5px; font-size: 13px; }
    .drivers-list { max-height: 560px; overflow-y: auto; }
    .driver-row { display: flex; align-items: center; gap: 10px; padding: 9px 14px; border-bottom: 1px solid #E0E0E0; font-size: 13px; }
    .driver-num { font-weight: 700; color: #6B6B6B; min-width: 28px; }
    .team-bar { width: 3px; height: 20px; border-radius: 2px; flex-shrink: 0; }
    .driver-name { font-weight: 500; }
    .driver-team { font-size: 11px; color: #6B6B6B; }
    .loading, .empty { text-align: center; padding: 40px; color: #6B6B6B; }
    @media (max-width: 768px) { .bolao-layout { grid-template-columns: 1fr; } }
  `]
})
export class PalpiteComponent implements OnInit {
  private api = inject(ApiService);

  pilotos      = signal<Piloto[]>([]);
  proximaEtapa = signal<Etapa | null>(null);
  loading      = signal(true);
  enviando     = signal(false);
  mensagem     = signal('');
  msgErro      = signal(false);
  busca        = '';

  form: Record<string, number> = {
    poleId: 0, pos1Id: 0, pos2Id: 0, pos3Id: 0, pos4Id: 0,
    pos5Id: 0, pos6Id: 0, pos7Id: 0, pos8Id: 0, pos9Id: 0,
    pos10Id: 0, melhorVoltaId: 0
  };

  posicoes = [
    { key: 'pos1Id', label: '1°' }, { key: 'pos2Id',  label: '2°'  },
    { key: 'pos3Id', label: '3°' }, { key: 'pos4Id',  label: '4°'  },
    { key: 'pos5Id', label: '5°' }, { key: 'pos6Id',  label: '6°'  },
    { key: 'pos7Id', label: '7°' }, { key: 'pos8Id',  label: '8°'  },
    { key: 'pos9Id', label: '9°' }, { key: 'pos10Id', label: '10°' }
  ];

  ngOnInit() {
    this.api.getPilotos().subscribe(p => this.pilotos.set(p));
    this.api.getProximaEtapa().subscribe({
      next:  e => { this.proximaEtapa.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  pilotosDisponiveis(chaveAtual: string): Piloto[] {
    const selecionados = Object.entries(this.form)
      .filter(([k, v]) => k !== chaveAtual && k.startsWith('pos') && v !== 0)
      .map(([, v]) => v);
    return this.pilotos().filter(p => !selecionados.includes(p.id));
  }

  pilotosFiltrados(): Piloto[] {
    if (!this.busca) return this.pilotos();
    const b = this.busca.toLowerCase();
    return this.pilotos().filter(p =>
      p.nome.toLowerCase().includes(b) || p.equipe.toLowerCase().includes(b)
    );
  }

  enviar() {
    const etapa = this.proximaEtapa();
    if (!etapa) return;
    if (this.form['poleId'] === 0) { this.setMsg('Selecione o Pole Position.', true); return; }
    if (this.posicoes.some(p => this.form[p.key] === 0)) { this.setMsg('Preencha todas as 10 posições.', true); return; }
    if (this.form['melhorVoltaId'] === 0) { this.setMsg('Selecione a Melhor Volta.', true); return; }

    this.enviando.set(true);

    const req: PalpiteRequest = {
      etapaId: etapa.id,
      poleId: this.form['poleId'],
      pos1Id: this.form['pos1Id'], pos2Id: this.form['pos2Id'],
      pos3Id: this.form['pos3Id'], pos4Id: this.form['pos4Id'],
      pos5Id: this.form['pos5Id'], pos6Id: this.form['pos6Id'],
      pos7Id: this.form['pos7Id'], pos8Id: this.form['pos8Id'],
      pos9Id: this.form['pos9Id'], pos10Id: this.form['pos10Id'],
      melhorVoltaId: this.form['melhorVoltaId']
    };

    this.api.enviarPalpite(req).subscribe({
      next:  () => { this.setMsg('Palpite enviado com sucesso! ✅', false); this.enviando.set(false); },
      error: e  => { this.setMsg(e.error || 'Erro ao enviar.', true); this.enviando.set(false); }
    });
  }

  private setMsg(msg: string, erro: boolean) {
    this.mensagem.set(msg); this.msgErro.set(erro);
  }
}
