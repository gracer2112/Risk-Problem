// src/utils/risk-problem-domain.ts

import {
  NaturezaAtualEnum,
  StatusOperacional,
  StatusProblemaEnum,
  StatusRiscoEnum,
  RiskProblemItem,
} from '@/types/risk-problem';

export const RISK_STATUSES: StatusRiscoEnum[] = [
  StatusRiscoEnum.IDENTIFICADO,
  StatusRiscoEnum.EM_ANALISE,
  StatusRiscoEnum.PLANO_ACAO_DEFINIDO,
  StatusRiscoEnum.EM_MONITORAMENTO,
  StatusRiscoEnum.MITIGADO,
  StatusRiscoEnum.ENCERRADO,
];

export const PROBLEM_STATUSES: StatusProblemaEnum[] = [
  StatusProblemaEnum.ABERTO,
  StatusProblemaEnum.EM_TRATAMENTO,
  StatusProblemaEnum.AGUARDANDO_TERCEIRO,
  StatusProblemaEnum.AGUARDANDO_VALIDACAO,
  StatusProblemaEnum.RESOLVIDO,
  StatusProblemaEnum.ENCERRADO,
];

export function isRisk(
  item: Pick<RiskProblemItem, 'natureza_atual'>
): boolean {
  return item.natureza_atual === NaturezaAtualEnum.RISCO;
}

export function isProblem(
  item: Pick<RiskProblemItem, 'natureza_atual'>
): boolean {
  return item.natureza_atual === NaturezaAtualEnum.PROBLEMA;
}

export function isRiskStatus(
  status: StatusOperacional
): status is StatusRiscoEnum {
  return RISK_STATUSES.includes(status as StatusRiscoEnum);
}

export function isProblemStatus(
  status: StatusOperacional
): status is StatusProblemaEnum {
  return PROBLEM_STATUSES.includes(status as StatusProblemaEnum);
}

export function getAllowedStatusesByNature(
  natureza: NaturezaAtualEnum
): StatusOperacional[] {
  return natureza === NaturezaAtualEnum.RISCO
    ? RISK_STATUSES
    : PROBLEM_STATUSES;
}

export function isStatusCompatibleWithNature(
  natureza: NaturezaAtualEnum,
  status: StatusOperacional
): boolean {
  return getAllowedStatusesByNature(natureza).includes(status);
}

export function isFinalStatus(status: StatusOperacional): boolean {
  return (
    status === StatusRiscoEnum.MITIGADO ||
    status === StatusRiscoEnum.ENCERRADO ||
    status === StatusProblemaEnum.RESOLVIDO ||
    status === StatusProblemaEnum.ENCERRADO
  );
}

export function getFinalStatusByNatureza(
  natureza: NaturezaAtualEnum
): StatusOperacional {
  return natureza === NaturezaAtualEnum.RISCO
    ? StatusRiscoEnum.MITIGADO
    : StatusProblemaEnum.RESOLVIDO;
}

export function isClosedItem(
  item: Pick<RiskProblemItem, 'status_operacional' | 'data_encerramento'>
): boolean {
  return Boolean(item.data_encerramento) || isFinalStatus(item.status_operacional);
}

export function canCloseRiskProblem(
  item: Pick<RiskProblemItem, 'natureza_atual' | 'status_operacional' | 'data_encerramento'>
): boolean {
  return (
    isStatusCompatibleWithNature(item.natureza_atual, item.status_operacional) &&
    !isClosedItem(item)
  );
}

export function canConvertRiskToProblem(
  item: Pick<RiskProblemItem, 'natureza_atual' | 'status_operacional' | 'data_encerramento'>
): boolean {
  return isRisk(item) && !isClosedItem(item);
}