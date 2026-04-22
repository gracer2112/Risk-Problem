// src/hooks/useRiskProblems.ts

'use client';

import { useCallback, useState , useEffect, useRef} from 'react';

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

type ProjectContext = Pick<RiskProblemEntity, 'project_id' | 'openproject_project_id'>;

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

export function useRiskProblems(projectId?: string | null, projectContext?: ProjectContext): UseRiskProblemsReturn {
  const [items, setItems] = useState<RiskProblemListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyByItemId, setHistoryByItemId] = useState<
    Record<string, RiskProblemHistoryResponse>
  >({});
  const [historyLoadingItemId, setHistoryLoadingItemId] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const latestLoadItemsRequestId = useRef(0);

  useEffect(() => {
      latestLoadItemsRequestId.current++;
      setItems([]);
      setError(null);
      setHistoryByItemId({});
      setHistoryLoadingItemId(null);
      setHistoryError(null);
      setLoading(false);
  }, [projectId]);

  const requireProjectId = useCallback((): string => {
    if (!projectId || !projectId.trim()) {
      throw new Error('Projeto não selecionado para operação de riscos e problemas.');
    }
    return projectId.trim();
  }, [projectId]);

  const clearError = useCallback(() => {
    setError(null);
    setHistoryError(null);
  }, []);

  const setHandledError = useCallback((err: unknown, fallback: string) => {
    const message = getErrorMessage(err, fallback);
    setError(message);
  }, []);

  const invalidateHistory = useCallback((itemId: string) => {
    setHistoryError(null);

    setHistoryLoadingItemId((current) =>
      current === itemId ? null : current
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

  const clearHistory = useCallback((itemId?: string) => {
    setHistoryError(null);

    if (!itemId) {
      setHistoryLoadingItemId(null);
      setHistoryByItemId({});
      return;
    }

    setHistoryLoadingItemId((current) =>
      current === itemId ? null : current
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
  
  const loadItems = useCallback(async (filters?: ListFilters): Promise<void> => {
    const currentRequestId = ++latestLoadItemsRequestId.current;
    if (!projectId || !projectId.trim()) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const safeProjectId = requireProjectId();
    try {
      const response = await riskProblemService.list(safeProjectId, filters);
      if (currentRequestId !== latestLoadItemsRequestId.current) return;
      setItems(response.items);
    } catch (err) {
      if (currentRequestId !== latestLoadItemsRequestId.current) return;
      setHandledError(err, 'Não foi possível carregar os riscos e problemas.');
    } finally {
      if (currentRequestId === latestLoadItemsRequestId.current) {
        setLoading(false);
      }
    }
  }, [projectId, requireProjectId, setHandledError]);
  const getItemById = useCallback(
    async (itemId: string): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const safeProjectId = requireProjectId();
        const entity = await riskProblemService.getById(safeProjectId, itemId);
        upsertListItem(entity);
        return entity;
      } catch (err) {
        setHandledError(err, 'Não foi possível carregar o item selecionado.');
        throw err;
      }
    },
    [requireProjectId, setHandledError, upsertListItem]
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
        const safeProjectId = requireProjectId();

        const response = await riskProblemService.getHistory(safeProjectId, itemId);

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
    [requireProjectId, historyByItemId]
  );

  const createItem = useCallback(async (form: RiskProblemFormData): Promise<RiskProblemEntity> => {
    setError(null);
    try {
      const safeProjectId = requireProjectId();
      const resolvedProjectContext = {
        project_id: projectContext?.project_id ?? safeProjectId,
        openproject_project_id: projectContext?.openproject_project_id ?? null
      };
      const createdEntity = await riskProblemService.create(safeProjectId, form, resolvedProjectContext);
      upsertListItem(createdEntity);
      return createdEntity;
    } catch (err) {
      setHandledError(err, 'Não foi possível criar o item.');
      throw err;
    }
  }, [requireProjectId, projectContext, setHandledError, upsertListItem]);

  const updateItem = useCallback(
    async (
      itemId: string,
      form: RiskProblemFormData,
      original?: RiskProblemEntity
    ): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const safeProjectId = requireProjectId();
 
        const updatedEntity = await riskProblemService.update(
          safeProjectId,
          itemId,
          form,
          original,
        );

        upsertListItem(updatedEntity);

        invalidateHistory(itemId);

        return updatedEntity;

      } catch (err) {
        setHandledError(err, 'Não foi possível atualizar o item.');
        throw err;
      }
    },
    [requireProjectId, setHandledError, upsertListItem, invalidateHistory]
  );

  const convertToProblem = useCallback(
    async (
      itemId: string,
      payload: ConvertRiskToProblemRequest
    ): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const safeProjectId = requireProjectId();

        const convertedEntity =
          await riskProblemService.convertRiskToProblem(
            safeProjectId,
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
    [requireProjectId, setHandledError, upsertListItem, invalidateHistory]
  );

  const closeItem = useCallback(
    async (
      item: Pick<RiskProblemEntity, 'id' | 'natureza_atual'>,
      form: CloseRiskProblemFormData
    ): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const safeProjectId = requireProjectId();

        const closedEntity = await riskProblemService.closeItem(
          safeProjectId,
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
    [requireProjectId, setHandledError, upsertListItem, invalidateHistory]
  );

  const deleteItem = useCallback(
    async (
      itemId: string 
    ): Promise<void> => {
      setError(null);

      try {
        const safeProjectId = requireProjectId();
 
        await riskProblemService.delete(safeProjectId, itemId);

        setItems((prev) => prev.filter((item) => item.id !== itemId));
        clearHistory(itemId);
      } catch (err) {
        setHandledError(err, 'Não foi possível excluir o item.');
        throw err;
      }
    },
    [requireProjectId, setHandledError, clearHistory]
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