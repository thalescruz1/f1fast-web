import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Piloto, Etapa, PalpiteRequest } from '../../core/models';

interface PalpiteConfirmado {
  etapaNome: string;
  circuito: string;
  pole: string;
  posicoes: string[];
  melhorVolta: string;
}

@Component({
  selector: 'app-palpite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="palpite-wrap">

      <!-- Confirmação -->
      @if (palpiteConfirmado()) {
        <div class="conf-layout">
          <div class="conf-card rc-hud">
            <div class="conf-head">
              <div class="conf-icon">&#10003;</div>
              <div class="conf-title">Palpite Registrado</div>
              <div class="conf-sub">{{ palpiteConfirmado()!.etapaNome }} · {{ palpiteConfirmado()!.circuito }}</div>
            </div>
            <div class="conf-body">
              <div class="conf-item pole">
                <span class="conf-label">Pole Position</span>
                <span class="conf-value">{{ palpiteConfirmado()!.pole }}</span>
              </div>
              @for (pos of palpiteConfirmado()!.posicoes; track $index) {
                <div class="conf-item">
                  <span class="conf-label">{{ $index + 1 }}°</span>
                  <span class="conf-value">{{ pos }}</span>
                </div>
              }
              <div class="conf-item mv">
                <span class="conf-label">Melhor Volta</span>
                <span class="conf-value">{{ palpiteConfirmado()!.melhorVolta }}</span>
              </div>
            </div>
            <div class="conf-footer">
              <button class="btn-outline" (click)="editarPalpite()">Alterar Palpite</button>
            </div>
          </div>
        </div>
      }

      <!-- Formulário -->
      @else {
        @if (loading()) {
          <div class="loading">Carregando...</div>
        } @else if (!proximaEtapa()) {
          <div class="empty-msg">Não há etapas disponíveis para palpite no momento.</div>
        } @else {
          <div class="palpite-layout">
            <div class="palpite-main">
              <!-- GP Header -->
              <div class="gp-header">
                <div class="gp-chip">
                  <span class="ldot"></span>
                  <span>Etapa {{ proximaEtapa()!.numero }}</span>
                </div>
                <h1 class="gp-name">{{ proximaEtapa()!.pais }} {{ proximaEtapa()!.nome }}</h1>
                <div class="gp-circuit">{{ proximaEtapa()!.circuito }} · {{ proximaEtapa()!.cidade }}</div>
              </div>

              <!-- Position Grid -->
              <div class="section-label">Posições de Chegada</div>
              <div class="pos-grid">
                @for (pos of posicoes; track pos.key) {
                  <div class="pos-slot" (click)="abrirModal(pos.key, pos.label)"
                       [class.filled]="form[pos.key] !== 0">
                    <div class="ps-num">{{ pos.label }}</div>
                    @if (form[pos.key] !== 0) {
                      <div class="ps-name">{{ nomePiloto(form[pos.key]) }}</div>
                      <div class="ps-team">{{ equipePiloto(form[pos.key]) }}</div>
                    } @else {
                      <div class="ps-empty">Selecionar</div>
                    }
                  </div>
                }
              </div>

              <!-- Specials -->
              <div class="section-label">Especiais</div>
              <div class="spec-grid">
                <div class="spec-slot pole" (click)="abrirModal('poleId', 'Pole Position')"
                     [class.filled]="form['poleId'] !== 0">
                  <div class="ss-label">Pole Position</div>
                  @if (form['poleId'] !== 0) {
                    <div class="ss-name">{{ nomePiloto(form['poleId']) }}</div>
                  } @else {
                    <div class="ss-empty">Selecionar</div>
                  }
                </div>
                <div class="spec-slot mv" (click)="abrirModal('melhorVoltaId', 'Melhor Volta')"
                     [class.filled]="form['melhorVoltaId'] !== 0">
                  <div class="ss-label">Melhor Volta</div>
                  @if (form['melhorVoltaId'] !== 0) {
                    <div class="ss-name">{{ nomePiloto(form['melhorVoltaId']) }}</div>
                  } @else {
                    <div class="ss-empty">Selecionar</div>
                  }
                </div>
              </div>

              @if (mensagem()) {
                <div class="msg" [class.error]="msgErro()" [class.success]="!msgErro()">{{ mensagem() }}</div>
              }
            </div>

            <!-- Sidebar -->
            <div class="palpite-side">
              <div class="side-card">
                <div class="side-head">
                  <div class="side-title">Progresso</div>
                  <div class="side-count">{{ preenchidos() }}/12</div>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(preenchidos() / 12) * 100"></div>
                </div>
                <div class="side-deadline">
                  Prazo: {{ proximaEtapa()!.prazoQualify | date:'dd/MM · HH:mm' }}
                </div>
              </div>

              <div class="side-card rules">
                <div class="side-title">Pontuação</div>
                <div class="rule">Posição exata: <strong>3 pts</strong></div>
                <div class="rule">Adjacente (±1): <strong>1 pt</strong></div>
                <div class="rule">Pole Position: <strong>2 pts</strong></div>
                <div class="rule">Melhor Volta: <strong>2 pts</strong></div>
                <div class="rule total">Máximo: <strong>35 pts</strong></div>
              </div>

              <button class="submit-btn" (click)="enviar()" [disabled]="enviando() || preenchidos() < 12">
                {{ enviando() ? 'Enviando...' : 'Enviar Palpite' }}
              </button>
            </div>
          </div>
        }
      }
    </div>

    <!-- Driver Picker Modal -->
    @if (modalAberto()) {
      <div class="modal-overlay" (click)="fecharModal()"></div>
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">{{ modalLabel() }}</div>
          <button class="modal-close" (click)="fecharModal()">✕</button>
        </div>
        <div class="modal-search">
          <input type="text" [(ngModel)]="busca" placeholder="Buscar piloto..." class="modal-input">
        </div>
        <div class="modal-list">
          @for (p of pilotosModal(); track p.id) {
            <div class="modal-driver" (click)="selecionarPiloto(p.id)">
              <div class="md-bar" [style.background]="p.corEquipe"></div>
              <div class="md-num">{{ p.numero }}</div>
              <div class="md-info">
                <div class="md-name">{{ p.nome }}</div>
                <div class="md-team">{{ p.equipe }}</div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .palpite-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 32px; }

    .palpite-layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; }
    .palpite-main { min-width: 0; }

    /* GP Header */
    .gp-header { margin-bottom: 32px; }
    .gp-chip {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 8px 16px; background: var(--s2); border: 1.5px solid var(--b2);
      font-size: var(--sz-sm); font-weight: 600; color: var(--w70);
      margin-bottom: 16px;
    }
    .gp-name {
      font-family: var(--font-display); font-style: italic; font-weight: 800;
      font-size: var(--sz-2xl); text-transform: uppercase; line-height: 1;
    }
    .gp-circuit { font-size: var(--sz-base); color: var(--w45); margin-top: 6px; }

    .section-label {
      font-family: var(--font-orb); font-size: var(--sz-xs); font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px; color: var(--red);
      margin-bottom: 12px; border-left: 3px solid var(--red); padding-left: 10px;
    }

    /* Position Grid */
    .pos-grid {
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px;
      margin-bottom: 28px;
    }
    .pos-slot {
      background: var(--s1); border: 1.5px solid var(--b1);
      padding: 16px 12px; cursor: pointer; transition: all .15s;
      text-align: center;
    }
    .pos-slot:hover { background: var(--s2); border-color: var(--b3); }
    .pos-slot.filled { border-color: var(--red); background: rgba(232,0,26,.04); }
    .ps-num {
      font-family: var(--font-orb); font-size: var(--sz-lg); font-weight: 900;
      color: var(--w45); margin-bottom: 8px;
    }
    .pos-slot.filled .ps-num { color: var(--red); }
    .ps-name { font-family: var(--font-display); font-weight: 700; font-size: var(--sz-sm); text-transform: uppercase; }
    .ps-team { font-size: 11px; color: var(--w45); margin-top: 2px; }
    .ps-empty { font-size: var(--sz-sm); color: var(--w20); }

    /* Specials */
    .spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 24px; }
    .spec-slot {
      background: var(--s1); border: 1.5px solid var(--b1);
      padding: 20px; cursor: pointer; transition: all .15s;
    }
    .spec-slot:hover { background: var(--s2); }
    .spec-slot.filled { border-color: var(--b3); }
    .spec-slot.pole.filled { border-color: var(--gold); background: rgba(240,192,64,.04); }
    .spec-slot.mv.filled { border-color: var(--green); background: rgba(0,230,118,.04); }
    .ss-label {
      font-size: var(--sz-xs); font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: var(--w45); margin-bottom: 8px;
    }
    .spec-slot.pole .ss-label { color: var(--gold); }
    .spec-slot.mv .ss-label { color: var(--green); }
    .ss-name { font-family: var(--font-display); font-weight: 700; font-size: var(--sz-lg); text-transform: uppercase; }
    .ss-empty { font-size: var(--sz-base); color: var(--w20); }

    /* Sidebar */
    .palpite-side { display: flex; flex-direction: column; gap: 16px; }
    .side-card {
      background: var(--s1); border: 1.5px solid var(--b1); padding: 20px;
    }
    .side-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .side-title {
      font-family: var(--font-orb); font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px; color: var(--red);
    }
    .side-count { font-family: var(--font-orb); font-size: var(--sz-lg); font-weight: 900; }
    .progress-bar { height: 6px; background: var(--s3); overflow: hidden; margin-bottom: 16px; }
    .progress-fill { height: 100%; background: var(--red); transition: width .3s; }
    .side-deadline { font-size: var(--sz-sm); color: var(--amber); font-weight: 600; }

    .rules { display: flex; flex-direction: column; gap: 8px; }
    .rule { font-size: var(--sz-sm); color: var(--w70); }
    .rule strong { color: var(--white); }
    .rule.total { border-top: 1px solid var(--b1); padding-top: 8px; margin-top: 4px; }

    .submit-btn {
      width: 100%; padding: 18px;
      font-family: var(--font-body); font-size: var(--sz-base); font-weight: 700;
      background: var(--red); border: 2px solid var(--red); color: #fff;
      cursor: pointer; transition: all .2s; letter-spacing: .5px;
    }
    .submit-btn:hover:not(:disabled) { background: transparent; color: var(--red); }
    .submit-btn:disabled { opacity: .4; cursor: not-allowed; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 200; }
    .modal {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 420px; max-width: 95vw; max-height: 80vh;
      background: var(--s1); border: 1.5px solid var(--b2);
      z-index: 201; display: flex; flex-direction: column;
    }
    .modal-head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; background: var(--s2); border-bottom: 1px solid var(--b1);
    }
    .modal-title {
      font-family: var(--font-display); font-weight: 700; font-size: var(--sz-lg);
      text-transform: uppercase;
    }
    .modal-close {
      background: none; border: none; color: var(--w45); font-size: 18px;
      cursor: pointer; padding: 4px 8px;
    }
    .modal-close:hover { color: var(--white); }
    .modal-search { padding: 12px 20px; border-bottom: 1px solid var(--b1); }
    .modal-input {
      width: 100%; padding: 12px 14px;
      background: var(--s2); border: 1.5px solid var(--b2);
      color: var(--white); font-size: var(--sz-base); font-family: var(--font-body);
      outline: none;
    }
    .modal-input:focus { border-color: var(--red); }
    .modal-input::placeholder { color: var(--w20); }
    .modal-list { flex: 1; overflow-y: auto; }
    .modal-driver {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px; border-bottom: 1px solid var(--b1);
      cursor: pointer; transition: background .1s;
    }
    .modal-driver:hover { background: var(--s2); }
    .md-bar { width: 4px; height: 28px; flex-shrink: 0; }
    .md-num {
      font-family: var(--font-orb); font-size: var(--sz-sm); font-weight: 700;
      color: var(--red); min-width: 32px;
    }
    .md-name { font-family: var(--font-display); font-weight: 700; font-size: var(--sz-base); text-transform: uppercase; }
    .md-team { font-size: var(--sz-sm); color: var(--w45); }

    /* Confirmation */
    .conf-layout { display: flex; justify-content: center; }
    .conf-card { max-width: 540px; width: 100%; background: var(--s1); border: 1.5px solid var(--b2); }
    .conf-head {
      padding: 24px; text-align: center; background: var(--s2);
      border-bottom: 1px solid var(--b1);
    }
    .conf-icon { font-size: 40px; color: var(--green); margin-bottom: 8px; }
    .conf-title { font-family: var(--font-display); font-weight: 700; font-size: var(--sz-xl); text-transform: uppercase; }
    .conf-sub { font-size: var(--sz-sm); color: var(--w45); margin-top: 4px; }
    .conf-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 4px; }
    .conf-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: var(--s2); border-left: 3px solid transparent;
    }
    .conf-item.pole { border-left-color: var(--gold); }
    .conf-item.mv { border-left-color: var(--green); }
    .conf-label { font-size: var(--sz-sm); font-weight: 600; color: var(--w45); }
    .conf-value { font-size: var(--sz-sm); font-weight: 700; }
    .conf-footer { padding: 16px 20px; border-top: 1px solid var(--b1); }

    .loading, .empty-msg { text-align: center; padding: 60px 20px; color: var(--w45); }

    @media (max-width: 768px) {
      .palpite-wrap { padding: 24px 16px; }
      .palpite-layout { grid-template-columns: 1fr; }
      .pos-grid { grid-template-columns: repeat(2, 1fr); }
      .modal { width: 100%; max-width: 100%; top: 0; left: 0; transform: none; max-height: 100vh; }
    }
  `]
})
export class PalpiteComponent implements OnInit {
  private api = inject(ApiService);

  pilotos          = signal<Piloto[]>([]);
  proximaEtapa     = signal<Etapa | null>(null);
  loading          = signal(true);
  enviando         = signal(false);
  mensagem         = signal('');
  msgErro          = signal(false);
  palpiteConfirmado = signal<PalpiteConfirmado | null>(null);

  // Modal state
  modalAberto = signal(false);
  modalChave  = signal('');
  modalLabel  = signal('');
  busca       = '';

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

  preenchidos(): number {
    return Object.values(this.form).filter(v => v !== 0).length;
  }

  nomePiloto(id: number): string {
    return this.pilotos().find(p => p.id === id)?.nome ?? '—';
  }

  equipePiloto(id: number): string {
    return this.pilotos().find(p => p.id === id)?.equipe ?? '';
  }

  // Modal
  abrirModal(chave: string, label: string) {
    this.modalChave.set(chave);
    this.modalLabel.set(label);
    this.busca = '';
    this.modalAberto.set(true);
  }

  fecharModal() { this.modalAberto.set(false); }

  pilotosModal(): Piloto[] {
    const chave = this.modalChave();
    let lista = this.pilotos();

    // Para posições, filtrar pilotos já selecionados em outras posições
    if (chave.startsWith('pos')) {
      const selecionados = Object.entries(this.form)
        .filter(([k, v]) => k !== chave && k.startsWith('pos') && v !== 0)
        .map(([, v]) => v);
      lista = lista.filter(p => !selecionados.includes(p.id));
    }

    if (this.busca) {
      const b = this.busca.toLowerCase();
      lista = lista.filter(p =>
        p.nome.toLowerCase().includes(b) || p.equipe.toLowerCase().includes(b)
      );
    }

    return lista;
  }

  selecionarPiloto(id: number) {
    this.form[this.modalChave()] = id;
    this.fecharModal();
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
      next: () => {
        this.enviando.set(false);
        this.palpiteConfirmado.set({
          etapaNome:   etapa.nome,
          circuito:    etapa.circuito,
          pole:        this.nomePiloto(this.form['poleId']),
          posicoes:    this.posicoes.map(p => this.nomePiloto(this.form[p.key])),
          melhorVolta: this.nomePiloto(this.form['melhorVoltaId'])
        });
      },
      error: (e: any) => { this.setMsg(e.error?.mensagem || 'Erro ao enviar.', true); this.enviando.set(false); }
    });
  }

  editarPalpite() {
    this.palpiteConfirmado.set(null);
    this.mensagem.set('');
  }

  private setMsg(msg: string, erro: boolean) {
    this.mensagem.set(msg); this.msgErro.set(erro);
  }
}
