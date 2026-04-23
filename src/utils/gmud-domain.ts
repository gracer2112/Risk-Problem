
// src/utils/gmud-domain.ts

import {
  StatusGMUD,
  PrioridadeGMUD,
  ImpactoGMUD,
  AmbienteGMUD,
  TipoExecucaoGMUD,
  OrigemGMUD,
  StatusChecklistGMUD,
  TRANSICOES_PERMITIDAS_GMUD
} from '@/types/gmud';

import type {
  GMUDResponseDTO as GMUDEntity,
  ChecklistItemGMUD,
  HistoricoItemGMUD,
  RollbackItemGMUD,
  GMUDKPIs
} from '@/types/gmud';


export interface GMUDChecklistResumo {
  total: number;
  concluidos: number;
  pendentes: number;
  dispensados: number;
  percentual_conclusao: number;
  pronto: boolean;
}

export interface GMUDResumoOperacional {
  id: string;
  titulo: string;
  status: StatusGMUD;
  status_label: string;
  prioridade: PrioridadeGMUD;
  prioridade_label: string;
  impacto: ImpactoGMUD;
  impacto_label: string;
  ambiente: AmbienteGMUD;
  ambiente_label: string;
  checklist_resumo: GMUDChecklistResumo;
  tem_janela_execucao: boolean;
  is_agendada: boolean;
  is_em_execucao: boolean;
  is_concluida: boolean;
  is_cancelada: boolean;
  is_em_rollback: boolean;
}

export const STATUS_GMUD_LABELS: Record<StatusGMUD, string> = {
  [StatusGMUD.RASCUNHO]: 'Rascunho',
  [StatusGMUD.EM_REVISAO]: 'Em revisão',
  [StatusGMUD.APROVADO]: 'Aprovado',
  [StatusGMUD.REJEITADO]: 'Rejeitado',
  [StatusGMUD.AGENDADO]: 'Agendado',
  [StatusGMUD.EM_EXECUCAO]: 'Em execução',
  [StatusGMUD.CONCLUIDO]: 'Concluído',
  [StatusGMUD.CANCELADO]: 'Cancelado',
  [StatusGMUD.ROLLBACK]: 'Rollback',
};

export const PRIORIDADE_GMUD_LABELS: Record<PrioridadeGMUD, string> = {
  [PrioridadeGMUD.BAIXA]: 'Baixa',
  [PrioridadeGMUD.MEDIA]: 'Média',
  [PrioridadeGMUD.ALTA]: 'Alta',
  [PrioridadeGMUD.CRITICA]: 'Crítica',
};

export const IMPACTO_GMUD_LABELS: Record<ImpactoGMUD, string> = {
  [ImpactoGMUD.BAIXO]: 'Baixo',
  [ImpactoGMUD.MEDIO]: 'Médio',
  [ImpactoGMUD.ALTO]: 'Alto',
  [ImpactoGMUD.CRITICO]: 'Crítico',
};

export const AMBIENTE_GMUD_LABELS: Record<AmbienteGMUD, string> = {
  [AmbienteGMUD.DESENVOLVIMENTO]: 'Desenvolvimento',
  [AmbienteGMUD.HOMOLOGACAO]: 'Homologação',
  [AmbienteGMUD.PRODUCAO]: 'Produção',
};

export const TIPO_EXECUCAO_GMUD_LABELS: Record<TipoExecucaoGMUD, string> = {
  [TipoExecucaoGMUD.MANUAL]: 'Manual',
  [TipoExecucaoGMUD.AUTOMATICA]: 'Automática',
};

export const ORIGEM_GMUD_LABELS: Record<OrigemGMUD, string> = {
  [OrigemGMUD.INTERNA]: 'Interna',
  [OrigemGMUD.CLIENTE]: 'Cliente',
  [OrigemGMUD.FORNECEDOR]: 'Fornecedor',
};

export const STATUS_CHECKLIST_GMUD_LABELS: Record<StatusChecklistGMUD, string> = {
  [StatusChecklistGMUD.PENDENTE]: 'Pendente',
  [StatusChecklistGMUD.CONCLUIDO]: 'Concluído',
  [StatusChecklistGMUD.DISPENSADO]: 'Dispensado',
};

export function getStatusGMUDLabel(status: StatusGMUD): string {
  return STATUS_GMUD_LABELS[status];
}

export function getPrioridadeGMUDLabel(prioridade: PrioridadeGMUD): string {
  return PRIORIDADE_GMUD_LABELS[prioridade];
}

export function getImpactoGMUDLabel(impacto: ImpactoGMUD): string {
  return IMPACTO_GMUD_LABELS[impacto];
}

export function getAmbienteGMUDLabel(ambiente: AmbienteGMUD): string {
  return AMBIENTE_GMUD_LABELS[ambiente];
}

export function getTipoExecucaoGMUDLabel(tipo_execucao: TipoExecucaoGMUD): string {
  return TIPO_EXECUCAO_GMUD_LABELS[tipo_execucao];
}

export function getOrigemGMUDLabel(origem: OrigemGMUD): string {
  return ORIGEM_GMUD_LABELS[origem];
}

export function getStatusChecklistGMUDLabel(status: StatusChecklistGMUD): string {
  return STATUS_CHECKLIST_GMUD_LABELS[status];
}

export function getTransicoesPermitidasGMUD(status: StatusGMUD): readonly StatusGMUD[] {
  return TRANSICOES_PERMITIDAS_GMUD[status] ?? [];
}

export function canTransitionGMUDStatus(
  status_atual: StatusGMUD,
  proximo_status: StatusGMUD,
): boolean {
  return getTransicoesPermitidasGMUD(status_atual).includes(proximo_status);
}

export function isStatusFinalGMUD(status: StatusGMUD): boolean {
  return getTransicoesPermitidasGMUD(status).length === 0;
}

export function normalizeChecklistGMUD(
  itens_checklist?: ChecklistItemGMUD[] | null,
): ChecklistItemGMUD[] {
  return itens_checklist ?? [];
}

export function normalizeHistoricoGMUD(
  historico?: HistoricoItemGMUD[] | null,
): HistoricoItemGMUD[] {
  return historico ?? [];
}

export function normalizeRollbackGMUD(
  eventos_rollback?: RollbackItemGMUD[] | null,
): RollbackItemGMUD[] {
  return eventos_rollback ?? [];
}

export function countChecklistConcluidoGMUD(
  itens_checklist?: ChecklistItemGMUD[] | null,
): number {
  return normalizeChecklistGMUD(itens_checklist).filter(
    (item) => item.status === StatusChecklistGMUD.CONCLUIDO,
  ).length;
}

export function countChecklistPendenteGMUD(
  itens_checklist?: ChecklistItemGMUD[] | null,
): number {
  return normalizeChecklistGMUD(itens_checklist).filter(
    (item) => item.status === StatusChecklistGMUD.PENDENTE,
  ).length;
}

export function countChecklistDispensadoGMUD(
  itens_checklist?: ChecklistItemGMUD[] | null,
): number {
  return normalizeChecklistGMUD(itens_checklist).filter(
    (item) => item.status === StatusChecklistGMUD.DISPENSADO,
  ).length;
}

export function getChecklistResumoGMUD(
  itens_checklist?: ChecklistItemGMUD[] | null,
): GMUDChecklistResumo {
  const itens = normalizeChecklistGMUD(itens_checklist);
  const total = itens.length;
  const concluidos = countChecklistConcluidoGMUD(itens);
  const pendentes = countChecklistPendenteGMUD(itens);
  const dispensados = countChecklistDispensadoGMUD(itens);
  const percentual_conclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  const pronto = pendentes === 0;

  return {
    total,
    concluidos,
    pendentes,
    dispensados,
    percentual_conclusao,
    pronto,
  };
}

export function isChecklistProntoGMUD(
  itens_checklist?: ChecklistItemGMUD[] | null,
): boolean {
  return countChecklistPendenteGMUD(itens_checklist) === 0;
}

export function hasJanelaExecucaoGMUD(
  item: Pick<GMUDEntity, 'janela_execucao_inicio' | 'janela_execucao_fim'>,
): boolean {
  return Boolean(item.janela_execucao_inicio || item.janela_execucao_fim);
}

export function isAgendadaGMUD(status: StatusGMUD): boolean {
  return status === StatusGMUD.AGENDADO;
}

export function isEmExecucaoGMUD(status: StatusGMUD): boolean {
  return status === StatusGMUD.EM_EXECUCAO;
}

export function isConcluidaGMUD(status: StatusGMUD): boolean {
  return status === StatusGMUD.CONCLUIDO;
}

export function isCanceladaGMUD(status: StatusGMUD): boolean {
  return status === StatusGMUD.CANCELADO;
}

export function isEmRollbackGMUD(status: StatusGMUD): boolean {
  return status === StatusGMUD.ROLLBACK;
}

export function getResumoOperacionalGMUD(item: GMUDEntity): GMUDResumoOperacional {
  return {
    id: item.id,
    titulo: item.titulo,
    status: item.status,
    status_label: getStatusGMUDLabel(item.status),
    prioridade: item.prioridade,
    prioridade_label: getPrioridadeGMUDLabel(item.prioridade),
    impacto: item.impacto,
    impacto_label: getImpactoGMUDLabel(item.impacto),
    ambiente: item.ambiente,
    ambiente_label: getAmbienteGMUDLabel(item.ambiente),
    checklist_resumo: getChecklistResumoGMUD(item.itens_checklist),
    tem_janela_execucao: hasJanelaExecucaoGMUD(item),
    is_agendada: isAgendadaGMUD(item.status),
    is_em_execucao: isEmExecucaoGMUD(item.status),
    is_concluida: isConcluidaGMUD(item.status),
    is_cancelada: isCanceladaGMUD(item.status),
    is_em_rollback: isEmRollbackGMUD(item.status),
  };
}