// sr/hooks/useGMUD.ts

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  GMUDResponseDTO as GMUDEntity,
  GMUDListItemResponseDTO as GMUDItemListagem,
  CriarGMUDRequestDTO as PayloadCriarGMUD,
  AtualizarGMUDRequestDTO as PayloadAtualizarGMUD,
  GMUDKPIs,
  PayloadTransicaoStatusGMUD,
  PayloadRegistrarRollbackGMUD
} from '@/types/gmud';

import {
  gmudService,
  type GMUDHistoryResult,
  type GMUDListFilters,
} from '@/services/api.gmud';

import { mapEntityToGMUDListItem } from '@/services/gmud.mapper';

export type UseGMUDReturn = {
  items: GMUDItemListagem[];
  total: number;
  kpis: GMUDKPIs | null;
  loading: boolean;
  error: string | null;
  historyByItemId: Record<string, GMUDHistoryResult>;
  historyLoadingItemId: string | null;
  historyError: string | null;
  loadItems: (filters?: GMUDListFilters) => Promise<void>;
  loadItemById: (itemId: string) => Promise<GMUDEntity>;
  loadKPIs: () => Promise<void>;
  loadHistory: (itemId: string, options?: { force?: boolean }) => Promise<GMUDHistoryResult>;
  createItem: (payload: PayloadCriarGMUD) => Promise<GMUDEntity>;
  updateItem: (itemId: string, payload: PayloadAtualizarGMUD) => Promise<GMUDEntity>;
  transitionStatus: (itemId: string, payload: PayloadTransicaoStatusGMUD) => Promise<GMUDEntity>;
  registerRollback: (itemId: string, payload: PayloadRegistrarRollbackGMUD) => Promise<GMUDEntity>;
  deleteItem: (itemId: string) => Promise<void>;
  clearError: () => void;
  clearHistory: (itemId?: string) => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function useGMUD(projectId?: string | null): UseGMUDReturn {
  const [items, setItems] = useState<GMUDItemListagem[]>([]);
  const [total, setTotal] = useState(0);
  const [kpis, setKpis] = useState<GMUDKPIs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyByItemId, setHistoryByItemId] = useState<Record<string, GMUDHistoryResult>>({});
  const [historyLoadingItemId, setHistoryLoadingItemId] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const latestLoadItemsRequestId = useRef(0);
  const itemsRef = useRef<GMUDItemListagem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    latestLoadItemsRequestId.current++;
    itemsRef.current = [];
    setItems([]);
    setTotal(0);
    setKpis(null);
    setError(null);
    setHistoryByItemId({});
    setHistoryLoadingItemId(null);
    setHistoryError(null);
    setLoading(false);
  }, [projectId]);

  const requireProjectId = useCallback((): string => {
    if (!projectId || !projectId.trim()) {
      throw new Error('Projeto não selecionado para operação de GMUD.');
    }

    return projectId.trim();
  }, [projectId]);

  const clearError = useCallback(() => {
    setError(null);
    setHistoryError(null);
  }, []);

  const setHandledError = useCallback((err: unknown, fallback: string) => {
    setError(getErrorMessage(err, fallback));
  }, []);

  const clearHistory = useCallback((itemId?: string) => {
    setHistoryError(null);

    if (!itemId) {
      setHistoryLoadingItemId(null);
      setHistoryByItemId({});
      return;
    }

    setHistoryLoadingItemId((current) =>
      current === itemId ? null : current,
    );

    setHistoryByItemId((prev) => {
      if (!prev[itemId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const invalidateHistory = useCallback((itemId: string) => {
    clearHistory(itemId);
  }, [clearHistory]);

  const upsertListItem = useCallback((entity: GMUDEntity) => {
    const nextListItem = mapEntityToGMUDListItem(entity);
    const currentItems = itemsRef.current;
    const exists = currentItems.some((item) => item.id === entity.id);

    const nextItems = exists
      ? currentItems.map((item) =>
          item.id === entity.id ? nextListItem : item,
        )
      : [nextListItem, ...currentItems];

    itemsRef.current = nextItems;
    setItems(nextItems);

    if (!exists) {
      setTotal((current) => current + 1);
    }
  }, []);

  const loadItems = useCallback(async (filters?: GMUDListFilters): Promise<void> => {
    const currentRequestId = ++latestLoadItemsRequestId.current;

    if (!projectId || !projectId.trim()) {
      itemsRef.current = [];
      setItems([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const safeProjectId = requireProjectId();

    try {
      const response = await gmudService.list(safeProjectId, filters);

      if (currentRequestId !== latestLoadItemsRequestId.current) {
        return;
      }

      itemsRef.current = response.items;
      setItems(response.items);
      setTotal(response.total);
    } catch (err) {
      if (currentRequestId !== latestLoadItemsRequestId.current) {
        return;
      }

      setHandledError(err, 'Não foi possível carregar a lista de GMUD.');
    } finally {
      if (currentRequestId === latestLoadItemsRequestId.current) {
        setLoading(false);
      }
    }
  }, [projectId, requireProjectId, setHandledError]);

  const loadKPIs = useCallback(async (): Promise<void> => {
    if (!projectId || !projectId.trim()) {
      setKpis(null);
      setError(null);
      return;
    }

    setError(null);

    try {
      const safeProjectId = requireProjectId();
      const response = await gmudService.getKPIs(safeProjectId);
      setKpis(response);
    } catch (err) {
      setHandledError(err, 'Não foi possível carregar os KPIs de GMUD.');
    }
  }, [projectId, requireProjectId, setHandledError]);

  const loadItemById = useCallback(async (itemId: string): Promise<GMUDEntity> => {
    setError(null);

    try {
      const safeProjectId = requireProjectId();
      const entity = await gmudService.getById(safeProjectId, itemId);
      upsertListItem(entity);
      return entity;
    } catch (err) {
      setHandledError(err, 'Não foi possível carregar a GMUD selecionada.');
      throw err;
    }
  }, [requireProjectId, setHandledError, upsertListItem]);

  const loadHistory = useCallback(async (
    itemId: string,
    options?: { force?: boolean },
  ): Promise<GMUDHistoryResult> => {
    setHistoryError(null);

    const shouldUseCache = !options?.force;
    const cached = historyByItemId[itemId];

    if (shouldUseCache && cached) {
      return cached;
    }

    setHistoryLoadingItemId(itemId);

    try {
      const safeProjectId = requireProjectId();
      const response = await gmudService.getHistory(safeProjectId, itemId);

      setHistoryByItemId((prev) => ({
        ...prev,
        [itemId]: response,
      }));

      return response;
    } catch (err) {
      setHistoryError(getErrorMessage(err, 'Não foi possível carregar o histórico da GMUD.'));
      throw err;
    } finally {
      setHistoryLoadingItemId((current) =>
        current === itemId ? null : current,
      );
    }
  }, [historyByItemId, requireProjectId]);

  const createItem = useCallback(async (payload: PayloadCriarGMUD): Promise<GMUDEntity> => {
    setError(null);

    try {
      const safeProjectId = requireProjectId();
      const createdEntity = await gmudService.create(safeProjectId, payload);
      upsertListItem(createdEntity);
      return createdEntity;
    } catch (err) {
      setHandledError(err, 'Não foi possível criar a GMUD.');
      throw err;
    }
  }, [requireProjectId, setHandledError, upsertListItem]);

  const updateItem = useCallback(async (itemId: string, payload: PayloadAtualizarGMUD): Promise<GMUDEntity> => {
    setError(null);

    try {
      const safeProjectId = requireProjectId();
      const updatedEntity = await gmudService.update(safeProjectId, itemId, payload);
      upsertListItem(updatedEntity);
      invalidateHistory(itemId);
      return updatedEntity;
    } catch (err) {
      setHandledError(err, 'Não foi possível atualizar a GMUD.');
      throw err;
    }
  }, [invalidateHistory, requireProjectId, setHandledError, upsertListItem]);

  const transitionStatus = useCallback(async (
    itemId: string,
    payload: PayloadTransicaoStatusGMUD,
  ): Promise<GMUDEntity> => {
    setError(null);

    try {
      const safeProjectId = requireProjectId();
      const updatedEntity = await gmudService.transitionStatus(safeProjectId, itemId, payload);
      upsertListItem(updatedEntity);
      invalidateHistory(itemId);
      return updatedEntity;
    } catch (err) {
      setHandledError(err, 'Não foi possível alterar o status da GMUD.');
      throw err;
    }
  }, [invalidateHistory, requireProjectId, setHandledError, upsertListItem]);

  const registerRollback = useCallback(async (
    itemId: string,
    payload: PayloadRegistrarRollbackGMUD,
  ): Promise<GMUDEntity> => {
    setError(null);

    try {
      const safeProjectId = requireProjectId();
      const updatedEntity = await gmudService.registerRollback(safeProjectId, itemId, payload);
      upsertListItem(updatedEntity);
      invalidateHistory(itemId);
      return updatedEntity;
    } catch (err) {
      setHandledError(err, 'Não foi possível registrar o rollback da GMUD.');
      throw err;
    }
  }, [invalidateHistory, requireProjectId, setHandledError, upsertListItem]);

  const deleteItem = useCallback(async (itemId: string): Promise<void> => {
    setError(null);

    try {
      const safeProjectId = requireProjectId();
      await gmudService.delete(safeProjectId, itemId);

      const currentItems = itemsRef.current;
      const exists = currentItems.some((item) => item.id === itemId);
      const nextItems = currentItems.filter((item) => item.id !== itemId);

      itemsRef.current = nextItems;
      setItems(nextItems);

      if (exists) {
        setTotal((current) => Math.max(0, current - 1));
      }

      clearHistory(itemId);
    } catch (err) {
      setHandledError(err, 'Não foi possível excluir a GMUD.');
      throw err;
    }
  }, [clearHistory, requireProjectId, setHandledError]);

  return {
    items,
    total,
    kpis,
    loading,
    error,
    historyByItemId,
    historyLoadingItemId,
    historyError,
    loadItems,
    loadItemById,
    loadKPIs,
    loadHistory,
    createItem,
    updateItem,
    transitionStatus,
    registerRollback,
    deleteItem,
    clearError,
    clearHistory,
  };
}