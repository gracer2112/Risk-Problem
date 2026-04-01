// src/hooks/useRiskProblems.ts

"use client"; // Next.js 13+ - Indica que é um Client Component

import { useState, useCallback } from "react";
import { RiskProblemItem, RiskProblemListResponse, RiskProblemCreateRequest } from "@/types/risk-problem";
import { riskProblemService } from "@/services/api";
import { MOCK_RISK_PROBLEM_ITEMS } from "@/utils/mock-data";

/**
 * HOOK: useRiskProblems
 * 
 * Gerencia todo o estado e lógica de Riscos/Problemas
 * Padrão: Custom Hook com React Hooks (useState, useCallback)
 * 
 * Exemplo de uso:
 * const { items, loading, error, createItem, updateItem, deleteItem } = useRiskProblems(projectId);
 */
// Adicione um helper no topo do arquivo
const FETCH_TIMEOUT = 10000; // 10 segundos

// Depois, em cada método:
/* headers: {
  "Content-Type": "application/json",
  ...getAuthHeaders(),
} */

interface UseRiskProblemsReturn {
  items: RiskProblemItem[];
  loading: boolean;
  error: string | null;
  loadItems: (filters?: any) => Promise<void>;
  createItem: (data: RiskProblemCreateRequest) => Promise<RiskProblemItem>;
  updateItem: (itemId: string, data: Partial<RiskProblemItem>) => Promise<RiskProblemItem>;
  deleteItem: (itemId: string) => Promise<void>;
}

export function useRiskProblems(projectId: string): UseRiskProblemsReturn {
  // ===== ESTADO =====
  const [items, setItems] = useState<RiskProblemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== FUNÇÃO: Carregar Lista =====
  const loadItems = useCallback(
    async (filters?: any) => {
        setLoading(true);
        setError(null);
        try {
        // Tenta carregar da API real
        const response = await riskProblemService.list(projectId, filters);
        setItems(response.items);
        } catch (err) {
        // Se falhar, usa dados mock (desenvolvimento)
        console.warn("API indisponível, usando dados mock para desenvolvimento");
        setItems(MOCK_RISK_PROBLEM_ITEMS);
        // Não seta erro, pois é comportamento esperado em desenvolvimento
        } finally {
        setLoading(false);
        }
    },
    [projectId]
);

  // ===== FUNÇÃO: Criar Item =====
  const createItem = useCallback(
    async (data: RiskProblemCreateRequest): Promise<RiskProblemItem> => {
      try {
        const newItem = await riskProblemService.create(projectId, data);
        console.log("Item criado:", newItem);

        setItems((prev) => [newItem,...prev]); // Adiciona à lista
        setError(null);

        return newItem;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao criar item";
        setError(errorMessage);
        throw err;
      }
    },
    [projectId]
  );

  // ===== FUNÇÃO: Atualizar Item =====
  const updateItem = useCallback(
    async (itemId: string, data: Partial<RiskProblemItem>): Promise<RiskProblemItem> => {
      try {
        const updated = await riskProblemService.update(projectId, itemId, data);
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? updated : item))
        );
        setError(null);
        return updated;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar item";
        setError(errorMessage);
        throw err;
      }
    },
    [projectId]
  );

  // ===== FUNÇÃO: Deletar Item =====
  const deleteItem = useCallback(
    async (itemId: string): Promise<void> => {
      try {
        await riskProblemService.remove(projectId, itemId);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao deletar item";
        setError(errorMessage);
        throw err;
      }
    },
    [projectId]
  );

  // ===== RETORNO =====
  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
  };
}
