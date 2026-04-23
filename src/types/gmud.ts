// src/types/gmud.ts

export type GMUDId = string;

export type ProjetoId = string;

export type OpenProjectProjectId = string;

export type DataISO = string;

export enum StatusGMUD {
  RASCUNHO = 'rascunho',
  EM_REVISAO = 'em_revisao',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
  AGENDADO = 'agendado',
  EM_EXECUCAO = 'em_execucao',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
  ROLLBACK = 'rollback'
}

export enum PrioridadeGMUD {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export enum ImpactoGMUD {
  BAIXO = 'baixo',
  MEDIO = 'medio',
  ALTO = 'alto',
  CRITICO = 'critico'
}

export enum AmbienteGMUD {
  DESENVOLVIMENTO = 'desenvolvimento',
  HOMOLOGACAO = 'homologacao',
  PRODUCAO = 'producao'
}

export enum TipoExecucaoGMUD {
  MANUAL = 'manual',
  AUTOMATICA = 'automatica'
}

export enum OrigemGMUD {
  INTERNA = 'interna',
  CLIENTE = 'cliente',
  FORNECEDOR = 'fornecedor'
}

export enum StatusChecklistGMUD {
  PENDENTE = 'pendente',
  CONCLUIDO = 'concluido',
  DISPENSADO = 'dispensado'
}

export interface CriarGMUDRequestDTO {
  project_id: ProjetoId;
  openproject_project_id?: OpenProjectProjectId | null;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeGMUD;
  impacto: ImpactoGMUD;
  ambiente: AmbienteGMUD;
  tipo_execucao: TipoExecucaoGMUD;
  origem: OrigemGMUD;
  data_agendada?: DataISO | null;
  janela_execucao_inicio?: DataISO | null;
  janela_execucao_fim?: DataISO | null;
  solicitante?: string | null;
  responsavel_execucao?: string | null;
  plano_rollback?: string | null;
  itens_checklist?: PayloadChecklistItemGMUD[];
}

export type AtualizarGMUDRequestDTO = Partial<Omit<CriarGMUDRequestDTO, 'project_id'>>;

export interface GMUDResponseDTO {
  id: GMUDId;
  project_id: ProjetoId;
  openproject_project_id: OpenProjectProjectId | null;
  titulo: string;
  descricao: string;
  status: StatusGMUD;
  prioridade: PrioridadeGMUD;
  impacto: ImpactoGMUD;
  ambiente: AmbienteGMUD;
  tipo_execucao: TipoExecucaoGMUD;
  origem: OrigemGMUD;
  data_agendada?: DataISO | null;
  janela_execucao_inicio?: DataISO | null;
  janela_execucao_fim?: DataISO | null;
  solicitante?: string | null;
  responsavel_execucao?: string | null;
  plano_rollback?: string | null;
  itens_checklist: ChecklistItemGMUD[];
  historico: HistoricoItemGMUD[];
  eventos_rollback: RollbackItemGMUD[];
  created_at: DataISO;
  updated_at: DataISO;
}

export interface GMUDListItemResponseDTO {
  id: GMUDId;
  project_id: ProjetoId;
  titulo: string;
  status: StatusGMUD;
  prioridade: PrioridadeGMUD;
  impacto: ImpactoGMUD;
  ambiente: AmbienteGMUD;
  data_agendada?: DataISO | null;
  responsavel_execucao?: string | null;
  updated_at: DataISO;
}

export interface ChecklistItemGMUD {
  id: string;
  descricao: string;
  status: StatusChecklistGMUD;
  observacao?: string;
  data_conclusao?: DataISO | null;
}

export interface PayloadChecklistItemGMUD {
  descricao: string;
  status?: StatusChecklistGMUD;
  observacao?: string;
}

export interface HistoricoItemGMUD {
  id: string;
  timestamp: DataISO;
  tipo_evento: string;
  usuario_id: string;
  usuario_nome?: string;
  status_anterior?: StatusGMUD | null;
  status_novo?: StatusGMUD | null;
  observacao?: string;
}

export interface RollbackItemGMUD {
  id: string;
  descricao: string;
  executado: boolean;
  data_execucao?: DataISO | null;
  observacao?: string;
}

export interface ContextoProjetoGMUD {
  project_id: ProjetoId;
  openproject_project_id: OpenProjectProjectId | null;
  nome_projeto?: string;
}

export interface GMUDKPIs {
  total: number;
  em_revisao: number;
  agendadas: number;
  em_execucao: number;
  concluidas: number;
  rollbacks: number;
}

export interface FiltrosGMUD {
  project_id?: ProjetoId;
  status?: StatusGMUD[];
  prioridade?: PrioridadeGMUD[];
  impacto?: ImpactoGMUD[];
  ambiente?: AmbienteGMUD[];
  busca?: string;
}

export interface PayloadTransicaoStatusGMUD {
  para_status: StatusGMUD;
  observacao?: string;
}

export interface PayloadRegistrarRollbackGMUD {
  descricao: string;
  observacao?: string;
}

export type TransicoesPermitidasGMUD = Record<StatusGMUD, readonly StatusGMUD[]>;

export const TRANSICOES_PERMITIDAS_GMUD: TransicoesPermitidasGMUD = {
  [StatusGMUD.RASCUNHO]: [StatusGMUD.EM_REVISAO, StatusGMUD.CANCELADO],
  [StatusGMUD.EM_REVISAO]: [StatusGMUD.APROVADO, StatusGMUD.REJEITADO, StatusGMUD.RASCUNHO],
  [StatusGMUD.APROVADO]: [StatusGMUD.AGENDADO, StatusGMUD.CANCELADO],
  [StatusGMUD.REJEITADO]: [StatusGMUD.RASCUNHO, StatusGMUD.CANCELADO],
  [StatusGMUD.AGENDADO]: [StatusGMUD.EM_EXECUCAO, StatusGMUD.CANCELADO],
  [StatusGMUD.EM_EXECUCAO]: [StatusGMUD.CONCLUIDO, StatusGMUD.ROLLBACK, StatusGMUD.CANCELADO],
  [StatusGMUD.CONCLUIDO]: [],
  [StatusGMUD.CANCELADO]: [],
  [StatusGMUD.ROLLBACK]: [StatusGMUD.CONCLUIDO, StatusGMUD.CANCELADO]
};