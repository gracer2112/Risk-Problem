// src/services/gmud.mapper.ts

import {
  StatusGMUD,
  PrioridadeGMUD,
  ImpactoGMUD,
  AmbienteGMUD,
  TipoExecucaoGMUD,
  OrigemGMUD,
  GMUDKPIs,
  PayloadTransicaoStatusGMUD,
  PayloadRegistrarRollbackGMUD,
  StatusChecklistGMUD
} from '@/types/gmud';

import type {
  GMUDResponseDTO as GMUDEntity,
  GMUDListItemResponseDTO as GMUDItemListagem,
  CriarGMUDRequestDTO as PayloadCriarGMUD,
  AtualizarGMUDRequestDTO as PayloadAtualizarGMUD,
  PayloadChecklistItemGMUD,
  ChecklistItemGMUD,
  HistoricoItemGMUD,
  RollbackItemGMUD
} from '@/types/gmud';

import {
  normalizeChecklistGMUD,
  normalizeHistoricoGMUD,
  normalizeRollbackGMUD,
} from '@/utils/gmud-domain';

export interface GMUDApiShape {
  [key: string]: unknown;
}

export interface GMUDListResponse {
  items?: unknown[];
  data?: unknown[];
  total?: number;
  total_count?: number;
}

export interface GMUDHistoryResponse {
  items?: unknown[];
  data?: unknown[];
  total?: number;
}

const DEFAULT_GMUD_TITULO = 'Mudança sem título';
const EMPTY_DATA_ISO = '';

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeEnumLikeValue(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_').replace(/-/g, '_').toLowerCase();
}

function getString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  }
  return '';
}

function getNullableString(record: Record<string, unknown>, ...keys: string[]): string | null {
  const value = getString(record, ...keys);
  return value || null;
}

function getOptionalString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  const value = getString(record, ...keys);
  return value || undefined;
}

function getArray(record: Record<string, unknown>, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function getBoolean(record: Record<string, unknown>, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'sim', 'yes'].includes(normalized)) return true;
      if (['false', '0', 'nao', 'não', 'no'].includes(normalized)) return false;
    }
  }
  return false;
}

function getNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function getDateString(record: Record<string, unknown>, ...keys: string[]): string | null {
  const value = getString(record, ...keys);
  return value || null;
}

function parseEnumValue<T extends Record<string, string>>(enumObject: T, rawValue: unknown, fallback: T[keyof T]): T[keyof T] {
  const normalized = normalizeEnumLikeValue(rawValue);
  const values = Object.values(enumObject) as string[];
  if (values.includes(normalized)) return normalized as T[keyof T];
  return fallback;
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)) as T;
}

function mapPayloadChecklistItemToApi(item: PayloadChecklistItemGMUD): Record<string, unknown> {
  return stripUndefined({ descricao: item.descricao, status: item.status ?? StatusChecklistGMUD.PENDENTE, observacao: item.observacao });
}

export function mapApiChecklistItemToEntity(apiItem: unknown): ChecklistItemGMUD {
  const record = asRecord(apiItem);
  return {
    id: getString(record, 'id', 'checklist_item_id', 'uuid'),
    descricao: getString(record, 'descricao', 'description', 'titulo', 'title'),
    status: parseEnumValue(StatusChecklistGMUD, record.status ?? record.status_checklist, StatusChecklistGMUD.PENDENTE),
    observacao: getOptionalString(record, 'observacao', 'observation', 'notes'),
    data_conclusao: getDateString(record, 'data_conclusao', 'completed_at', 'concluido_em'),
  };
}

export function mapApiHistoricoItemToEntity(apiItem: unknown): HistoricoItemGMUD {
  const record = asRecord(apiItem);
  const statusAnteriorRaw = record.status_anterior ?? record.previous_status;
  const statusNovoRaw = record.status_novo ?? record.new_status;
  const statusAnteriorNormalizado = normalizeEnumLikeValue(statusAnteriorRaw);
  const statusNovoNormalizado = normalizeEnumLikeValue(statusNovoRaw);
  return {
    id: getString(record, 'id', 'history_item_id', 'uuid'),
    timestamp: getString(record, 'timestamp', 'created_at', 'data_evento', 'data') || EMPTY_DATA_ISO,
    tipo_evento: getString(record, 'tipo_evento', 'event_type', 'acao', 'action') || 'evento',
    usuario_id: getString(record, 'usuario_id', 'user_id', 'autor_id') || '',
    usuario_nome: getOptionalString(record, 'usuario_nome', 'user_name', 'autor_nome'),
    status_anterior: statusAnteriorNormalizado ? parseEnumValue(StatusGMUD, statusAnteriorRaw, StatusGMUD.RASCUNHO) : null,
    status_novo: statusNovoNormalizado ? parseEnumValue(StatusGMUD, statusNovoRaw, StatusGMUD.RASCUNHO) : null,
    observacao: getOptionalString(record, 'observacao', 'description', 'detalhes', 'notes'),
  };
}

export function mapApiRollbackItemToEntity(apiItem: unknown): RollbackItemGMUD {
  const record = asRecord(apiItem);
  return {
    id: getString(record, 'id', 'rollback_item_id', 'uuid'),
    descricao: getString(record, 'descricao', 'description', 'titulo', 'title'),
    executado: getBoolean(record, 'executado', 'executed', 'foi_executado'),
    data_execucao: getDateString(record, 'data_execucao', 'executed_at', 'executado_em'),
    observacao: getOptionalString(record, 'observacao', 'observation', 'notes'),
  };
}

export function mapApiGMUDToEntity(api: GMUDApiShape): GMUDEntity {
  const record = asRecord(api);
  const itensChecklist = normalizeChecklistGMUD(getArray(record, 'itens_checklist', 'checklist', 'checklist_items').map(mapApiChecklistItemToEntity));
  const historico = normalizeHistoricoGMUD(getArray(record, 'historico', 'history', 'historico_items', 'events').map(mapApiHistoricoItemToEntity));
  const eventosRollback = normalizeRollbackGMUD(getArray(record, 'eventos_rollback', 'rollback_eventos', 'rollback', 'rollbacks').map(mapApiRollbackItemToEntity));
  return {
    id: getString(record, 'id', 'gmud_id', 'change_id', 'uuid'),
    project_id: getString(record, 'project_id', 'projeto_id'),
    openproject_project_id: getNullableString(record, 'openproject_project_id', 'open_project_project_id', 'openproject_id'),
    titulo: getString(record, 'titulo', 'title', 'nome') || DEFAULT_GMUD_TITULO,
    descricao: getString(record, 'descricao', 'description'),
    status: parseEnumValue(StatusGMUD, record.status ?? record.status_atual ?? record.situacao, StatusGMUD.RASCUNHO),
    prioridade: parseEnumValue(PrioridadeGMUD, record.prioridade ?? record.priority, PrioridadeGMUD.BAIXA),
    impacto: parseEnumValue(ImpactoGMUD, record.impacto ?? record.impact, ImpactoGMUD.BAIXO),
    ambiente: parseEnumValue(AmbienteGMUD, record.ambiente ?? record.environment, AmbienteGMUD.HOMOLOGACAO),
    tipo_execucao: parseEnumValue(TipoExecucaoGMUD, record.tipo_execucao ?? record.execution_type, TipoExecucaoGMUD.MANUAL),
    origem: parseEnumValue(OrigemGMUD, record.origem ?? record.source ?? record.origin, OrigemGMUD.INTERNA),
    data_agendada: getDateString(record, 'data_agendada', 'agendado_em', 'data_execucao_programada', 'scheduled_at'),
    janela_execucao_inicio: getDateString(record, 'janela_execucao_inicio', 'janela_inicio', 'execution_window_start'),
    janela_execucao_fim: getDateString(record, 'janela_execucao_fim', 'janela_fim', 'execution_window_end'),
    solicitante: getNullableString(record, 'solicitante', 'requester', 'solicitante_nome'),
    responsavel_execucao: getNullableString(record, 'responsavel_execucao', 'executor', 'responsavel'),
    plano_rollback: getNullableString(record, 'plano_rollback', 'rollback_plan'),
    itens_checklist: itensChecklist,
    historico,
    eventos_rollback: eventosRollback,
    created_at: getString(record, 'created_at', 'data_criacao') || EMPTY_DATA_ISO,
    updated_at: getString(record, 'updated_at', 'data_atualizacao') || EMPTY_DATA_ISO,
  };
}

export function mapApiGMUDToListItem(api: GMUDApiShape): GMUDItemListagem {
  return mapEntityToGMUDListItem(mapApiGMUDToEntity(api));
}

export function mapEntityToGMUDListItem(entity: GMUDEntity): GMUDItemListagem {
  return {
    id: entity.id,
    project_id: entity.project_id,
    titulo: entity.titulo,
    status: entity.status,
    prioridade: entity.prioridade,
    impacto: entity.impacto,
    ambiente: entity.ambiente,
    data_agendada: entity.data_agendada,
    responsavel_execucao: entity.responsavel_execucao,
    updated_at: entity.updated_at,
  };
}

export function mapApiGMUDListResponse(response: GMUDListResponse): { items: GMUDItemListagem[]; total: number } {
  const itemsRaw = response.items ?? response.data ?? [];
  return { items: itemsRaw.map((item) => mapApiGMUDToListItem(item as GMUDApiShape)), total: Number(response.total ?? response.total_count ?? itemsRaw.length ?? 0) };
}

export function mapApiGMUDKPIs(api: unknown): GMUDKPIs {
  const record = asRecord(api);
  return {
    total: getNumber(record, 'total'),
    em_revisao: getNumber(record, 'em_revisao', 'in_review'),
    agendadas: getNumber(record, 'agendadas', 'scheduled'),
    em_execucao: getNumber(record, 'em_execucao', 'in_execution'),
    concluidas: getNumber(record, 'concluidas', 'completed'),
    rollbacks: getNumber(record, 'rollbacks', 'rollback_count'),
  };
}

export function mapPayloadCriarGMUDToApi(payload: PayloadCriarGMUD): Record<string, unknown> {
  return stripUndefined({
    project_id: payload.project_id,
    openproject_project_id: payload.openproject_project_id ?? null,
    titulo: payload.titulo,
    descricao: payload.descricao,
    prioridade: payload.prioridade,
    impacto: payload.impacto,
    ambiente: payload.ambiente,
    tipo_execucao: payload.tipo_execucao,
    origem: payload.origem,
    data_agendada: payload.data_agendada,
    janela_execucao_inicio: payload.janela_execucao_inicio,
    janela_execucao_fim: payload.janela_execucao_fim,
    solicitante: payload.solicitante,
    responsavel_execucao: payload.responsavel_execucao,
    plano_rollback: payload.plano_rollback,
    itens_checklist: payload.itens_checklist?.map(mapPayloadChecklistItemToApi),
  });
}

export function mapPayloadAtualizarGMUDToApi(payload: PayloadAtualizarGMUD): Record<string, unknown> {
  return stripUndefined({
    openproject_project_id: payload.openproject_project_id,
    titulo: payload.titulo,
    descricao: payload.descricao,
    prioridade: payload.prioridade,
    impacto: payload.impacto,
    ambiente: payload.ambiente,
    tipo_execucao: payload.tipo_execucao,
    origem: payload.origem,
    data_agendada: payload.data_agendada,
    janela_execucao_inicio: payload.janela_execucao_inicio,
    janela_execucao_fim: payload.janela_execucao_fim,
    solicitante: payload.solicitante,
    responsavel_execucao: payload.responsavel_execucao,
    plano_rollback: payload.plano_rollback,
    itens_checklist: payload.itens_checklist?.map(mapPayloadChecklistItemToApi),
  });
}

export function mapPayloadTransicaoStatusGMUDToApi(payload: PayloadTransicaoStatusGMUD): Record<string, unknown> {
  return stripUndefined({ para_status: payload.para_status, observacao: payload.observacao });
}

export function mapPayloadRegistrarRollbackGMUDToApi(payload: PayloadRegistrarRollbackGMUD): Record<string, unknown> {
  return stripUndefined({ descricao: payload.descricao, observacao: payload.observacao });
}
