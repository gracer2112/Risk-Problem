// src/app/risks-problems/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRiskProblems } from "@/hooks/useRiskProblems";
import { RiskProblemTable } from "@/components/RiskProblemTable";
import RiskProblemDrawer from "@/components/RiskProblemDrawer";
import { isClosedItem } from "@/utils/risk-problem-domain";
import { getCompositeScoreSemantic, getDeadlineSemantic } from "@/utils/risk-problem-semantics";
import {
  NaturezaAtualEnum,
  type CloseRiskProblemRequest,
  type ConvertRiskToProblemRequest,
  type RiskProblemEntity,
  type RiskProblemFormData,
  type RiskProblemListItem,
} from "@/types/risk-problem";

type FilterMode = "all" | "risco" | "problema" | "crítico" | "atrasado" | "média";

const FILTER_MODE_LABELS: Record<Exclude<FilterMode, "all">, string> = {
  risco: "riscos",
  problema: "problemas",
  crítico: "críticos",
  atrasado: "atrasados",
  média: "criticidade média",
};

/**
 * PÁGINA: Riscos e Problemas
 * 
 * Esta é a página principal que o usuário vê
 * Integra: Hook (estado) + Componente (UI)
 * 
 * URL: http://localhost:3000/risks-problems
 */

export default function RisksProblemsPage() {
  // ===== CONFIGURAÇÃO =====
  // TODO: Pegar projectId de params ou contexto
  // Por enquanto, vamos usar um ID fixo para testes
  const PROJECT_ID = "1";

  // ===== ESTADO =====
  const {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    convertToProblem,
    closeItem,
    deleteItem,
    historyByItemId,
    historyLoadingItemId,
    historyError,
    loadHistory,
  } = useRiskProblems(PROJECT_ID);

  function getNumericClassification(item: RiskProblemListItem): number | null {
    if (typeof item.classificacao_atual === "number") {
      return item.classificacao_atual;
    }

    if (typeof item.classificacao_atual === "string") {
      const parsed = Number(item.classificacao_atual);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  }

  function isCriticalItem(item: RiskProblemListItem): boolean {
    const semantic = getCompositeScoreSemantic(item.classificacao_atual);
    return !semantic.isEmpty && semantic.label === "Crítica";
  }

  function isMediumItem(item: RiskProblemListItem): boolean {
    const semantic = getCompositeScoreSemantic(item.classificacao_atual);
    return !semantic.isEmpty && semantic.label === "Média";
  }

  function isOverdueItem(item: RiskProblemListItem): boolean {
    return getDeadlineSemantic(item.data_alvo_solucao, isClosedItem(item)).isLate;
  }

  const [selectedItem, setSelectedItem] = useState<RiskProblemEntity | null>(
    null
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estado para filtro (no topo do componente, como regra de hooks)
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  // ===== EFEITO: Carregar itens ao montar =====
  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // ===== FILTRO: Itens filtrados baseado no estado =====
  const filteredItems = useMemo(() => items.filter((item) => {
    if (filterMode === "all") return true;
    if (filterMode === "risco") return item.natureza_atual === NaturezaAtualEnum.RISCO;
    if (filterMode === "problema") return item.natureza_atual === NaturezaAtualEnum.PROBLEMA;
    if (filterMode === "crítico") return isCriticalItem(item);
    if (filterMode === "atrasado") return isOverdueItem(item);
    if (filterMode === "média") return isMediumItem(item);
    return true;
  }), [items, filterMode]);

  const summaryCounts = useMemo(() => ({
    total: items.length,
    riscos: items.filter((i) => i.natureza_atual === NaturezaAtualEnum.RISCO).length,
    problemas: items.filter((i) => i.natureza_atual === NaturezaAtualEnum.PROBLEMA).length,
    criticos: items.filter((i) => isCriticalItem(i)).length,
  }), [items]);

  const handleSave = async (
    form: RiskProblemFormData,
    original?: RiskProblemEntity
  ): Promise<void> => {
    try {
      const savedEntity = original?.id
        ? await updateItem(original.id, form, original)
        : await createItem(form);

      setSelectedItem(savedEntity);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      throw error;
    }
  };

  const handleConvertToProblem = async (
    item: RiskProblemEntity,
    payload: ConvertRiskToProblemRequest
  ): Promise<RiskProblemEntity> => {
    try {
      const convertedEntity = await convertToProblem(item.id, payload);
      setSelectedItem(convertedEntity);
      return convertedEntity;
    } catch (error) {
      console.error("Erro ao converter risco em problema:", error);
      throw error;
    }
  };

  const handleCloseRiskProblem = async (
    item: RiskProblemEntity,
    payload: CloseRiskProblemRequest
  ): Promise<RiskProblemEntity> => {
    try {
      const closedEntity = await closeItem(item, payload);
      setSelectedItem(closedEntity);
      return closedEntity;
    } catch (error) {
      console.error("Erro ao encerrar item:", error);
      throw error;
    }
  };

  // ===== HANDLERS =====
  const handleEdit = (item: RiskProblemListItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      // Toast de sucesso (vamos adicionar depois)
    } catch (err) {
      console.error("Erro ao deletar:", err);
      // Toast de erro (vamos adicionar depois)
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedItem(null);
  };

  // Handler para filtro (sem hooks internos!)
  const handleFilterMedio = () => {
    setFilterMode("média"); // Atualiza o estado - simples e correto
  };

  const handleFilterAtrasados = () => {
    setFilterMode("atrasado");
  };

  const handleFilterCritical = () => {
    setFilterMode("crítico"); // Atualiza o estado - simples e correto
  };
  const handleFilterRisks = () => {
    setFilterMode("risco"); // Atualiza o estado - simples e correto
  };

  const handleFilterProblems = () => {
    setFilterMode("problema");
  };

  const handleClearFilter = () => {
    setFilterMode("all");
  };


  // ===== RENDERIZAÇÃO =====
  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Riscos e Problemas
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie todos os riscos e problemas do seu projeto
              </p>
            </div>
            <div className="flex gap-2">
              {/* NOVO: Botões de filtro */}
              <button
                onClick={handleFilterMedio}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={filterMode === "média"}
              >
                Filtrar Criticidade Média
              </button>
              <button
                onClick={handleFilterAtrasados}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={filterMode === "atrasado"}
              >
                Filtrar Atrasados
              </button>
              <button
                onClick={handleFilterCritical}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={filterMode === "crítico"}
              >
                Filtrar Críticos
              </button>
              <button
                onClick={handleFilterRisks}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={filterMode === "risco"}
              >
                Filtrar Riscos
              </button>
              <button
                onClick={handleFilterProblems}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={filterMode === "problema"}
              >
                Filtrar Problemas
              </button>
              <button
                onClick={handleClearFilter}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={filterMode === "all"}
              >
                Todos
              </button>
              <button
                onClick={handleCreate}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md ml-2"
              >
                + Adicionar Novo
              </button>
            </div>
          </div>
          {/* Indicador de filtro */}
          {filterMode !== "all" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">
                Mostrando apenas {FILTER_MODE_LABELS[filterMode as Exclude<FilterMode, "all">]} ({filteredItems.length} itens)
                <button
                  onClick={handleClearFilter}
                  className="ml-4 text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Limpar filtro
                </button>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* MENSAGEM DE ERRO */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">Erro ao carregar dados</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => loadItems()}
              className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* TABELA */}
        <div className="bg-white rounded-lg shadow">
          <RiskProblemTable
            items={filteredItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>

        {/* RESUMO (Opcional) */}
        {!loading && items.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-medium">Total de Itens</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summaryCounts.total}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-medium">Riscos</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                  {summaryCounts.riscos}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-medium">Problemas</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                  {summaryCounts.problemas}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-medium">Críticos</p>
              <p className="text-3xl font-bold text-red-700 mt-2">
                  {summaryCounts.criticos}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* DRAWER (Vamos criar depois) */}
      { isDrawerOpen && (
        <RiskProblemDrawer
          isOpen={isDrawerOpen}
          item={selectedItem}
          onClose={handleCloseDrawer}
          onSave={handleSave}
          onConvertToProblem={handleConvertToProblem}
          onCloseRiskProblem={handleCloseRiskProblem}
          history={selectedItem ? historyByItemId[selectedItem.id] ?? null : null}
          historyLoading={
            selectedItem ? historyLoadingItemId === selectedItem.id : false
          }
          historyError={historyError}
          onLoadHistory={loadHistory}
        />
      )}
    </div>
  );
}
