// src/services/risk-problem.mapper.ts

// Compatibilidade com legado deve ficar restrita a este arquivo.
import {
  TipoInicialEnum,
  NaturezaAtualEnum,
  StatusRiscoEnum,
  StatusProblemaEnum,
  OrigemItemEnum,
  type StatusOperacional,
  type SimNaoValue,
  type RiskProblemEntity,
  type RiskProblemListItem,
  type RiskProblemFormData,
  type RiskProblemCreateRequest,
  type RiskProblemUpdateRequest,
  type CloseRiskProblemFormData,
  type CloseRiskProblemRequest,
  type LegacyRiskProblemApiShape,
  type HistoricoEvento,
  getDefaultNaturezaByTipoInicial,
  getDefaultStatusByTipoInicial,
  getDefaultOrigemByTipoInicial,
  calcularNivelRiscoInerente,
  calcularNivelRiscoResidual,
  calcularPrioridadeProblema,
} from '@/types/risk-problem';

import {
  getFinalStatusByNatureza,
  isFinalStatus,
} from '@/utils/risk-problem-domain';

const RISK_STATUS_VALUES: StatusRiscoEnum[] = [
  StatusRiscoEnum.IDENTIFICADO,
  StatusRiscoEnum.EM_ANALISE,
  StatusRiscoEnum.PLANO_ACAO_DEFINIDO,
  StatusRiscoEnum.EM_MONITORAMENTO,
  StatusRiscoEnum.MITIGADO,
  StatusRiscoEnum.ENCERRADO,
];

const PROBLEM_STATUS_VALUES: StatusProblemaEnum[] = [
  StatusProblemaEnum.ABERTO,
  StatusProblemaEnum.EM_TRATAMENTO,
  StatusProblemaEnum.AGUARDANDO_TERCEIRO,
  StatusProblemaEnum.AGUARDANDO_VALIDACAO,
  StatusProblemaEnum.RESOLVIDO,
  StatusProblemaEnum.ENCERRADO,
];

type CreateCompatibilityPayload = RiskProblemCreateRequest & {
  natureza_atual: NaturezaAtualEnum;
  status_operacional: StatusOperacional;
  origem: OrigemItemEnum;
  probabilidade?: number | null;
  impacto_potencial?: number | null;
  efetividade_controle?: number | null;
  impacto_atual?: number | null;
  urgencia?: number | null;
  prioridade?: number | null;
  acao_corretiva?: string;
};

type UpdateCompatibilityPayload = RiskProblemUpdateRequest & {
  probabilidade?: number | null;
  impacto_potencial?: number | null;
  efetividade_controle?: number | null;
  impacto_atual?: number | null;
  urgencia?: number | null;
  prioridade?: number | null;
  acao_corretiva?: string;
};

type CloseCompatibilityPayload = CloseRiskProblemRequest & {
  status_operacional: StatusOperacional;
};

function normalizeToken(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = String(value).trim();
  return parsed ? parsed : null;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toNullableSimNao(value: unknown): SimNaoValue | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'boolean') {
    return value ? 'sim' : 'nao';
  }

  if (typeof value === 'number') {
    if (value === 1) return 'sim';
    if (value === 0) return 'nao';
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'sim', 'yes'].includes(normalized)) {
      return 'sim';
    }

    if (['false', '0', 'nao', 'não', 'no'].includes(normalized)) {
      return 'nao';
    }
  }

  return null;
}

function areDifferent(a: unknown, b: unknown): boolean {
  return a !== b;
}

function sanitizeRequiredText(value: unknown): string {
  return toNullableString(value) ?? '';
}

function normalizeTipoInicial(value: unknown): TipoInicialEnum {
  const token = normalizeToken(value);

  if (token === 'risco' || token === 'risk') {
    return TipoInicialEnum.RISCO;
  }

  if (token === 'problema' || token === 'problem') {
    return TipoInicialEnum.PROBLEMA;
  }

  return TipoInicialEnum.RISCO;
}

function normalizeNaturezaAtual(value: unknown): NaturezaAtualEnum {
  const token = normalizeToken(value);

  if (token === 'risco' || token === 'risk') {
    return NaturezaAtualEnum.RISCO;
  }

  if (token === 'problema' || token === 'problem') {
    return NaturezaAtualEnum.PROBLEMA;
  }

  return NaturezaAtualEnum.RISCO;
}

function normalizeOrigem(value: unknown): OrigemItemEnum | null {
  const token = normalizeToken(value);

  if (!token) {
    return null;
  }

  if (
    token === 'criado_como_risco' ||
    token === 'created_as_risk' ||
    token === 'created_as_risco'
  ) {
    return OrigemItemEnum.CRIADO_COMO_RISCO;
  }

  if (
    token === 'criado_como_problema' ||
    token === 'created_as_problem' ||
    token === 'created_as_problema'
  ) {
    return OrigemItemEnum.CRIADO_COMO_PROBLEMA;
  }

  if (
    token === 'risco_convertido' ||
    token === 'converted_from_risk'
  ) {
    return OrigemItemEnum.RISCO_CONVERTIDO;
  }

  return null;
}

function inferOrigem(
  tipo_inicial: TipoInicialEnum,
  natureza_atual: NaturezaAtualEnum,
  origem_raw?: unknown
): OrigemItemEnum {
  const normalizedOrigem = normalizeOrigem(origem_raw);

  if (normalizedOrigem) {
    return normalizedOrigem;
  }

  if (
    tipo_inicial === TipoInicialEnum.RISCO &&
    natureza_atual === NaturezaAtualEnum.PROBLEMA
  ) {
    return OrigemItemEnum.RISCO_CONVERTIDO;
  }

  return getDefaultOrigemByTipoInicial(tipo_inicial);
}

function normalizeRiskStatusToken(token: string): StatusRiscoEnum | null {
  const aliases: Record<string, StatusRiscoEnum> = {
    identificado: StatusRiscoEnum.IDENTIFICADO,
    em_analise: StatusRiscoEnum.EM_ANALISE,
    under_analysis: StatusRiscoEnum.EM_ANALISE,
    em_tratamento: StatusRiscoEnum.EM_ANALISE,
    plano_acao_definido: StatusRiscoEnum.PLANO_ACAO_DEFINIDO,
    action_plan_defined: StatusRiscoEnum.PLANO_ACAO_DEFINIDO,
    em_monitoramento: StatusRiscoEnum.EM_MONITORAMENTO,
    under_monitoring: StatusRiscoEnum.EM_MONITORAMENTO,
    mitigado: StatusRiscoEnum.MITIGADO,
    mitigated: StatusRiscoEnum.MITIGADO,
    encerrado: StatusRiscoEnum.ENCERRADO,
    closed: StatusRiscoEnum.ENCERRADO,
  };

  return aliases[token] ?? null;
}

function normalizeProblemStatusToken(token: string): StatusProblemaEnum | null {
  const aliases: Record<string, StatusProblemaEnum> = {
    aberto: StatusProblemaEnum.ABERTO,
    open: StatusProblemaEnum.ABERTO,
    identificado: StatusProblemaEnum.ABERTO,
    em_tratamento: StatusProblemaEnum.EM_TRATAMENTO,
    in_treatment: StatusProblemaEnum.EM_TRATAMENTO,
    em_resolucao: StatusProblemaEnum.EM_TRATAMENTO,
    aguardando_terceiro: StatusProblemaEnum.AGUARDANDO_TERCEIRO,
    waiting_third_party: StatusProblemaEnum.AGUARDANDO_TERCEIRO,
    aguardando_validacao: StatusProblemaEnum.AGUARDANDO_VALIDACAO,
    waiting_validation: StatusProblemaEnum.AGUARDANDO_VALIDACAO,
    resolvido: StatusProblemaEnum.RESOLVIDO,
    resolved: StatusProblemaEnum.RESOLVIDO,
    encerrado: StatusProblemaEnum.ENCERRADO,
    closed: StatusProblemaEnum.ENCERRADO,
  };

  return aliases[token] ?? null;
}

function normalizeStatusOperacional(
  value: unknown,
  natureza_atual: NaturezaAtualEnum
): StatusOperacional {
  const token = normalizeToken(value);

  if (natureza_atual === NaturezaAtualEnum.RISCO) {
    const byAlias = normalizeRiskStatusToken(token);
    if (byAlias) {
      return byAlias;
    }

    const exact = RISK_STATUS_VALUES.find(
      (item) => normalizeToken(item) === token
    );

    return exact ?? StatusRiscoEnum.IDENTIFICADO;
  }

  const byAlias = normalizeProblemStatusToken(token);
  if (byAlias) {
    return byAlias;
  }

  const exact = PROBLEM_STATUS_VALUES.find(
    (item) => normalizeToken(item) === token
  );

  return exact ?? StatusProblemaEnum.ABERTO;
}

function pickContextualImpact(
  legacy: LegacyRiskProblemApiShape,
  natureza_atual: NaturezaAtualEnum
): {
  impacto_inerente: number | null;
  impacto_realizado: number | null;
} {
  const impacto_generico = toNullableNumber(legacy.impacto);
  const impacto_inerente_oficial = toNullableNumber(
    legacy.impacto_inerente ?? legacy.impacto_potencial
  );
  const impacto_realizado_oficial = toNullableNumber(
    legacy.impacto_realizado ?? legacy.impacto_atual
  );

  if (natureza_atual === NaturezaAtualEnum.RISCO) {
    return {
      impacto_inerente: impacto_inerente_oficial ?? impacto_generico,
      impacto_realizado: impacto_realizado_oficial,
    };
  }

  return {
    impacto_inerente: impacto_inerente_oficial,
    impacto_realizado: impacto_realizado_oficial ?? impacto_generico,
  };
}

function buildEntityId(value: unknown): string {
  const parsed = toNullableString(value);
  return parsed ?? '';
}

function normalizeHistoricoTipoEvento(
  value: unknown
): HistoricoEvento['tipo_evento'] {
  const token = normalizeToken(value);

  const allowed: HistoricoEvento['tipo_evento'][] = [
    'item_criado',
    'status_alterado',
    'data_alvo_alterada',
    'responsavel_alterado',
    'convertido_em_problema',
    'item_encerrado',
    'campo_atualizado',
  ];

  return allowed.includes(token as HistoricoEvento['tipo_evento'])
    ? (token as HistoricoEvento['tipo_evento'])
    : 'campo_atualizado';
}

function normalizeHistoricoEventos(value: unknown): HistoricoEvento[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null
    )
    .map((item, index) => ({
      id: toNullableString(item.id) ?? `historico_${index}`,
      tipo_evento: normalizeHistoricoTipoEvento(item.tipo_evento),
      data_evento:
        toNullableString(item.data_evento) ?? new Date().toISOString(),
      autor:
        item.autor && typeof item.autor === 'object'
          ? {
              id:
                toNullableString((item.autor as Record<string, unknown>).id) ??
                '',
              nome:
                toNullableString((item.autor as Record<string, unknown>).nome) ??
                '',
            }
          : null,
      campo: toNullableString(item.campo),
      valor_anterior: item.valor_anterior,
      valor_novo: item.valor_novo,
      observacao: toNullableString(item.observacao),
    }));
}

export function mapLegacyApiToEntity(
  legacy: LegacyRiskProblemApiShape
): RiskProblemEntity {
  const tipo_inicial = legacy.tipo_inicial
    ? normalizeTipoInicial(legacy.tipo_inicial)
    : TipoInicialEnum.RISCO;

  const natureza_atual = legacy.natureza_atual
    ? normalizeNaturezaAtual(legacy.natureza_atual)
    : getDefaultNaturezaByTipoInicial(tipo_inicial);

  let status_operacional = legacy.status_operacional
    ? normalizeStatusOperacional(legacy.status_operacional, natureza_atual)
    : getDefaultStatusByTipoInicial(tipo_inicial);

  const origem = inferOrigem(tipo_inicial, natureza_atual, legacy.origem);

  const data_encerramento = toNullableString(
    legacy.data_encerramento ??
      (legacy as LegacyRiskProblemApiShape & { encerrado_em?: unknown })
        .encerrado_em
  );

  const observacao_encerramento = toNullableString(
    legacy.observacao_encerramento ??
      (legacy as LegacyRiskProblemApiShape & { observacoes?: unknown })
        .observacoes
  );

  if (data_encerramento && !isFinalStatus(status_operacional)) {
    status_operacional = getFinalStatusByNatureza(natureza_atual);
  }

  const probabilidade_inerente = toNullableNumber(
    legacy.probabilidade_inerente ?? legacy.probabilidade
  );

  const { impacto_inerente, impacto_realizado } = pickContextualImpact(
    legacy,
    natureza_atual
  );

  const eficacia_controle = toNullableNumber(
    legacy.eficacia_controle ??
      legacy.efetividade_controle ??
      legacy.mitigacao
  );

  const probabilidade_residual = toNullableNumber(
    legacy.probabilidade_residual
  );

  const impacto_residual = toNullableNumber(legacy.impacto_residual);

  const urgencia_solucao = toNullableNumber(
    legacy.urgencia_solucao ?? legacy.urgencia
  );

  const nivel_risco_inerente =
    probabilidade_inerente !== null && impacto_inerente !== null
      ? calcularNivelRiscoInerente(
          probabilidade_inerente,
          impacto_inerente
        )
      : toNullableNumber(legacy.nivel_risco_inerente);

  const nivel_risco_residual =
    probabilidade_residual !== null && impacto_residual !== null
      ? calcularNivelRiscoResidual(
          probabilidade_residual,
          impacto_residual
        )
      : toNullableNumber(legacy.nivel_risco_residual);

  const prioridade_problema =
    impacto_realizado !== null && urgencia_solucao !== null
      ? calcularPrioridadeProblema(
          impacto_realizado,
          urgencia_solucao
        )
      : toNullableNumber(
          legacy.prioridade_problema ?? legacy.prioridade
        );

  return {
    id: buildEntityId(legacy.id),
    tipo_inicial,
    natureza_atual,
    status_operacional,
    origem,
    data_entrada: toNullableString(legacy.data_entrada),

    descricao: sanitizeRequiredText(legacy.descricao),
    causa_raiz: sanitizeRequiredText(legacy.causa_raiz),
    descricao_impacto: sanitizeRequiredText(legacy.descricao_impacto),

    acao_corretiva_controle: sanitizeRequiredText(
      legacy.acao_corretiva_controle ?? legacy.acao_corretiva
    ),
    agente_solucao: toNullableString(
      legacy.agente_solucao ?? legacy.responsavel
    ),
    coordenador_agente: toNullableString(legacy.coordenador_agente),
    data_alvo_solucao: toNullableString(
      legacy.data_alvo_solucao ?? legacy.data_prazo
    ),

    probabilidade_inerente,
    impacto_inerente,
    nivel_risco_inerente,
    eficacia_controle,
    probabilidade_residual,
    impacto_residual,
    nivel_risco_residual,

    impacto_realizado,
    urgencia_solucao,
    prioridade_problema,

    convertido_em_problema_em: toNullableString(
      (legacy as LegacyRiskProblemApiShape & { convertido_em_problema_em?: unknown })
        .convertido_em_problema_em
    ),
    data_transicao_problema: toNullableString(
      legacy.data_transicao_problema ??
        (legacy as LegacyRiskProblemApiShape & { convertido_em_problema_em?: unknown })
          .convertido_em_problema_em
    ),
    
    motivo_transicao: toNullableString(legacy.motivo_transicao),
    controle_aplicado: toNullableSimNao(legacy.controle_aplicado),
    controle_efetivo: toNullableSimNao(legacy.controle_efetivo),
    data_encerramento,
    observacao_encerramento,
    historico_eventos: normalizeHistoricoEventos(legacy.historico_eventos),
  };
}

export function mapApiListToListItems(
  items: unknown[]
): RiskProblemListItem[] {
  return items.map((item) =>
    mapEntityToListItem(
      mapLegacyApiToEntity(item as LegacyRiskProblemApiShape)
    )
  );
}

export function mapEntityToListItem(
  entity: RiskProblemEntity
): RiskProblemListItem {
  const classificacao_atual =
    entity.natureza_atual === NaturezaAtualEnum.RISCO
      ? entity.nivel_risco_residual
      : entity.prioridade_problema;

  return {
    ...entity,
    classificacao_atual: classificacao_atual ?? null,
  };
}

export function mapEntityToFormData(
  entity: RiskProblemEntity
): RiskProblemFormData {
  return {
    tipo_inicial: entity.tipo_inicial,
    natureza_atual: entity.natureza_atual,
    status_operacional: entity.status_operacional,

    descricao: entity.descricao,
    causa_raiz: entity.causa_raiz,
    descricao_impacto: entity.descricao_impacto,

    acao_corretiva_controle: entity.acao_corretiva_controle,
    agente_solucao: entity.agente_solucao ?? null,
    coordenador_agente: entity.coordenador_agente ?? null,
    data_alvo_solucao: entity.data_alvo_solucao ?? null,

    probabilidade_inerente: entity.probabilidade_inerente ?? null,
    impacto_inerente: entity.impacto_inerente ?? null,
    eficacia_controle: entity.eficacia_controle ?? null,
    probabilidade_residual: entity.probabilidade_residual ?? null,
    impacto_residual: entity.impacto_residual ?? null,

    impacto_realizado: entity.impacto_realizado ?? null,
    urgencia_solucao: entity.urgencia_solucao ?? null,
  };
}

export function mapFormToCreateRequest(
  form: RiskProblemFormData
): RiskProblemCreateRequest {
  const tipo_inicial = form.tipo_inicial;
  const natureza_atual =
    form.natureza_atual ?? getDefaultNaturezaByTipoInicial(tipo_inicial);
  const status_operacional =
    form.status_operacional ?? getDefaultStatusByTipoInicial(tipo_inicial);
  const origem =
    form.tipo_inicial === TipoInicialEnum.RISCO
      ? OrigemItemEnum.CRIADO_COMO_RISCO
      : OrigemItemEnum.CRIADO_COMO_PROBLEMA;

  const prioridade_problema =
    form.impacto_realizado !== null &&
    form.impacto_realizado !== undefined &&
    form.urgencia_solucao !== null &&
    form.urgencia_solucao !== undefined
      ? calcularPrioridadeProblema(
          form.impacto_realizado,
          form.urgencia_solucao
        )
      : null;

  const payload: CreateCompatibilityPayload = {
    tipo_inicial,
    natureza_atual,
    status_operacional,
    origem,

    descricao: sanitizeRequiredText(form.descricao),
    causa_raiz: sanitizeRequiredText(form.causa_raiz),
    descricao_impacto: sanitizeRequiredText(form.descricao_impacto),

    acao_corretiva_controle: sanitizeRequiredText(
      form.acao_corretiva_controle
    ),
    agente_solucao: toNullableString(form.agente_solucao),
    coordenador_agente: toNullableString(form.coordenador_agente),
    data_alvo_solucao: toNullableString(form.data_alvo_solucao),

    probabilidade_inerente: form.probabilidade_inerente ?? null,
    impacto_inerente: form.impacto_inerente ?? null,
    eficacia_controle: form.eficacia_controle ?? null,
    probabilidade_residual: form.probabilidade_residual ?? null,
    impacto_residual: form.impacto_residual ?? null,

    impacto_realizado: form.impacto_realizado ?? null,
    urgencia_solucao: form.urgencia_solucao ?? null,

    // Compatibilidade transitória com backend atual
    probabilidade: form.probabilidade_inerente ?? null,
    impacto_potencial: form.impacto_inerente ?? null,
    efetividade_controle: form.eficacia_controle ?? null,
    impacto_atual: form.impacto_realizado ?? null,
    urgencia: form.urgencia_solucao ?? null,
    prioridade: prioridade_problema,
    acao_corretiva: sanitizeRequiredText(form.acao_corretiva_controle),
  };

  return payload;
}

export function mapFormToUpdateRequest(
  form: RiskProblemFormData,
  original?: RiskProblemEntity
): RiskProblemUpdateRequest {
  const prioridade_problema =
    form.impacto_realizado !== null &&
    form.impacto_realizado !== undefined &&
    form.urgencia_solucao !== null &&
    form.urgencia_solucao !== undefined
      ? calcularPrioridadeProblema(
          form.impacto_realizado,
          form.urgencia_solucao
        )
      : null;

  const next: UpdateCompatibilityPayload = {
    status_operacional: form.status_operacional,
    descricao: sanitizeRequiredText(form.descricao),
    causa_raiz: sanitizeRequiredText(form.causa_raiz),
    descricao_impacto: sanitizeRequiredText(form.descricao_impacto),
    acao_corretiva_controle: sanitizeRequiredText(
      form.acao_corretiva_controle
    ),
    agente_solucao: toNullableString(form.agente_solucao),
    coordenador_agente: toNullableString(form.coordenador_agente),
    data_alvo_solucao: toNullableString(form.data_alvo_solucao),
    probabilidade_inerente: form.probabilidade_inerente ?? null,
    impacto_inerente: form.impacto_inerente ?? null,
    eficacia_controle: form.eficacia_controle ?? null,
    probabilidade_residual: form.probabilidade_residual ?? null,
    impacto_residual: form.impacto_residual ?? null,
    impacto_realizado: form.impacto_realizado ?? null,
    urgencia_solucao: form.urgencia_solucao ?? null,

    // Compatibilidade transitória com backend atual
    probabilidade: form.probabilidade_inerente ?? null,
    impacto_potencial: form.impacto_inerente ?? null,
    efetividade_controle: form.eficacia_controle ?? null,
    impacto_atual: form.impacto_realizado ?? null,
    urgencia: form.urgencia_solucao ?? null,
    prioridade: prioridade_problema,
    acao_corretiva: sanitizeRequiredText(form.acao_corretiva_controle),
  };

  if (!original) {
    return next;
  }

  const update: UpdateCompatibilityPayload = {};

  if (areDifferent(next.status_operacional, original.status_operacional)) {
    update.status_operacional = next.status_operacional;
  }

  if (areDifferent(next.descricao, original.descricao)) {
    update.descricao = next.descricao;
  }

  if (areDifferent(next.causa_raiz, original.causa_raiz)) {
    update.causa_raiz = next.causa_raiz;
  }

  if (areDifferent(next.descricao_impacto, original.descricao_impacto)) {
    update.descricao_impacto = next.descricao_impacto;
  }

  if (
    areDifferent(
      next.acao_corretiva_controle,
      original.acao_corretiva_controle
    )
  ) {
    update.acao_corretiva_controle = next.acao_corretiva_controle;
    update.acao_corretiva = next.acao_corretiva;
  }

  if (areDifferent(next.agente_solucao, original.agente_solucao)) {
    update.agente_solucao = next.agente_solucao;
  }

  if (
    areDifferent(next.coordenador_agente, original.coordenador_agente)
  ) {
    update.coordenador_agente = next.coordenador_agente;
  }

  if (
    areDifferent(next.data_alvo_solucao, original.data_alvo_solucao)
  ) {
    update.data_alvo_solucao = next.data_alvo_solucao;
  }

  if (
    areDifferent(
      next.probabilidade_inerente,
      original.probabilidade_inerente
    )
  ) {
    update.probabilidade_inerente = next.probabilidade_inerente;
    update.probabilidade = next.probabilidade;
  }

  if (areDifferent(next.impacto_inerente, original.impacto_inerente)) {
    update.impacto_inerente = next.impacto_inerente;
    update.impacto_potencial = next.impacto_potencial;
  }

  if (areDifferent(next.eficacia_controle, original.eficacia_controle)) {
    update.eficacia_controle = next.eficacia_controle;
    update.efetividade_controle = next.efetividade_controle;
  }

  if (
    areDifferent(
      next.probabilidade_residual,
      original.probabilidade_residual
    )
  ) {
    update.probabilidade_residual = next.probabilidade_residual;
  }

  if (areDifferent(next.impacto_residual, original.impacto_residual)) {
    update.impacto_residual = next.impacto_residual;
  }

  if (areDifferent(next.impacto_realizado, original.impacto_realizado)) {
    update.impacto_realizado = next.impacto_realizado;
    update.impacto_atual = next.impacto_atual;
  }

  if (areDifferent(next.urgencia_solucao, original.urgencia_solucao)) {
    update.urgencia_solucao = next.urgencia_solucao;
    update.urgencia = next.urgencia;
    update.prioridade = next.prioridade;
  }

  return update;
}

export function mapCloseFormToRequest(
  item: Pick<RiskProblemEntity, 'natureza_atual'>,
  form: CloseRiskProblemFormData
): CloseRiskProblemRequest {
  const payload: CloseCompatibilityPayload = {
    data_encerramento: sanitizeRequiredText(form.data_encerramento),
    observacao_encerramento: sanitizeRequiredText(
      form.observacao_encerramento
    ),
    status_operacional: getFinalStatusByNatureza(item.natureza_atual),
  };

  return payload;
}