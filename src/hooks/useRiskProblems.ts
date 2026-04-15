// src/hooks/useRiskProblems.ts

'use client';

import { useCallback, useState } from 'react';

import type {
  CloseRiskProblemFormData,
  ConvertRiskToProblemRequest,
  RiskProblemEntity,
  RiskProblemFormData,
  RiskProblemHistoryResponse,
  RiskProblemListItem,
} from '@/types/risk-problem';

import { riskProblemService } from '@/services/api';
import { mapEntityToListItem } from '@/services/risk-problem.mapper';

type ListFilters = {
  natureza?: string;
  status?: string;
};

type UseRiskProblemsReturn = {
  items: RiskProblemListItem[];
  loading: boolean;
  error: string | null;
  loadItems: (filters?: ListFilters) => Promise<void>;
  getItemById: (itemId: string) => Promise<RiskProblemEntity>;
  createItem: (form: RiskProblemFormData) => Promise<RiskProblemEntity>;
  updateItem: (
    itemId: string,
    form: RiskProblemFormData,
    original?: RiskProblemEntity
  ) => Promise<RiskProblemEntity>;
  convertToProblem: (
    itemId: string,
    payload: ConvertRiskToProblemRequest
  ) => Promise<RiskProblemEntity>;
  closeItem: (
    item: Pick<RiskProblemEntity, 'id' | 'natureza_atual'>,
    form: CloseRiskProblemFormData
  ) => Promise<RiskProblemEntity>;
  deleteItem: (itemId: string) => Promise<void>;
  clearError: () => void;
  historyByItemId: Record<string, RiskProblemHistoryResponse>;
  historyLoadingItemId: string | null;
  historyError: string | null;
  loadHistory: (
    itemId: string,
    options?: { force?: boolean }
  ) => Promise<RiskProblemHistoryResponse>;
  clearHistory: (itemId?: string) => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function useRiskProblems(projectId: string): UseRiskProblemsReturn {
  const [items, setItems] = useState<RiskProblemListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyByItemId, setHistoryByItemId] = useState<
    Record<string, RiskProblemHistoryResponse>
  >({});
  const [historyLoadingItemId, setHistoryLoadingItemId] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setHistoryError(null);
  }, []);

  const setHandledError = useCallback((err: unknown, fallback: string) => {
    const message = getErrorMessage(err, fallback);
    setError(message);
  }, []);

  const invalidateHistory = useCallback((itemId: string) => {
    setHistoryByItemId((prev) => {
      if (!prev[itemId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const clearHistory = useCallback((itemId?: string) => {
    setHistoryError(null);
    setHistoryLoadingItemId(null);

    if (!itemId) {
      setHistoryByItemId({});
      return;
    }

    setHistoryByItemId((prev) => {
      if (!prev[itemId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);  

  const upsertListItem = useCallback((entity: RiskProblemEntity) => {
    const nextListItem = mapEntityToListItem(entity);

    setItems((prev) => {
      const exists = prev.some((item) => item.id === entity.id);

      if (!exists) {
        return [nextListItem, ...prev];
      }

      return prev.map((item) =>
        item.id === entity.id ? nextListItem : item
      );
    });
  }, []);
  
  const loadItems = useCallback(
    async (filters?: ListFilters): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await riskProblemService.list(projectId, filters);
        setItems(response.items);
      } catch (err) {
        setHandledError(
          err,
          'Não foi possível carregar os riscos e problemas.'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, setHandledError]
  );

  const getItemById = useCallback(
    async (itemId: string): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        return await riskProblemService.getById(projectId, itemId);
      } catch (err) {
        setHandledError(
          err,
          'Não foi possível carregar o item selecionado.'
        );
        throw err;
      }
    },
    [projectId, setHandledError]
  );

  const loadHistory = useCallback(
    async (
      itemId: string,
      options?: { force?: boolean }
    ): Promise<RiskProblemHistoryResponse> => {
      setHistoryError(null);

      const shouldUseCache = !options?.force;
      const cached = historyByItemId[itemId];

      if (shouldUseCache && cached) {
        return cached;
      }

      setHistoryLoadingItemId(itemId);

      try {
        const response = await riskProblemService.getHistory(projectId, itemId);

        setHistoryByItemId((prev) => ({
          ...prev,
          [itemId]: response,
        }));

        return response;
      } catch (err) {
        const message = getErrorMessage(
          err,
          'Não foi possível carregar o histórico do item.'
        );

        setHistoryError(message);
        throw err;
      } finally {
        setHistoryLoadingItemId((current) =>
          current === itemId ? null : current
        );
      }
    },
    [projectId, historyByItemId]
  );

  const createItem = useCallback(
    async (form: RiskProblemFormData): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const createdEntity = await riskProblemService.create(projectId, form);
        upsertListItem(createdEntity);
        return createdEntity;

      } catch (err) {
        setHandledError(err, 'Não foi possível criar o item.');
        throw err;
      }
    },
    [projectId, setHandledError,upsertListItem]
  );

  const updateItem = useCallback(
    async (
      itemId: string,
      form: RiskProblemFormData,
      original?: RiskProblemEntity
    ): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const updatedEntity = await riskProblemService.update(
          projectId,
          itemId,
          form,
          original
        );

        upsertListItem(updatedEntity);

        invalidateHistory(itemId);

        return updatedEntity;

      } catch (err) {
        setHandledError(err, 'Não foi possível atualizar o item.');
        throw err;
      }
    },
    [projectId, setHandledError, upsertListItem, invalidateHistory]
  );

  const convertToProblem = useCallback(
    async (
      itemId: string,
      payload: ConvertRiskToProblemRequest
    ): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const convertedEntity =
          await riskProblemService.convertRiskToProblem(
            projectId,
            itemId,
            payload
          );

        upsertListItem(convertedEntity);
        invalidateHistory(itemId);

        return convertedEntity;
      } catch (err) {
        setHandledError(
          err,
          'Não foi possível converter o risco em problema.'
        );
        throw err;
      }
    },
    [projectId, setHandledError, upsertListItem, invalidateHistory]
  );

  const closeItem = useCallback(
    async (
      item: Pick<RiskProblemEntity, 'id' | 'natureza_atual'>,
      form: CloseRiskProblemFormData
    ): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const closedEntity = await riskProblemService.closeItem(
          projectId,
          item,
          form
        );

        upsertListItem(closedEntity);
        invalidateHistory(item.id);

        return closedEntity;
      } catch (err) {
        setHandledError(
          err,
          'Não foi possível encerrar o item.'
        );
        throw err;
      }
    },
    [projectId, setHandledError, upsertListItem, invalidateHistory]
  );

  const deleteItem = useCallback(
    async (itemId: string): Promise<void> => {
      setError(null);

      try {
        await riskProblemService.delete(projectId, itemId);

        setItems((prev) => prev.filter((item) => item.id !== itemId));
        clearHistory(itemId);
      } catch (err) {
        setHandledError(err, 'Não foi possível excluir o item.');
        throw err;
      }
    },
    [projectId, setHandledError, clearHistory]
  );

  return {
    items,
    loading,
    error,
    loadItems,
    getItemById,
    createItem,
    updateItem,
    convertToProblem,
    closeItem,
    deleteItem,
    clearError,
    historyByItemId,
    historyLoadingItemId,
    historyError,
    loadHistory,
    clearHistory,
  };

}