// ============================================================
// MODELS: Interfaces TypeScript (espelhos dos DTOs do backend)
// ============================================================
// Em TypeScript/Angular, "interface" define a forma (formato)
// de um objeto. É como um "contrato": qualquer objeto deste
// tipo DEVE ter exatamente estas propriedades.
//
// Estas interfaces espelham os DTOs do backend C#.
// Quando a API retorna JSON, o TypeScript usa essas interfaces
// para dar autocompletar e detectar erros de tipagem.
//
// Diferente do C#, as interfaces TypeScript NÃO existem em
// tempo de execução — são apenas para o compilador verificar.
// ============================================================

/** Representa um piloto de F1 retornado pela API */
export interface Piloto {
  id:        number;  // ID do banco (usado nos selects do formulário)
  numero:    number;  // Número de corrida (ex: 44, 1, 5)
  nome:      string;  // Nome completo (ex: "Lewis Hamilton")
  equipe:    string;  // Nome da equipe (ex: "Ferrari")
  corEquipe: string;  // Cor hex (ex: "#E8002D") para a barrinha colorida
}

/** Representa uma etapa (corrida/sprint) do calendário */
export interface Etapa {
  id:            number;       // ID único no banco
  numero:        number;       // Número sequencial (1 a 30)
  nome:          string;       // Ex: "GP do Brasil"
  circuito:      string;       // Ex: "Interlagos"
  cidade:        string;       // Ex: "São Paulo"
  pais:          string;       // Emoji da bandeira (ex: "🇧🇷")
  sprint:        boolean;      // true = corrida sprint
  prazoQualify:  string;       // Data/hora ISO do prazo (string vinda do JSON)
  dataCorrida:   string | null; // Data da corrida ("string | null" = pode ser nulo)
  encerrada:     boolean;      // true = etapa finalizada, pontos calculados
  prazoExpirado: boolean;      // true = prazo já passou (calculado na API)
}

/** Dados enviados ao API ao submeter um palpite */
export interface PalpiteRequest {
  etapaId:       number; // Para qual corrida
  poleId:        number; // Piloto escolhido para Pole Position
  pos1Id:        number; // Piloto escolhido para 1° lugar
  pos2Id:        number;
  pos3Id:        number;
  pos4Id:        number;
  pos5Id:        number;
  pos6Id:        number;
  pos7Id:        number;
  pos8Id:        number;
  pos9Id:        number;
  pos10Id:       number; // Piloto escolhido para 10° lugar
  melhorVoltaId: number; // Piloto escolhido para Melhor Volta
}

/** Palpite público de um participante (visível após o prazo) */
export interface PalpitePublico {
  login:         string;        // Login do participante
  nome:          string;        // Nome do participante
  posicoes:      string[];      // Nomes: [Pole, Pos1...Pos10, MelhorVolta]
  pontosObtidos: number | null; // null se a etapa ainda não encerrou
}

/** Um item da tabela de ranking geral */
export interface RankingItem {
  posicao:            number; // 1°, 2°, 3°...
  usuarioId:          number;
  login:              string;
  nome:               string; // Nome + Sobrenome
  localizacao:        string; // Ex: "São Paulo, SP"
  totalPontos:        number; // Soma de todos os pontos
  etapasParticipadas: number; // Quantas corridas fez palpite
  acertosExatos:      number; // Para desempate
  acertosPole:        number; // Para desempate
  acertosMelhorVolta: number; // Para desempate
}

/** Resposta da API ao fazer login com sucesso */
export interface AuthResponse {
  token: string; // JWT para ser enviado nas próximas requisições
  login: string; // Para exibir na navbar
  nome:  string; // Para personalizar a interface
  role:  string; // "User" ou "Admin" — define acesso às funcionalidades
}

/** Dados enviados pelo admin ao lançar resultado de uma corrida */
export interface ResultadoRequest {
  etapaId:       number; // Qual corrida está sendo encerrada
  poleId:        number; // Quem fez a pole real
  pos1Id:        number; // Vencedor real
  pos2Id:        number;
  pos3Id:        number;
  pos4Id:        number;
  pos5Id:        number;
  pos6Id:        number;
  pos7Id:        number;
  pos8Id:        number;
  pos9Id:        number;
  pos10Id:       number; // 10° lugar real
  melhorVoltaId: number; // Quem fez a melhor volta real
}
