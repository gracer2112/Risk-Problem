// src/hooks/useRiskProblems.ts

'use client';

import { useCallback, useState } from 'react';
import type {
  RiskProblemEntity,
  RiskProblemFormData,
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
  deleteItem: (itemId: string) => Promise<void>;
  clearError: () => void;
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setHandledError = useCallback((err: unknown, fallback: string) => {
    const message = getErrorMessage(err, fallback);
    setError(message);
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

  const createItem = useCallback(
    async (form: RiskProblemFormData): Promise<RiskProblemEntity> => {
      setError(null);

      try {
        const createdEntity = await riskProblemService.create(projectId, form);
        const createdListItem = mapEntityToListItem(createdEntity);

        setItems((prev) => [createdListItem, ...prev]);

        return createdEntity;
      } catch (err) {
        setHandledError(err, 'Não foi possível criar o item.');
        throw err;
      }
    },
    [projectId, setHandledError]
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

        const updatedListItem = mapEntityToListItem(updatedEntity);

        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? updatedListItem : item))
        );

        return updatedEntity;
      } catch (err) {
        setHandledError(err, 'Não foi possível atualizar o item.');
        throw err;
      }
    },
    [projectId, setHandledError]
  );

  const deleteItem = useCallback(
    async (itemId: string): Promise<void> => {
      setError(null);

      try {
        await riskProblemService.delete(projectId, itemId);

        setItems((prev) => prev.filter((item) => item.id !== itemId));
      } catch (err) {
        setHandledError(err, 'Não foi possível excluir o item.');
        throw err;
      }
    },
    [projectId, setHandledError]
  );

  return {
    items,
    loading,
    error,
    loadItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  };
}