// ============================================================
// COMPONENTE: ResultadoComponent
// ============================================================
// Componente filho do AdminComponent — renderizado em /admin/resultado.
// Permite ao administrador inserir o resultado oficial de uma corrida.
//
// Fluxo completo ao clicar "Salvar e Calcular Pontos":
//   1. Frontend envia o ResultadoRequest para PATCH /admin/resultado
//   2. A API salva o resultado no banco de dados
//   3. A API chama automaticamente o PontuacaoService
//   4. O PontuacaoService compara cada palpite com o resultado
//   5. Os pontos são calculados e salvos na tabela Pontuacao
//   6. O ranking é recalculado
//
// Nota: etapas encerradas aparecem com "✓" e ficam desabilitadas
// no select para evitar reenvio acidental de resultados.
// ============================================================

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
      <!-- Select de etapas: etapas encerradas ficam desabilitadas [disabled]="e.encerrada" -->
      <select class="form-select" style="width:220px" [(ngModel)]="etapaSelecionadaId">
        <option [ngValue]="0">Selecione a etapa</option>
        @for (e of etapas(); track e.id) {
          <option [ngValue]="e.id" [disabled]="e.encerrada">
            {{ e.pais }} {{ e.nome }} {{ e.encerrada ? '✓' : '' }}
          </option>
        }
      </select>
    </div>

    <div class="form">
      <!-- Campo de Pole Position -->
      <div class="form-row">
        <label class="form-label" style="color:#996F00">Pole</label>
        <select class="form-select" [(ngModel)]="form['poleId']">
          <option [ngValue]="0">Selecione o Pole Position</option>
          @for (p of pilotos(); track p.id) {
            <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }}</option>
          }
        </select>
      </div>

      <!-- Campos de 1° ao 10° lugar gerados automaticamente pelo loop -->
      @for (pos of posicoes; track pos.key) {
        <div class="form-row">
          <label class="form-label">{{ pos.label }}</label>
          <select class="form-select" [(ngModel)]="form[pos.key]">
            <option [ngValue]="0">Selecione</option>
            @for (p of pilotos(); track p.id) {
              <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }}</option>
            }
          </select>
        </div>
      }

      <!-- Campo de Melhor Volta -->
      <div class="form-row">
        <label class="form-label" style="color:#16A34A">Mel. Volta</label>
        <select class="form-select" [(ngModel)]="form['melhorVoltaId']">
          <option [ngValue]="0">Selecione</option>
          @for (p of pilotos(); track p.id) {
            <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }}</option>
          }
        </select>
      </div>

      @if (mensagem()) {
        <div class="msg" [class.error]="msgErro()">{{ mensagem() }}</div>
      }

      <div class="form-footer">
        <!-- Botão Limpar: zera todos os selects -->
        <button class="btn btn-ghost" (click)="resetForm()">Limpar</button>
        <!-- Botão principal: salva e dispara o cálculo de pontos -->
        <button class="btn btn-red" (click)="salvar()" [disabled]="salvando()">
          {{ salvando() ? 'Salvando...' : '💾 Salvar e Calcular Pontos' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .header { padding: 16px 20px; border-bottom: 1px solid #E0E0E0; display: flex; justify-content: space-between; align-items: center; }
    .header h3 { font-size: 15px; font-weight: 700; }
    .form { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .form-row { display: grid; grid-template-columns: 100px 1fr; gap: 12px; align-items: center; }
    .form-label { font-size: 12px; font-weight: 600; color: #6B6B6B; text-align: right; }
    .form-select { width: 100%; padding: 9px 12px; background: white; border: 1px solid #E0E0E0; border-radius: 6px; font-size: 13px; font-family: inherit; }
    .form-select:focus { outline: none; border-color: #E10600; }
    .msg { padding: 10px 14px; border-radius: 6px; font-size: 13px; background: #dcfce7; color: #166534; }
    .msg.error { background: #fee2e2; color: #991b1b; }
    .form-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 12px; border-top: 1px solid #E0E0E0; }
    .btn { padding: 8px 16px; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
    .btn-ghost { background: transparent; border: 1px solid #E0E0E0; color: #6B6B6B; }
    .btn-red { background: #E10600; color: white; }
  `]
})
export class ResultadoComponent implements OnInit {
  private api = inject(ApiService);

  pilotos  = signal<Piloto[]>([]);   // 22 pilotos carregados da API
  etapas   = signal<Etapa[]>([]);    // todas as 30 etapas
  salvando = signal(false);
  mensagem = signal('');
  msgErro  = signal(false);

  // ID da etapa selecionada no select do topo. 0 = nenhuma selecionada.
  etapaSelecionadaId = 0;

  // Objeto de formulário com todos os campos de resultado.
  // Estrutura idêntica ao PalpiteComponent, mas sem restrição de pilotos únicos
  // (o admin precisa confirmar o resultado oficial como veio).
  form: Record<string, number> = {
    poleId: 0, pos1Id: 0, pos2Id: 0, pos3Id: 0, pos4Id: 0,
    pos5Id: 0, pos6Id: 0, pos7Id: 0, pos8Id: 0, pos9Id: 0,
    pos10Id: 0, melhorVoltaId: 0
  };

  posicoes = [
    { key: 'pos1Id',  label: '1° lugar'  }, { key: 'pos2Id',  label: '2° lugar'  },
    { key: 'pos3Id',  label: '3° lugar'  }, { key: 'pos4Id',  label: '4° lugar'  },
    { key: 'pos5Id',  label: '5° lugar'  }, { key: 'pos6Id',  label: '6° lugar'  },
    { key: 'pos7Id',  label: '7° lugar'  }, { key: 'pos8Id',  label: '8° lugar'  },
    { key: 'pos9Id',  label: '9° lugar'  }, { key: 'pos10Id', label: '10° lugar' }
  ];

  ngOnInit() {
    // Carrega pilotos e etapas em paralelo para preencher os selects
    this.api.getPilotos().subscribe(p => this.pilotos.set(p));
    this.api.getEtapas().subscribe(e => this.etapas.set(e));
  }

  // Zera todos os campos do formulário para começar um novo resultado.
  // Object.keys() = retorna um array com todas as chaves do objeto form.
  // forEach = itera e define cada campo como 0.
  resetForm() {
    Object.keys(this.form).forEach(k => this.form[k] = 0);
    this.mensagem.set('');
  }

  salvar() {
    if (this.etapaSelecionadaId === 0) { this.setMsg('Selecione uma etapa.', true); return; }

    // Object.values() = array de todos os valores do objeto form.
    // .some(v => v === 0) = true se ALGUM campo ainda não foi preenchido.
    if (Object.values(this.form).some(v => v === 0)) { this.setMsg('Preencha todas as posições.', true); return; }

    this.salvando.set(true);

    // Monta o ResultadoRequest para PATCH /admin/resultado
    const req: ResultadoRequest = {
      etapaId: this.etapaSelecionadaId,
      poleId: this.form['poleId'],
      pos1Id: this.form['pos1Id'], pos2Id: this.form['pos2Id'],
      pos3Id: this.form['pos3Id'], pos4Id: this.form['pos4Id'],
      pos5Id: this.form['pos5Id'], pos6Id: this.form['pos6Id'],
      pos7Id: this.form['pos7Id'], pos8Id: this.form['pos8Id'],
      pos9Id: this.form['pos9Id'], pos10Id: this.form['pos10Id'],
      melhorVoltaId: this.form['melhorVoltaId']
    };

    // A API salva o resultado E já dispara o cálculo de pontos automaticamente
    this.api.inserirResultado(req).subscribe({
      next:  () => { this.setMsg('Resultado salvo e pontos calculados! ✅', false); this.salvando.set(false); },
      error: e  => { this.setMsg(e.error || 'Erro ao salvar.', true); this.salvando.set(false); }
    });
  }

  private setMsg(msg: string, erro: boolean) {
    this.mensagem.set(msg); this.msgErro.set(erro);
  }
}
