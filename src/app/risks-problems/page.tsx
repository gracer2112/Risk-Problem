// src/app/risks-problems/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRiskProblems } from "@/hooks/useRiskProblems";
import { RiskProblemTable } from "@/components/RiskProblemTable";
import { RiskProblemItem,RiskProblemCreateRequest} from "@/types/risk-problem";
import RiskProblemDrawer from "@/components/RiskProblemDrawer"; 

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
  const { items, loading, error, loadItems, createItem, updateItem, deleteItem } =
    useRiskProblems(PROJECT_ID);
  const [selectedItem, setSelectedItem] = useState<RiskProblemItem | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Estado para filtro (no topo do componente, como regra de hooks)
  const [filterMode, setFilterMode] = useState<"all" | "risco" | "problema" | "crítico" | "atrasado" | "média">("all");

  // ===== EFEITO: Carregar itens ao montar =====
  useEffect(() => {
    loadItems();
  }, []);

    // ===== FILTRO: Itens filtrados baseado no estado =====
  const filteredItems = items.filter((item) => {
    if (filterMode === "all") return true;
    if (filterMode === "risco") return item.natureza_atual === "risco"; // Assumindo string do enum
    if (filterMode === "problema") return item.natureza_atual === "problema";
    if (filterMode === "crítico") return item.severidade === "critica";
    if (filterMode === "atrasado") {
      if (!item.data_alvo_solucao) return false; // Se não tem prazo, não é atrasado
        const prazoDate = new Date(item.data_alvo_solucao); // Converte string para Date
        const hoje = new Date(); // Data atual
      return prazoDate < hoje; // Compara Dates corretamente (erro 2365 resolvido)
    }  // Exemplo: itens atrasados têm data de solução no passado
    if (filterMode === "média") {
      if (!item.prioridade) return false; 
        const prioridade = item.prioridade;
      return prioridade >= 30 && prioridade < 60; // Exemplo: itens de prioridade média
    }
    return true;
  });

  const handleSave = async (data: Partial<RiskProblemItem>) => {
    try {
      console.log("handleSave chamado com:", data);

      if (selectedItem?.id) {
        await updateItem(selectedItem.id, data);
      } else {
        const created = await createItem(data as RiskProblemCreateRequest);
        console.log("Criado no handleSave:", created);
      }

      handleCloseDrawer();

    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // ===== HANDLERS =====
  const handleEdit = (item: RiskProblemItem) => {
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
      console.log("Item deletado com sucesso");
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
    console.log("Filtro ativado para prioridade"); // Debug
  };

  const handleFilterAtrasados = () => {
    setFilterMode("atrasado");
    console.log("Filtro ativado para atrasados"); // Debug
  };

  const handleFilterCritical = () => {
    setFilterMode("crítico"); // Atualiza o estado - simples e correto
    console.log("Filtro ativado para críticos"); // Debug
  };
  const handleFilterRisks = () => {
    setFilterMode("risco"); // Atualiza o estado - simples e correto
    console.log("Filtro ativado para riscos"); // Debug
  };

  const handleFilterProblems = () => {
    setFilterMode("problema");
    console.log("Filtro ativado para problemas");
  };

  const handleClearFilter = () => {
    setFilterMode("all");
    console.log("Filtro limpo - todos os itens");
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
                Filtrar Prioridade Média
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
                Mostrando apenas {filterMode === "risco" ? "riscos" : filterMode === "problema" ? "problemas" : filterMode === "crítico" ? "críticos" : filterMode ==="atrasado" ? "atrasados" : "média"} ({filteredItems.length} itens)
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
                {items.length}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-medium">Riscos</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {items.filter((i) => i.natureza_atual === "risco").length}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-medium">Problemas</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {items.filter((i) => i.natureza_atual === "problema").length}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm font-medium">Críticos</p>
              <p className="text-3xl font-bold text-red-700 mt-2">
                {items.filter((i) => i.severidade === "critica").length}
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
        />
      )}
    </div>
  );
}
