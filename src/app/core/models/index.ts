export interface Piloto {
  id:        number;
  numero:    number;
  nome:      string;
  equipe:    string;
  corEquipe: string;
}

export interface Etapa {
  id:            number;
  numero:        number;
  nome:          string;
  circuito:      string;
  cidade:        string;
  pais:          string;
  sprint:        boolean;
  prazoQualify:  string;
  dataCorrida:   string | null;
  encerrada:     boolean;
  prazoExpirado: boolean;
}

export interface PalpiteRequest {
  etapaId:       number;
  poleId:        number;
  pos1Id:        number;
  pos2Id:        number;
  pos3Id:        number;
  pos4Id:        number;
  pos5Id:        number;
  pos6Id:        number;
  pos7Id:        number;
  pos8Id:        number;
  pos9Id:        number;
  pos10Id:       number;
  melhorVoltaId: number;
}

export interface PalpitePublico {
  login:         string;
  nome:          string;
  posicoes:      string[];
  pontosObtidos: number | null;
}

export interface RankingItem {
  posicao:            number;
  usuarioId:          number;
  login:              string;
  nome:               string;
  localizacao:        string;
  totalPontos:        number;
  etapasParticipadas: number;
  acertosExatos:      number;
  acertosPole:        number;
  acertosMelhorVolta: number;
}

export interface AuthResponse {
  token: string;
  login: string;
  nome:  string;
  role:  string;
}

export interface ResultadoRequest {
  etapaId:       number;
  poleId:        number;
  pos1Id:        number;
  pos2Id:        number;
  pos3Id:        number;
  pos4Id:        number;
  pos5Id:        number;
  pos6Id:        number;
  pos7Id:        number;
  pos8Id:        number;
  pos9Id:        number;
  pos10Id:       number;
  melhorVoltaId: number;
}
