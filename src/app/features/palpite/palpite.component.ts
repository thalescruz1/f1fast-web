// ============================================================
// COMPONENTE: PalpiteComponent
// ============================================================
// Responsável pela página de envio de palpites (/palpite).
// Esta é a página principal do campeonato — onde o usuário
// escolhe o Pole Position, 1° ao 10° lugar e Melhor Volta
// para a próxima corrida.
//
// implements OnInit → indica que este componente tem lógica
// de inicialização (método ngOnInit) que o Angular executa
// automaticamente quando o componente é criado.
// ============================================================

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

      <!-- Renderização condicional em 3 estados:
           1. loading() = true → mostra "Carregando..."
           2. loading = false mas sem etapa → mostra mensagem
           3. tem etapa → mostra o formulário de palpite -->
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else if (!proximaEtapa()) {
        <div class="card empty">Não há etapas disponíveis para palpite no momento.</div>
      } @else {
        <div class="bolao-layout">
          <div class="card">
            <div class="bolao-header">
              <!-- proximaEtapa()! = o "!" diz ao TypeScript que temos certeza
                   que o valor não é null aqui (Type Assertion) -->
              <h3>{{ proximaEtapa()!.pais }} {{ proximaEtapa()!.nome }}</h3>
              <!-- | date = pipe de formatação de data do Angular -->
              <span class="deadline-tag">⏱ Prazo: {{ proximaEtapa()!.prazoQualify | date:'dd/MM HH:mm' }}</span>
            </div>
            <div class="bolao-form">

              <div class="form-row">
                <label class="form-label pole">Pole</label>
                <!-- [(ngModel)]="form['poleId']" = two-way binding com o objeto form -->
                <select class="form-select" [(ngModel)]="form['poleId']">
                  <option [ngValue]="0">Selecione o Pole Position</option>
                  <!-- @for = loop (equivalente ao *ngFor do Angular antigo)
                       track p.id = diz ao Angular como identificar cada item
                       para otimizar re-renderização -->
                  @for (p of pilotos(); track p.id) {
                    <option [ngValue]="p.id">{{ p.numero }} — {{ p.nome }} ({{ p.equipe }})</option>
                  }
                </select>
              </div>

              <div class="divider"></div>

              <!-- Loop que gera automaticamente os selects de 1° ao 10°.
                   pilotosDisponiveis(pos.key) retorna apenas os pilotos
                   que ainda não foram escolhidos em outras posições. -->
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

              <!-- [class.error]="msgErro()" = adiciona/remove a classe CSS "error"
                   baseado no valor do signal msgErro -->
              @if (mensagem()) {
                <div class="msg" [class.error]="msgErro()">{{ mensagem() }}</div>
              }
            </div>
          </div>

          <!-- Painel lateral com a lista de pilotos e campo de busca -->
          <div class="card">
            <div class="drivers-header">
              <h4>Grid 2026</h4>
              <input class="search-input" placeholder="Buscar piloto..." [(ngModel)]="busca">
            </div>
            <div class="drivers-list">
              <!-- pilotosFiltrados() aplica o filtro da busca em tempo real -->
              @for (p of pilotosFiltrados(); track p.id) {
                <div class="driver-row">
                  <div class="driver-num">{{ p.numero }}</div>
                  <!-- [style.background]="p.corEquipe" = aplica a cor hex da equipe -->
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
    .deadline-tag { font-size: 12px; color: #0057E1; font-weight: 600; background: rgba(0,87,225,0.07); padding: 4px 10px; border-radius: 20px; }
    .bolao-form { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .form-row { display: grid; grid-template-columns: 80px 1fr; gap: 12px; align-items: center; }
    .form-label { font-size: 12px; font-weight: 600; color: #6B6B6B; text-align: right; }
    .form-label.pole { color: #E5A800; } .form-label.mv { color: #16A34A; }
    .form-select { width: 100%; padding: 9px 12px; background: white; border: 1px solid #E0E0E0; border-radius: 6px; font-size: 13px; }
    .form-select:focus { outline: none; border-color: #0057E1; }
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

  // Signals que guardam os dados carregados da API
  pilotos      = signal<Piloto[]>([]);          // lista de todos os 22 pilotos
  proximaEtapa = signal<Etapa | null>(null);    // a próxima etapa aberta para palpite
  loading      = signal(true);                  // controla o estado de carregamento
  enviando     = signal(false);                 // true enquanto envia o palpite
  mensagem     = signal('');                    // mensagem de sucesso ou erro
  msgErro      = signal(false);                 // true = mensagem é de erro (vermelho)
  busca        = '';                            // texto da barra de busca de pilotos

  // Record<string, number> = dicionário onde a chave é string e o valor é number.
  // Armazena o ID do piloto selecionado para cada posição.
  // 0 = "nenhum selecionado" (valor padrão das options)
  form: Record<string, number> = {
    poleId: 0, pos1Id: 0, pos2Id: 0, pos3Id: 0, pos4Id: 0,
    pos5Id: 0, pos6Id: 0, pos7Id: 0, pos8Id: 0, pos9Id: 0,
    pos10Id: 0, melhorVoltaId: 0
  };

  // Array de objetos descrevendo as 10 posições da corrida.
  // "key" é o nome do campo no form, "label" é o texto exibido.
  // Usado no template com @for para gerar os 10 selects automaticamente.
  posicoes = [
    { key: 'pos1Id', label: '1°' }, { key: 'pos2Id',  label: '2°'  },
    { key: 'pos3Id', label: '3°' }, { key: 'pos4Id',  label: '4°'  },
    { key: 'pos5Id', label: '5°' }, { key: 'pos6Id',  label: '6°'  },
    { key: 'pos7Id', label: '7°' }, { key: 'pos8Id',  label: '8°'  },
    { key: 'pos9Id', label: '9°' }, { key: 'pos10Id', label: '10°' }
  ];

  // ngOnInit() = "gancho de ciclo de vida" do Angular.
  // É chamado pelo Angular automaticamente após o componente ser criado.
  // Aqui carregamos os dados necessários para o formulário.
  ngOnInit() {
    // Carrega a lista de pilotos para preencher os selects
    this.api.getPilotos().subscribe(p => this.pilotos.set(p));

    // Carrega a próxima etapa aberta para palpite
    this.api.getProximaEtapa().subscribe({
      next:  e => { this.proximaEtapa.set(e); this.loading.set(false); },
      error: () => this.loading.set(false)  // mesmo no erro, remove o estado de loading
    });
  }

  // Retorna a lista de pilotos disponíveis para uma posição específica.
  // Remove os pilotos já escolhidos em outras posições para evitar duplicação.
  // chaveAtual = ex: 'pos3Id' → não remove a seleção desta própria posição
  pilotosDisponiveis(chaveAtual: string): Piloto[] {
    // Object.entries(this.form) = transforma o objeto em array de [chave, valor]
    // .filter() = mantém apenas posições que: não são a atual, começam com 'pos', e já têm piloto escolhido
    // .map() = extrai só os valores (IDs dos pilotos já selecionados)
    const selecionados = Object.entries(this.form)
      .filter(([k, v]) => k !== chaveAtual && k.startsWith('pos') && v !== 0)
      .map(([, v]) => v);

    // Retorna pilotos cujo ID não está na lista de já selecionados
    return this.pilotos().filter(p => !selecionados.includes(p.id));
  }

  // Filtra a lista lateral de pilotos pelo texto digitado na busca.
  // Funciona tanto por nome quanto por equipe.
  pilotosFiltrados(): Piloto[] {
    if (!this.busca) return this.pilotos();  // sem busca → retorna todos
    const b = this.busca.toLowerCase();
    return this.pilotos().filter(p =>
      p.nome.toLowerCase().includes(b) || p.equipe.toLowerCase().includes(b)
    );
  }

  // Valida o formulário e envia o palpite para a API.
  enviar() {
    const etapa = this.proximaEtapa();
    if (!etapa) return;

    // Validações antes de enviar
    if (this.form['poleId'] === 0) { this.setMsg('Selecione o Pole Position.', true); return; }
    // .some() = retorna true se ALGUM elemento satisfazer a condição
    if (this.posicoes.some(p => this.form[p.key] === 0)) { this.setMsg('Preencha todas as 10 posições.', true); return; }
    if (this.form['melhorVoltaId'] === 0) { this.setMsg('Selecione a Melhor Volta.', true); return; }

    this.enviando.set(true);

    // Monta o objeto PalpiteRequest que será enviado como JSON para a API
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

    // Envia para POST /palpites ou PATCH /palpites (cria ou atualiza)
    this.api.enviarPalpite(req).subscribe({
      next:  () => { this.setMsg('Palpite enviado com sucesso! ✅', false); this.enviando.set(false); },
      error: e  => { this.setMsg(e.error || 'Erro ao enviar.', true); this.enviando.set(false); }
    });
  }

  // Método auxiliar privado para atualizar os dois signals de mensagem juntos.
  private setMsg(msg: string, erro: boolean) {
    this.mensagem.set(msg); this.msgErro.set(erro);
  }
}
