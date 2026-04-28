export type SemanticTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface SemanticInfo {
  rawValue: number | string | null | undefined;
  normalizedValue: number | null;
  label: string;
  shortLabel: string;
  tone: SemanticTone;
  rank: number | null;
  isEmpty: boolean;
}

export interface DeadlineSemanticInfo {
  targetDate: string | null | undefined;
  label: string;
  shortLabel: string;
  tone: SemanticTone;
  isLate: boolean;
  isEmpty: boolean;
}

export function normalizeToNumber(value: number | string | null | undefined): number | null {
  // Normaliza o valor para número, tratando strings e valores nulos
  if (value == null) return null;
  if (typeof value === 'number') return value;
  const str = String(value).trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

export function createEmptySemantic(rawValue: number | string | null | undefined): SemanticInfo {
  // Cria SemanticInfo para valores vazios ou não informados
  return {
    rawValue,
    normalizedValue: null,
    label: "Não informado",
    shortLabel: "N/I",
    tone: "neutral",
    rank: null,
    isEmpty: true
  };
}

export function createScaleSemantic(
  rawValue: number | string | null | undefined,
  normalizedValue: number,
  label: string,
  shortLabel: string,
  tone: SemanticTone,
  rank: number
): SemanticInfo {
  // Cria SemanticInfo completo para escalas semânticas
  return {
    rawValue,
    normalizedValue,
    label,
    shortLabel,
    tone,
    rank,
    isEmpty: false
  };
}

export function getFivePointScaleSemantic(value: number | string | null | undefined): SemanticInfo {
  // Obtém semântica para escala de 1 a 5 pontos
  const norm = normalizeToNumber(value);
  if (norm === null) {
    return createEmptySemantic(value);
  }
  const scale = Math.max(1, Math.min(5, Math.round(norm)));
  let label: string;
  let shortLabel: string;
  let tone: SemanticTone;
  switch (scale) {
    case 1:
      label = "Muito baixo";
      shortLabel = "M. baixo";
      tone = "neutral";
      break;
    case 2:
      label = "Baixo";
      shortLabel = "Baixo";
      tone = "info";
      break;
    case 3:
      label = "Médio";
      shortLabel = "Médio";
      tone = "warning";
      break;
    case 4:
      label = "Alto";
      shortLabel = "Alto";
      tone = "warning";
      break;
    case 5:
      label = "Muito alto";
      shortLabel = "M. alto";
      tone = "danger";
      break;
    default:
      return createEmptySemantic(value);
  }
  return createScaleSemantic(value, scale, label, shortLabel, tone, scale);
}

export function getControlEffectivenessSemantic(value: number | string | null | undefined): SemanticInfo {
  // Obtém semântica para efetividade de controle (polaridade positiva: alta = bom)
  const norm = normalizeToNumber(value);
  if (norm === null) {
    return createEmptySemantic(value);
  }
  const scale = Math.max(1, Math.min(5, Math.round(norm)));
  let label: string;
  let shortLabel: string;
  let tone: SemanticTone;
  switch (scale) {
    case 1:
      label = "Muito baixa efetividade";
      shortLabel = "M. baixa";
      tone = "danger";
      break;
    case 2:
      label = "Baixa efetividade";
      shortLabel = "Baixa";
      tone = "warning";
      break;
    case 3:
      label = "Efetividade moderada";
      shortLabel = "Moderada";
      tone = "info";
      break;
    case 4:
      label = "Alta efetividade";
      shortLabel = "Alta";
      tone = "success";
      break;
    case 5:
      label = "Muito alta efetividade";
      shortLabel = "M. alta";
      tone = "success";
      break;
    default:
      return createEmptySemantic(value);
  }
  return createScaleSemantic(value, scale, label, shortLabel, tone, scale);
}

export function getCompositeScoreSemantic(value: number | string | null | undefined): SemanticInfo {
  // Obtém semântica para pontuação composta (< 6 Baixa, >=6 <12 Média, >=12 Crítica)
  const norm = normalizeToNumber(value);
  if (norm === null) {
    return createEmptySemantic(value);
  }
  let label: string;
  let shortLabel: string;
  let tone: SemanticTone;
  let rank: number;
  if (norm <= 6) {
    label = "Baixa";
    shortLabel = "Baixa";
    tone = "neutral";
    rank = 1;
  } else if (norm <= 12) {
    label = "Média";
    shortLabel = "Média";
    tone = "info";
    rank = 2;
  } else if (norm <= 18) {
    label = "Alta";
    shortLabel = "Alta";
    tone = "warning";
    rank = 3;
  } else {
    label = "Crítica";
    shortLabel = "Crítica";
    tone = "danger";
    rank = 4;
  }
  return createScaleSemantic(value, norm, label, shortLabel, tone, rank);
}

function parseDateLike(value: string | null | undefined): Date | null {
  // Função auxiliar interna: faz parse de data, priorizando formato YYYY-MM-DD local
  if (!value) return null;
  // Formato YYYY-MM-DD
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(date.getTime()) ? null : date;
  }
  // Outros formatos
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export function getDeadlineSemantic(targetDate: string | null | undefined, isClosed: boolean): DeadlineSemanticInfo {
  // Obtém semântica para prazo/finalidade
  const parsed = parseDateLike(targetDate);
  if (!targetDate || !parsed) {
    return {
      targetDate,
      label: "Sem prazo definido",
      shortLabel: "Sem prazo",
      tone: "neutral",
      isLate: false,
      isEmpty: true
    };
  }
  if (isClosed) {
    return {
      targetDate,
      label: "Sem atraso relevante",
      shortLabel: "Encerrado",
      tone: "neutral",
      isLate: false,
      isEmpty: false
    };
  }
  // Normaliza para comparação de datas (meia-noite local)
  const targetDay = new Date(parsed);
  targetDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isLate = targetDay < today;
  if (isLate) {
    return {
      targetDate,
      label: "Atrasado",
      shortLabel: "Atrasado",
      tone: "danger",
      isLate: true,
      isEmpty: false
    };
  } else {
    return {
      targetDate,
      label: "No prazo",
      shortLabel: "No prazo",
      tone: "success",
      isLate: false,
      isEmpty: false
    };
  }
}
