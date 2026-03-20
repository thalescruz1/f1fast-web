import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Piloto, Etapa, ResultadoRequest } from '../../../core/models';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <h3>Inserir Resultado</h3>
      <select class="adm-select" style="width:220px" [(ngModel)]="etapaSelecionadaId">
        <option [ngValue]="0">Selecione a etapa</option>
        @for (e of etapas(); track e.id) {
          <option [ngValue]="e.id" [disabled]="e.encerrada">
            {{ e.pais }} {{ e.nome }} {{ e.encerrada ? '(enc.)' : '' }}
          </option>
        }
      </select>
    </div>

    <div class="form">
      <div class="form-row">
        <label class="form-label pole">Pole</label>
        <select class="adm-select" [(ngModel)]="form['poleId']">
          <option [ngValue]="0">Selecione o Pole Position</option>
          @for (p of pilotos(); track p.id) {
            <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }}</option>
          }
        </select>
      </div>

      @for (pos of posicoes; track pos.key) {
        <div class="form-row">
          <label class="form-label">{{ pos.label }}</label>
          <select class="adm-select" [(ngModel)]="form[pos.key]">
            <option [ngValue]="0">Selecione</option>
            @for (p of pilotos(); track p.id) {
              <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }}</option>
            }
          </select>
        </div>
      }

      <div class="form-row">
        <label class="form-label mv">Mel. Volta</label>
        <select class="adm-select" [(ngModel)]="form['melhorVoltaId']">
          <option [ngValue]="0">Selecione</option>
          @for (p of pilotos(); track p.id) {
            <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }}</option>
          }
        </select>
      </div>

      @if (mensagem()) {
        <div class="msg" [class.error]="msgErro()" [class.success]="!msgErro()">{{ mensagem() }}</div>
      }

      <div class="form-footer">
        <button class="btn-ghost" (click)="resetForm()">Limpar</button>
        <button class="btn-red" (click)="salvar()" [disabled]="salvando()">
          {{ salvando() ? 'Salvando...' : 'Salvar e Calcular Pontos' }}
        </button>
      </div>
    </div>
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
    .form { padding: 20px 0; display: flex; flex-direction: column; gap: 10px; }
    .form-row { display: grid; grid-template-columns: 100px 1fr; gap: 12px; align-items: center; }
    .form-label {
      font-size: var(--sz-sm); font-weight: 700; color: var(--w45);
      text-align: right; text-transform: uppercase; letter-spacing: .5px;
    }
    .form-label.pole { color: var(--gold); }
    .form-label.mv { color: var(--green); }

    .adm-select {
      width: 100%; padding: 10px 12px;
      background: var(--s2); border: 1.5px solid var(--b2);
      color: var(--white); font-size: var(--sz-sm); font-family: var(--font-body);
    }
    .adm-select:focus { outline: none; border-color: var(--red); }
    .adm-select option { background: var(--s2); color: var(--white); }

    .form-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding-top: 16px; border-top: 1px solid var(--b1);
    }
    .btn-ghost {
      padding: 10px 20px; background: transparent; border: 1.5px solid var(--b3);
      color: var(--w70); font-size: var(--sz-sm); font-weight: 600; cursor: pointer;
    }
    .btn-red {
      padding: 10px 20px; background: var(--red); border: 1.5px solid var(--red);
      color: #fff; font-size: var(--sz-sm); font-weight: 600; cursor: pointer;
    }
    .btn-red:disabled { opacity: .5; cursor: not-allowed; }
  `]
})
export class ResultadoComponent implements OnInit {
  private api = inject(ApiService);

  pilotos  = signal<Piloto[]>([]);
  etapas   = signal<Etapa[]>([]);
  salvando = signal(false);
  mensagem = signal('');
  msgErro  = signal(false);

  etapaSelecionadaId = 0;

  form: Record<string, number> = {
    poleId: 0, pos1Id: 0, pos2Id: 0, pos3Id: 0, pos4Id: 0,
    pos5Id: 0, pos6Id: 0, pos7Id: 0, pos8Id: 0, pos9Id: 0,
    pos10Id: 0, pos11Id: 0, melhorVoltaId: 0
  };

  posicoes = [
    { key: 'pos1Id',  label: '1°' }, { key: 'pos2Id',  label: '2°' },
    { key: 'pos3Id',  label: '3°' }, { key: 'pos4Id',  label: '4°' },
    { key: 'pos5Id',  label: '5°' }, { key: 'pos6Id',  label: '6°' },
    { key: 'pos7Id',  label: '7°' }, { key: 'pos8Id',  label: '8°' },
    { key: 'pos9Id',  label: '9°' }, { key: 'pos10Id', label: '10°' },
    { key: 'pos11Id', label: '11°' }
  ];

  ngOnInit() {
    this.api.getPilotos().subscribe(p => this.pilotos.set(p));
    this.api.getEtapas().subscribe(e => this.etapas.set(e));
  }

  resetForm() {
    Object.keys(this.form).forEach(k => this.form[k] = 0);
    this.mensagem.set('');
  }

  salvar() {
    if (this.etapaSelecionadaId === 0) { this.setMsg('Selecione uma etapa.', true); return; }
    if (Object.values(this.form).some(v => v === 0)) { this.setMsg('Preencha todas as posições.', true); return; }

    this.salvando.set(true);

    const req: ResultadoRequest = {
      etapaId: this.etapaSelecionadaId,
      poleId: this.form['poleId'],
      pos1Id: this.form['pos1Id'], pos2Id: this.form['pos2Id'],
      pos3Id: this.form['pos3Id'], pos4Id: this.form['pos4Id'],
      pos5Id: this.form['pos5Id'], pos6Id: this.form['pos6Id'],
      pos7Id: this.form['pos7Id'], pos8Id: this.form['pos8Id'],
      pos9Id: this.form['pos9Id'], pos10Id: this.form['pos10Id'],
      pos11Id: this.form['pos11Id'],
      melhorVoltaId: this.form['melhorVoltaId']
    };

    this.api.inserirResultado(req).subscribe({
      next:  () => { this.setMsg('Resultado salvo e pontos calculados!', false); this.salvando.set(false); },
      error: e  => { this.setMsg(e.error || 'Erro ao salvar.', true); this.salvando.set(false); }
    });
  }

  private setMsg(msg: string, erro: boolean) {
    this.mensagem.set(msg); this.msgErro.set(erro);
  }
}
