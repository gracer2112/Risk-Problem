// src/types/risk-problem.ts

/**
 * Sprint 1 — Consolidação de domínio e contrato de dados
 * Fonte de verdade funcional: SR--Riscos.txt
 *
 * Objetivo deste arquivo:
 * - Fechar enums oficiais
 * - Separar tipos por responsabilidade
 * - Eliminar ambiguidade entre domínio, formulário e requests
 * - Isolar legado em tipo transitório
 */

/*
 * ENUMS OFICIAIS
 */

export enum TipoInicialEnum {
  RISCO = 'risco',
  PROBLEMA = 'problema',
}

export enum NaturezaAtualEnum {
  RISCO = 'risco',
  PROBLEMA = 'problema',
}

export enum StatusRiscoEnum {
  IDENTIFICADO = 'identificado',
  EM_ANALISE = 'em_analise',
  PLANO_ACAO_DEFINIDO = 'plano_acao_definido',
  EM_MONITORAMENTO = 'em_monitoramento',
  MITIGADO = 'mitigado',
  ENCERRADO = 'encerrado',
}

export enum StatusProblemaEnum {
  ABERTO = 'aberto',
  EM_TRATAMENTO = 'em_tratamento',
  AGUARDANDO_TERCEIRO = 'aguardando_terceiro',
  AGUARDANDO_VALIDACAO = 'aguardando_validacao',
  RESOLVIDO = 'resolvido',
  ENCERRADO = 'encerrado',
}

export enum OrigemItemEnum {
  CRIADO_COMO_RISCO = 'criado_como_risco',
  CRIADO_COMO_PROBLEMA = 'criado_como_problema',
  RISCO_CONVERTIDO = 'risco_convertido',
}

export type StatusOperacional =
  | StatusRiscoEnum
  | StatusProblemaEnum;

export type SimNaoValue = 'sim' | 'nao';

export type DateString = string;

export type ConvertRiskToProblemRequest = {
  transitionedAt: DateString;
  transitionReason: string;
  controlApplied: SimNaoValue;
  controlEffective: SimNaoValue;
  updatedBy?: string;
};

export type ConvertRiskToProblemFormData = {
  transitionedAt: DateString;
  transitionReason: string;
  controlApplied: SimNaoValue;
  controlEffective: SimNaoValue;
};

export type CloseRiskProblemRequest = {
  data_encerramento: DateString;
  observacao_encerramento: string;
  updatedBy?: string;
};

export type CloseRiskProblemFormData = {
  data_encerramento: DateString;
  observacao_encerramento: string;
};

/*
 * TIPOS AUXILIARES
 */

export interface UsuarioRef {
  id: string;
  nome: string;
}

export type HistoricoEventoTipo =
  | 'item_criado'
  | 'status_alterado'
  | 'data_alvo_alterada'
  | 'responsavel_alterado'
  | 'convertido_em_problema'
  | 'item_encerrado'
  | 'campo_atualizado';

export type HistoricoCampoValor = string | number | boolean | null | Record<string, unknown> | unknown[];

export interface HistoricoEvento {
  id: string;
  item_id?: string | null;
  tipo_evento: HistoricoEventoTipo;
  data_evento: DateString;
  autor?: string | null;
  campo?: string | null;
  valor_anterior?: HistoricoCampoValor;
  valor_novo?: HistoricoCampoValor;
  observacao?: string | null;
}

/*
 * BLOCOS DE DOMÍNIO
 */

export interface RiskProblemBase {
  id: string;
  projeto_id?: number | null;
  tipo_inicial: TipoInicialEnum;
  natureza_atual: NaturezaAtualEnum;
  status_operacional: StatusOperacional;
  origem?: OrigemItemEnum;
  data_entrada?: DateString | null;

  titulo?: string | null;
  descricao: string;
  causa_raiz: string;
  descricao_impacto: string;

  acao_corretiva_controle: string;
  agente_solucao?: string | null;
  coordenador_agente?: string | null;
  data_alvo_solucao?: DateString | null;
}

export interface RiskAssessmentFields {
  probabilidade_inerente?: number | null;
  impacto_inerente?: number | null;
  nivel_risco_inerente?: number | null;

  eficacia_controle?: number | null;

  probabilidade_residual?: number | null;
  impacto_residual?: number | null;
  nivel_risco_residual?: number | null;
}

export interface ProblemAssessmentFields {
  impacto_realizado?: number | null;
  urgencia_solucao?: number | null;
  prioridade_problema?: number | null;
}

export interface TransitionFields {
  convertido_em_problema_em?: DateString | null; // data_transicao_problema é o campo canônico e convertido_em_problema_em é compatibilidade transitória de leitura
  data_transicao_problema?: DateString | null;
  motivo_transicao?: string | null;
  controle_aplicado?: SimNaoValue | null;
  controle_efetivo?: SimNaoValue | null;
}

export interface ClosureFields {
  data_encerramento?: DateString | null;
  observacao_encerramento?: string | null;
}

/*
 * ENTIDADE PRINCIPAL
 */

export interface RiskProblemItem
  extends RiskProblemBase,
    RiskAssessmentFields,
    ProblemAssessmentFields,
    TransitionFields,
    ClosureFields {
  historico_eventos?: HistoricoEvento[];
}

export type RiskProblemEntity = RiskProblemItem;
export type ConvertRiskToProblemResponse = RiskProblemItem;
export type CloseRiskProblemResponse = RiskProblemItem;

/*
 * LISTAGEM
 */

export interface RiskProblemListItem extends RiskProblemItem {
  /**
   * Campo calculado para leitura rápida na tabela.
   * Para risco, tende a refletir nível residual.
   * Para problema, tende a refletir prioridade.
   * Mantido opcional porque o backend pode compor de formas diferentes.
   */
  classificacao_atual?: number | string | null;
}
/**
 * Response padrão de listagem.
 * Pode ser ajustado para o shape real da API, mas a UI deve consumir este tipo.
 */
export interface RiskProblemListResponse {
  items: RiskProblemListItem[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface RiskProblemHistoryResponse {
  historico_eventos: HistoricoEvento[];
  total: number;
}

/*
 * FORM DATA
 */

/**
 * Dados editáveis no drawer/form.
 * Não deve ser substituído por Partial<RiskProblemEntity>.
 */
export interface RiskProblemFormData {
  tipo_inicial: TipoInicialEnum;
  natureza_atual: NaturezaAtualEnum;
  status_operacional: StatusOperacional;

  descricao: string;
  causa_raiz: string;
  descricao_impacto: string;

  acao_corretiva_controle: string;
  agente_solucao?: string | null;
  coordenador_agente?: string | null;
  data_alvo_solucao?: DateString | null;

  // Risco
  probabilidade_inerente?: number | null;
  impacto_inerente?: number | null;
  eficacia_controle?: number | null;
  probabilidade_residual?: number | null;
  impacto_residual?: number | null;

  // Problema
  impacto_realizado?: number | null;
  urgencia_solucao?: number | null;
}

/*
 * REQUESTS
 */

/**
 * Create request do domínio oficial.
 *
 * Observação:
 * - o front pode derivar natureza_atual e status_operacional a partir de tipo_inicial
 * - se o backend atual ainda exigir natureza/status explícitos, isso deve ser tratado no mapper
 */
export interface RiskProblemCreateRequest {
  tipo_inicial: TipoInicialEnum;

  descricao: string;
  causa_raiz: string;
  descricao_impacto: string;

  acao_corretiva_controle: string;
  agente_solucao?: string | null;
  coordenador_agente?: string | null;
  data_alvo_solucao?: DateString | null;

  probabilidade_inerente?: number | null;
  impacto_inerente?: number | null;
  eficacia_controle?: number | null;
  probabilidade_residual?: number | null;
  impacto_residual?: number | null;

  impacto_realizado?: number | null;
  urgencia_solucao?: number | null;
}

/**
 * Update request do fluxo genérico.
 *
 * Regras:
 * - NÃO permite tipo_inicial
 * - NÃO expõe natureza_atual para alteração livre
 * - status_operacional é permitido, desde que compatível com a natureza atual do item
 */
export interface RiskProblemUpdateRequest {
  descricao?: string;
  causa_raiz?: string;
  descricao_impacto?: string;

  acao_corretiva_controle?: string;
  agente_solucao?: string | null;
  coordenador_agente?: string | null;
  data_alvo_solucao?: DateString | null;

  status_operacional?: StatusOperacional;

  probabilidade_inerente?: number | null;
  impacto_inerente?: number | null;
  eficacia_controle?: number | null;
  probabilidade_residual?: number | null;
  impacto_residual?: number | null;

  impacto_realizado?: number | null;
  urgencia_solucao?: number | null;
}

export interface RiskProblemCreateApiPayload extends RiskProblemCreateRequest {
  natureza_atual?: NaturezaAtualEnum;
  status_operacional?: StatusOperacional;
  origem?: OrigemItemEnum;
  data_entrada?: DateString | null;
}

export interface RiskProblemUpdateApiPayload extends RiskProblemUpdateRequest {
  updatedBy?: string;
}

/*
 * STATUS OPTIONS E TYPE GUARDS
 */

export const RISK_STATUS_OPTIONS: StatusRiscoEnum[] = [
  StatusRiscoEnum.IDENTIFICADO,
  StatusRiscoEnum.EM_ANALISE,
  StatusRiscoEnum.PLANO_ACAO_DEFINIDO,
  StatusRiscoEnum.EM_MONITORAMENTO,
  StatusRiscoEnum.MITIGADO,
  StatusRiscoEnum.ENCERRADO,
];

export const PROBLEM_STATUS_OPTIONS: StatusProblemaEnum[] = [
  StatusProblemaEnum.ABERTO,
  StatusProblemaEnum.EM_TRATAMENTO,
  StatusProblemaEnum.AGUARDANDO_TERCEIRO,
  StatusProblemaEnum.AGUARDANDO_VALIDACAO,
  StatusProblemaEnum.RESOLVIDO,
  StatusProblemaEnum.ENCERRADO,
];

export function isStatusRisco(
  status: StatusOperacional
): status is StatusRiscoEnum {
  return RISK_STATUS_OPTIONS.includes(status as StatusRiscoEnum);
}

export function isStatusProblema(
  status: StatusOperacional
): status is StatusProblemaEnum {
  return PROBLEM_STATUS_OPTIONS.includes(status as StatusProblemaEnum);
}

export function getAllowedStatusByNatureza(
  natureza_atual: NaturezaAtualEnum
): StatusOperacional[] {
  return natureza_atual === NaturezaAtualEnum.RISCO
    ? RISK_STATUS_OPTIONS
    : PROBLEM_STATUS_OPTIONS;
}

/*
 * DEFAULTS DE CRIAÇÃO
 */

export function getDefaultNaturezaByTipoInicial(
  tipo_inicial: TipoInicialEnum
): NaturezaAtualEnum {
  return tipo_inicial === TipoInicialEnum.RISCO
    ? NaturezaAtualEnum.RISCO
    : NaturezaAtualEnum.PROBLEMA;
}

export function getDefaultStatusByTipoInicial(
  tipo_inicial: TipoInicialEnum
): StatusOperacional {
  return tipo_inicial === TipoInicialEnum.RISCO
    ? StatusRiscoEnum.IDENTIFICADO
    : StatusProblemaEnum.ABERTO;
}

export function getDefaultOrigemByTipoInicial(
  tipo_inicial: TipoInicialEnum
): OrigemItemEnum {
  return tipo_inicial === TipoInicialEnum.RISCO
    ? OrigemItemEnum.CRIADO_COMO_RISCO
    : OrigemItemEnum.CRIADO_COMO_PROBLEMA;
}

export function buildInitialFormData(
  tipo_inicial: TipoInicialEnum = TipoInicialEnum.RISCO
): RiskProblemFormData {
  return {
    tipo_inicial,
    natureza_atual: getDefaultNaturezaByTipoInicial(tipo_inicial),
    status_operacional: getDefaultStatusByTipoInicial(tipo_inicial),

    descricao: '',
    causa_raiz: '',
    descricao_impacto: '',

    acao_corretiva_controle: '',
    agente_solucao: null,
    coordenador_agente: null,
    data_alvo_solucao: null,

    probabilidade_inerente: null,
    impacto_inerente: null,
    eficacia_controle: null,
    probabilidade_residual: null,
    impacto_residual: null,

    impacto_realizado: null,
    urgencia_solucao: null,
  };
}

/*
 * CÁLCULOS DE APOIO AO FRONT
 */

/**
 * O front pode usar estes helpers para UX em tempo real.
 * O backend continua sendo a fonte final dos calculados persistidos.
 */
export function calcularNivelRiscoInerente(
  probabilidade_inerente?: number | null,
  impacto_inerente?: number | null
): number | null {
  if (
    probabilidade_inerente == null ||
    impacto_inerente == null
  ) {
    return null;
  }

  return probabilidade_inerente * impacto_inerente;
}

export function calcularNivelRiscoResidual(
  probabilidade_residual?: number | null,
  impacto_residual?: number | null
): number | null {
  if (
    probabilidade_residual == null ||
    impacto_residual == null
  ) {
    return null;
  }

  return probabilidade_residual * impacto_residual;
}

export function calcularPrioridadeProblema(
  impacto_realizado?: number | null,
  urgencia_solucao?: number | null
): number | null {
  if (
    impacto_realizado == null ||
    urgencia_solucao == null
  ) {
    return null;
  }

  return impacto_realizado * urgencia_solucao;
}

/*
 * LEGADO — USO TRANSITÓRIO APENAS NA CAMADA DE ADAPTER
 */

/**
 * Tipo transitório para compatibilidade com payload legado.
 *
 * REGRAS:
 * - não usar em componentes
 * - não usar em hooks de UI
 * - não usar como domínio principal
 * - restringir ao mapper/adapter de API
 */

export interface LegacyHistoricoEventoApiShape {
  id?: string | number;
  item_id?: string | number;
  tipo_evento?: string;
  data_evento?: DateString;
  autor?: string | UsuarioRef | null;
  campo?: string | null;
  valor_anterior?: unknown;
  valor_novo?: unknown;
  observacao?: string | null;
}

export interface LegacyRiskProblemHistoryResponseShape {
  historico_eventos?: LegacyHistoricoEventoApiShape[] | unknown[];
  total?: number | string;
}

export interface LegacyRiskProblemApiShape {
  id?: string | number;
  projeto_id?: string | number;

  tipo_inicial?: string;
  natureza_atual?: string;
  status_operacional?: string;
  origem?: string;
  data_entrada?: DateString;

  titulo?: string;
  descricao?: string;
  causa_raiz?: string;
  descricao_impacto?: string;

  acao_corretiva?: string;
  acao_corretiva_controle?: string;

  responsavel?: string;
  agente_solucao?: string;
  coordenador_agente?: string;

  data_prazo?: DateString;
  data_alvo_solucao?: DateString;

  probabilidade?: number | string;
  probabilidade_inerente?: number | string;

  impacto?: number | string;
  impacto_potencial?: number | string;
  impacto_inerente?: number | string;
  impacto_atual?: number | string;
  impacto_realizado?: number | string;

  urgencia?: number | string;
  urgencia_solucao?: number | string;

  prioridade?: number | string;
  prioridade_problema?: number | string;

  mitigacao?: number | string;
  eficacia_controle?: number | string;
  efetividade_controle?: number | string;

  probabilidade_residual?: number | string;
  impacto_residual?: number | string;
  nivel_risco_inerente?: number | string;
  nivel_risco_residual?: number | string;

  convertido_em_problema_em?: DateString;
  data_transicao_problema?: DateString;
  motivo_transicao?: string;
  controle_aplicado?: boolean | number | string;
  controle_efetivo?: boolean | number | string;
  data_encerramento?: DateString;
  observacao_encerramento?: string;
  historico_eventos?: LegacyHistoricoEventoApiShape[] | unknown[];
}
