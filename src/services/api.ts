// src/services/api.ts

import {
  RiskProblemItem,
  RiskProblemListResponse,
  RiskProblemCreateRequest,
} from "@/types/risk-problem";

import { fetchWithTimeout, getAuthHeaders  } from "@/lib/http/client";


/**
 * CONFIGURAÇÃO
 * URL da API vem de variável de ambiente
 * Em desenvolvimento: http://localhost:5000
 * Em produção: https://api.seu-dominio.com
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * SERVIÇO DE RISCO/PROBLEMA
 * Centraliza todas as chamadas REST para a API
 * Padrão: cada método retorna Promise<T>
 */

export const riskProblemService = {
  /**
   * Listar todos os itens de um projeto
   * GET /api/projects/{projectId}/risks-problems
   */
  async list(
    projectId: string,
    filters?: { natureza?: string; status?: string }
  ): Promise<RiskProblemListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.natureza) params.append("natureza", filters.natureza);
      if (filters?.status) params.append("status", filters.status);

      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/risks-problems?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao listar: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro em riskProblemService.list:", error);
      throw error;
    }
  },

  /**
   * Criar novo item
   * POST /api/projects/{projectId}/risks-problems
   */
  async create (
    projectId: string, 
    data: RiskProblemCreateRequest
    ): Promise<RiskProblemItem> {
    try {
      console.log("📤 Enviando para backend:", JSON.stringify(data, null, 2));

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/projects/${projectId}/risks-problems`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("❌ Resposta do backend:", errorBody);
        throw new Error(`Erro ao criar: ${response.statusText} - ${errorBody}`);
      }

      const result = await response.json();
      console.log("✅ Item criado com sucesso:", result);
      return result;
    } catch (error) {
      console.error("Erro em riskProblemService.create:", error);
      throw error;
    }
  },

  /**
   * Atualizar item existente
   * PUT /api/projects/{projectId}/risks-problems/{itemId}
   */
  async update(
    projectId: string,
    itemId: string,
    data: Partial<RiskProblemItem>
    ): Promise<RiskProblemItem> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro em riskProblemService.update:", error);
      throw error;
    }
  },

  /**
   * Deletar item
   * DELETE /api/projects/{projectId}/risks-problems/{itemId}
   */
  async remove(projectId: string, itemId: string): Promise<void> {
    const url = `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}`;

    console.log("DELETE URL:", url);
    console.log("DELETE params:", { projectId, itemId });

    try {
      const response = await fetch(url, {
        method: "DELETE",
        // headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("❌ Resposta do backend no delete:", errorBody);
        throw new Error(`Erro ao deletar: ${response.statusText} - ${errorBody}`);
      }
    } catch (error) {
      console.error("Erro em riskProblemService.delete:", error);
      throw error;
    }
},

  /**
   * Converter risco em problema
   * POST /api/projects/{projectId}/risks-problems/{itemId}/convert-to-problem
   */
  async convertToProblem(
    projectId: string,
    itemId: string,
    data: { urgencia: number; impacto_atual: number }
  ): Promise<RiskProblemItem> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/${projectId}/risks-problems/${itemId}/convert-to-problem`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        });

      if (!response.ok) {
        throw new Error(`Erro ao converter: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro em riskProblemService.convertToProblem:", error);
      throw error;
    }
  },
};

//api.ts - Arquivo completo para o projeto SR-Risks

