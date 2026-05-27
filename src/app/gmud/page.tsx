// src/app/gmud/page.tsx

'use client'

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useGMUD } from '@/hooks/useGMUD';
import GMUDHeader from '@/components/gmud/GMUDHeader';
import GMUDKpis from '@/components/gmud/GMUDKpis';
import GMUDFilters from '@/components/gmud/GMUDFilters';
import type { GMUDTableItem as GMUDTableItemType } from '@/components/gmud/GMUDTable';
import GMUDTable from '@/components/gmud/GMUDTable';
import GMUDDrawer from '@/components/gmud/GMUDDrawer';
import { GMUDListFilters } from '@/services/api.gmud';
import { 
  StatusGMUD, 
  PrioridadeGMUD, 
  ImpactoGMUD, 
  AmbienteGMUD, 
  TipoExecucaoGMUD, 
  OrigemGMUD,
  HistoricoItemGMUD,
  ChecklistItemGMUD, 
  PayloadChecklistItemGMUD, 
  CriarGMUDRequestDTO, 
  AtualizarGMUDRequestDTO, 
  GMUDResponseDTO 
} from '@/types/gmud';
import { ProjectCatalogItem } from '@/types/project-catalog';
import { riskProblemService } from '@/services/api';
import { stringify } from 'querystring';

type DrawerMode = 'create' | 'view' | 'edit';

type FormFields = {
  openproject_project_id: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  impacto: string;
  ambiente: string;
  tipo_execucao: string;
  origem: string;
  data_agendada: string;
  janela_execucao_inicio: string;
  janela_execucao_fim: string;
  solicitante: string;
  responsavel_execucao: string;
  plano_rollback: string;
  itens_checklist: string[];
};

type GMUDEntity = {
  id: string;
  // outros campos
};

type Filters = Record<string, unknown>;

type DrawerSubmitPartial = {
  title: string;
  description?: string;
  status: StatusGMUD;
  priority: PrioridadeGMUD;
  type: TipoExecucaoGMUD;
  openproject_project_id: string | null;
};

type DrawerOnSubmitArg = {
  title: string;
  description?: string;
  status: StatusGMUD;
  priority: PrioridadeGMUD;
  type: TipoExecucaoGMUD;
  openproject_project_id: string | null;
};

interface DrawerFormState {
  titulo: string;
  descricao: string;
  openproject_project_id: string | null;
  status: StatusGMUD;
  prioridade: PrioridadeGMUD;
  impacto: ImpactoGMUD;
  ambiente: AmbienteGMUD;
  tipo_execucao: TipoExecucaoGMUD;
  origem: OrigemGMUD;
  data_agendada: string | null;
  janela_execucao_inicio: string | null;
  janela_execucao_fim: string | null;
  solicitante: string;
  responsavel_execucao: string;
  plano_rollback: string;
  itens_checklist: ChecklistItemGMUD[];
  historico: HistoricoItemGMUD[];
  error?: string;
}

function normalizeDT(value?: string | null) {
  if (!value) return null;
  return value.substring(0, 16); // yyyy-MM-ddTHH:mm
}

export default function GMUDPage() {
  const itemBeingEditedRef = useRef<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [projectsCatalog, setProjectsCatalog] = useState<ProjectCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [filters, setFilters] = useState<GMUDListFilters>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create');
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GMUDResponseDTO | null>(null);
  const [drawerForm, setDrawerForm] = useState<DrawerFormState>({
      titulo: '',
      descricao: '',
      status: StatusGMUD.RASCUNHO,
      prioridade: PrioridadeGMUD.BAIXA,
      impacto: ImpactoGMUD.ALTO,
      ambiente: AmbienteGMUD.DESENVOLVIMENTO,
      tipo_execucao: TipoExecucaoGMUD.AUTOMATICA,
      origem: OrigemGMUD.CLIENTE,
      data_agendada: '',
      janela_execucao_inicio: '',
      janela_execucao_fim: '',
      solicitante: '',
      responsavel_execucao: '',
      plano_rollback: '',
      openproject_project_id: null,
      itens_checklist: [],
      historico: [],
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultFormState: DrawerFormState = {
    titulo: '',
    descricao: '',
    openproject_project_id: null,
    status: StatusGMUD.RASCUNHO,
    prioridade: PrioridadeGMUD.BAIXA,
    impacto: ImpactoGMUD.ALTO,
    ambiente: AmbienteGMUD.DESENVOLVIMENTO,
    tipo_execucao: TipoExecucaoGMUD.AUTOMATICA,
    origem: OrigemGMUD.CLIENTE,
    data_agendada: null,
    janela_execucao_inicio: null,
    janela_execucao_fim: null,
    solicitante: '',
    responsavel_execucao: '',
    plano_rollback: '',
    itens_checklist: [],
    historico: [],
  };

  const [editingChecklistItemId, setEditingChecklistItemId] = useState<string | null>(null);
  const [formState, setFormState] = useState(defaultFormState);


  const {
    items,
    kpis,
    loading,
    error,
    loadItems,
    loadKPIs,
    createItem,
    updateItem,
    deleteItem,
    loadItemById,
    onChangePrioridade,
    onChangeImpacto,
    onChangeAmbiente,
    onChangeTipoExecucao,
    onChangeOrigem,
    onChangeStatus,
    onAddChecklistItem,
    onUpdateChecklistItem,
    onDeleteChecklistItem,  
  } =  useGMUD(activeProjectId || null);

  console.debug("[PAGE][useGMUD] Handlers carregados:", {
    onAddChecklistItem: !!onAddChecklistItem,
    onUpdateChecklistItem: !!onUpdateChecklistItem,
    onDeleteChecklistItem: !!onDeleteChecklistItem,
  });

  const updateFormField = useCallback(<K extends keyof DrawerFormState>(
    field: K,
    value: DrawerFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const mapChecklistToPayload = (itens: ChecklistItemGMUD[]): PayloadChecklistItemGMUD[] => {
    return itens.map((item) => ({
      descricao: item.descricao,
      status: item.status,
      observacao: item.observacao,
    }));
  };

  const handleClearFilters = useCallback(() => {
    const clearedFilters: GMUDListFilters = {};
      setFilters(clearedFilters);
      loadItems(clearedFilters);
  }, [loadItems]);

  const handleApplyFilters = useCallback(
    (newFilters: GMUDListFilters) => {
      setFilters(newFilters);
      loadItems(newFilters);
    },
    [loadItems]
  );

  const buildCreatePayload = (formState: DrawerFormState, activeProjectId: string | null | undefined): CriarGMUDRequestDTO  => {
    if (activeProjectId == null) {
      throw new Error('ID do projeto ativo é obrigatório para criar item');
    }
    return {
      openproject_project_id: formState.openproject_project_id || null,
      titulo: formState.titulo.trim(),
      descricao: formState.descricao.trim(),
      status: formState.status,
      prioridade: formState.prioridade,
      impacto: formState.impacto,
      ambiente: formState.ambiente,
      tipo_execucao: formState.tipo_execucao,
      origem: formState.origem,
      data_agendada: normalizeDT(formState.data_agendada) || null,
      janela_execucao_inicio: normalizeDT(formState.janela_execucao_inicio) || null,
      janela_execucao_fim: normalizeDT(formState.janela_execucao_fim) || null,
      solicitante: formState.solicitante || null,
      responsavel_execucao: formState.responsavel_execucao || null,
      plano_rollback: formState.plano_rollback || null,
      //itens_checklist: mapChecklistToPayload(formState.itens_checklist),
    };
  };

  const buildUpdatePayload = (formState: DrawerFormState, activeProjectId: string | null | undefined): AtualizarGMUDRequestDTO => {
  if (activeProjectId == null) {
    throw new Error('ID do projeto ativo é obrigatório para atualizar item');
  }
    return {
      //project_id: activeProjectId,
      openproject_project_id: null,
      titulo: formState.titulo ?? '',
      descricao: formState.descricao ?? '',

      status: formState.status,
      prioridade: formState.prioridade,
      impacto: formState.impacto,
      ambiente: formState.ambiente,
      tipo_execucao: formState.tipo_execucao,
      origem: formState.origem,

      data_agendada: normalizeDT(formState.data_agendada) || null,
      janela_execucao_inicio: normalizeDT(formState.janela_execucao_inicio) || null,
      janela_execucao_fim: normalizeDT(formState.janela_execucao_fim) || null,

      solicitante: formState.solicitante || null,
      responsavel_execucao: formState.responsavel_execucao || null,
      plano_rollback: formState.plano_rollback || null,

      itens_checklist: mapChecklistToPayload(formState.itens_checklist),

    };
  };

  const handleChecklistUpdated = async () => {
    if (!drawerGMUD?.id) return;
    const updated = await loadItemById(drawerGMUD.id);
    setSelectedItem(updated);
    if (itemBeingEditedRef.current) {
      setEditingChecklistItemId(itemBeingEditedRef.current);
    }
  };

  const populateForm = useCallback((item: GMUDResponseDTO) => {
    setFormState({
      titulo: item.titulo ?? '',
      descricao: item.descricao ?? '',
      openproject_project_id: item.openproject_project_id ?? null,
      status: item.status ?? StatusGMUD.RASCUNHO,
      prioridade: item.prioridade ?? PrioridadeGMUD.BAIXA,
      impacto: item.impacto ?? ImpactoGMUD.ALTO,
      ambiente: item.ambiente ?? AmbienteGMUD.DESENVOLVIMENTO,
      tipo_execucao: item.tipo_execucao ?? TipoExecucaoGMUD.AUTOMATICA,
      origem: item.origem ?? OrigemGMUD.CLIENTE,
      data_agendada: item.data_agendada ?? null,
      janela_execucao_inicio: item.janela_execucao_inicio
        ? item.janela_execucao_inicio.substring(0, 16)
        : "",
      janela_execucao_fim: item.janela_execucao_fim
        ? item.janela_execucao_fim.substring(0, 16)
        : "",
      solicitante: item.solicitante ?? '',
      responsavel_execucao: item.responsavel_execucao ?? '',
      plano_rollback: item.plano_rollback ?? '',
      itens_checklist: item.itens_checklist ?? [],
      historico: item.historico ?? [],
    });
  }, []);

/*    const handleDrawerSubmit = useCallback((partial?: DrawerOnSubmitArg) => {
    const payload = {
      project_id: activeProjectId!,
      titulo: partial?.title ?? formState.titulo,
      descricao: partial?.description ?? formState.descricao ?? '',
      openproject_project_id: partial?.openproject_project_id ?? formState.openproject_project_id,
      status: partial?.status ?? formState.status,
      prioridade: partial?.priority ?? formState.prioridade,
      tipo_execucao: partial?.type ?? formState.tipo_execucao,
      impacto: formState.impacto,
      ambiente: formState.ambiente,
      origem: formState.origem,
      data_agendada: formState.data_agendada,
      janela_execucao_inicio: formState.janela_execucao_inicio,
      janela_execucao_fim: formState.janela_execucao_fim,
      solicitante: formState.solicitante,
      responsavel_execucao: formState.responsavel_execucao,
      plano_rollback: formState.plano_rollback,
      itens_checklist: mapChecklistToPayload(formState.itens_checklist),
      historico: formState.historico,
    };  

    if (!editingId) {
      createItem(payload as CriarGMUDRequestDTO);
    } else {
      updateItem(editingId, payload as AtualizarGMUDRequestDTO);
    }
    setDrawerOpen(false);
    setEditingId(null);
  }, [formState, editingId, createItem, updateItem, mapChecklistToPayload]); */

  const handleDrawerDelete = useCallback(() => {
    if (editingId) {
      deleteItem(editingId);
      setDrawerOpen(false);
      setEditingId(null);
    }
  }, [editingId, deleteItem]);

  const handleTableDelete = useCallback((id: string | number) => {
    if (confirm('Tem certeza que deseja excluir este GMUD?')) {
      deleteItem(String(id));
    }
  }, [deleteItem]);

  const mapEntityToDrawerForm = (entity: GMUDResponseDTO): DrawerFormState => ({
    titulo: entity.titulo ?? '',
    descricao: entity.descricao ?? '',
    openproject_project_id: entity.openproject_project_id ?? null,
    status: entity.status ?? StatusGMUD.RASCUNHO,
    prioridade: entity.prioridade ?? PrioridadeGMUD.BAIXA,
    impacto: entity.impacto ?? ImpactoGMUD.ALTO,
    ambiente: entity.ambiente ?? AmbienteGMUD.DESENVOLVIMENTO,
    tipo_execucao: entity.tipo_execucao ?? TipoExecucaoGMUD.AUTOMATICA,
    origem: entity.origem ?? OrigemGMUD.CLIENTE,
    data_agendada: entity.data_agendada ?? '',
    janela_execucao_inicio: entity.janela_execucao_inicio
      ? entity.janela_execucao_inicio.substring(0, 16)
      : '',

    janela_execucao_fim: entity.janela_execucao_fim
      ? entity.janela_execucao_fim.substring(0, 16)
      : '',
    solicitante: entity.solicitante ?? '',
    responsavel_execucao: entity.responsavel_execucao ?? '',
    plano_rollback: entity.plano_rollback ?? '',
    itens_checklist: entity.itens_checklist ?? [],
    historico: entity.historico ?? [],
  });

  const handleEdit = async (id: string | number) => {
    setDrawerLoading(true);
    try {
      const item = await loadItemById(String(id));

      setSelectedItem(item);
      setEditingId(String(id));   // <-- SEM usar item.id
      console.log("[DEBUG] Link acionado: modo edit", String(id));
      setDrawerForm(mapEntityToDrawerForm(item));
      console.log("[DEBUG] Abrindo drawer com form carregado:", mapEntityToDrawerForm(item));
      setDrawerMode("edit");
      setDrawerOpen(true);

    } catch (error) {
      setDrawerError("Erro ao carregar GMUD para edição.");
    } finally {
      setDrawerLoading(false);
    }
  };

  type DrawerGMUD = Parameters<typeof GMUDDrawer>[0]['gmud'];

  const drawerGMUD: DrawerGMUD | null = selectedItem ? (selectedItem as unknown as DrawerGMUD) : null;

  const handleCloseDrawer = useCallback(() => {
    console.log("[DEBUG] handleCloseDrawer executado");
    setDrawerOpen(false);
    setDrawerForm(createEmptyDrawerForm(activeProjectId ?? ''));
    setDrawerMode('create');
    setSelectedItem(null);
  }, [activeProjectId]);

  const handleSubmit = useCallback(async () => {
    console.log("[DEBUG] handleSubmit chamado no modo:", drawerMode);
    console.log("[DEBUG] drawerForm no submit:", drawerForm);
    try {
      if (drawerMode === 'create') {
        const payload = buildCreatePayload(drawerForm, activeProjectId);
        await createItem(payload); // assuma API existente
      } else if (drawerMode === 'edit') {
        if (drawerForm.janela_execucao_inicio?.includes(".")) {
            drawerForm.janela_execucao_inicio =
            drawerForm.janela_execucao_inicio.substring(0, 16);
        }
        const payload = buildUpdatePayload(drawerForm, activeProjectId);
        console.log("[DEBUG] Enviando updateItem:", selectedItem!.id, payload);
        const result = await updateItem(editingId!, payload);
        console.log("[DEBUG] Resposta updateItem:", result);
      }
      loadItems(filters);
      loadKPIs();
      console.log("[DEBUG] Chamando handleCloseDrawer()");
      handleCloseDrawer();
    } catch (err) {
        setDrawerError((err as Error)?.message ?? 'Erro ao salvar');
      } finally {
        setSaving(false);
      }
    },
    [
      drawerForm,
      drawerMode,
      selectedItem,
      createItem,
      updateItem,
      handleCloseDrawer,
      loadItems,
      loadKPIs,
      filters,
      buildCreatePayload,
      buildUpdatePayload,
    ]
  );

  const handleDeleteCurrent = useCallback(async () => {
      if (!selectedItem) return;
    try {
      await deleteItem(selectedItem.id); // assuma API existente
      loadItems(filters);
      loadKPIs();
      setSelectedItem(null);
      handleCloseDrawer();
    }  catch (err) {
      setDrawerError((err as Error)?.message ?? 'Erro ao excluir item');
    } finally {
      setDeleting(false);
    }
  }, [selectedItem, filters, loadItems, loadKPIs, handleCloseDrawer]);

  const handleTitleChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, titulo: value }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, descricao: value }));
  }, []);

  const handleStatusChange = useCallback((value: StatusGMUD) => {
    setDrawerForm((prev) => ({ ...prev, status: value }));
  }, []);

  const handlePrioridadeChange = useCallback((value: PrioridadeGMUD) => {
    setDrawerForm((prev) => ({ ...prev, prioridade: value }));
  }, []);

  const handleImpactoChange = useCallback((value: ImpactoGMUD) => {
    setDrawerForm((prev) => ({ ...prev, impacto: value }));
  }, []);

  const handleAmbienteChange = useCallback((value: AmbienteGMUD) => {
    setDrawerForm((prev) => ({ ...prev, ambiente: value }));
  }, []);

  const handleTipoExecucaoChange = useCallback((value: TipoExecucaoGMUD) => {
    setDrawerForm((prev) => ({ ...prev, tipoExecucao: value }));
  }, []);

  const handleOrigemChange = useCallback((value: OrigemGMUD) => {
    setDrawerForm((prev) => ({ ...prev, origem: value }));
  }, []);

/*   const handleDataAgendadaChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, dataAgendada: value }));
  }, []);

  const handleJanelaExecucaoInicioChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, janelaExecucaoInicio: value }));
  }, []);

  const handleJanelaExecucaoFimChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, janelaExecucaoFim: value }));
  }, []); */

  const handleSolicitanteChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, solicitante: value }));
  }, []);

/*   const handleResponsavelExecucaoChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, responsavelExecucao: value }));
  }, []);

  const handlePlanoRollbackChange = useCallback((value: string) => {
    setDrawerForm((prev) => ({ ...prev, planoRollback: value }));
  }, []); */

  const handleDelete = async (id: string | number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return;
    }
    const itemId = String(id);
    setDrawerLoading(true);
    try {
      await deleteItem(itemId);
      await loadItems(filters);
      await loadKPIs();
      if (drawerOpen && selectedItem?.id === itemId) {
        setDrawerOpen(false);
        setSelectedItem(null as any);
        setDrawerForm({} as any);
      }
    } catch (error: unknown) {
      setDrawerError('Erro ao excluir o item');
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleView = async (id: string | number) => {
    const itemId = String(id);
    setDrawerLoading(true);
    setDrawerError(null);
    try {
      const item = await loadItemById(itemId);
      setSelectedItem(item);
      setDrawerForm(mapEntityToDrawerForm(item));
      setDrawerMode('view');
      setDrawerOpen(true);
    } catch (err) {
      console.error('Erro ao carregar item:', err);
      setDrawerError((err as Error)?.message ?? 'Erro ao carregar o item');
    } finally {
      setDrawerLoading(false);
    }
  };

  const createEmptyDrawerForm = (projectId: string): DrawerFormState => ({
    titulo: '',
    descricao: '',
    openproject_project_id: projectId,

    status: StatusGMUD.RASCUNHO,
    prioridade: PrioridadeGMUD.BAIXA,
    impacto: ImpactoGMUD.BAIXO,
    ambiente: AmbienteGMUD.DESENVOLVIMENTO,
    tipo_execucao: TipoExecucaoGMUD.MANUAL,
    origem: OrigemGMUD.INTERNA,

    data_agendada: '',
    janela_execucao_inicio: '',
    janela_execucao_fim: '',
    solicitante: '',
    responsavel_execucao: '',
    plano_rollback: '',
    itens_checklist: [],
    historico: [],
  });

  const handleCreate = useCallback(() => {
    if (!selectedProjectId) return;
    setDrawerMode("create");
    setSelectedItem(null);
    setEditingId(null);
    setDrawerForm(createEmptyDrawerForm(selectedProjectId));
    setDrawerOpen(true);
  }, [selectedProjectId]);

  const tableItems = useMemo<GMUDTableItemType[]>(() =>
    items.map((item) => ({
      id: item.id,
      titulo: item.titulo,
      status: item.status,
      prioridade: item.prioridade,
      impacto: item.impacto,
      ambiente: item.ambiente,
    })),
    [items]
  );

  const drawerGMUDValue = drawerGMUD ?? undefined;

  const emptyMessage = useMemo(() => {
    const hasFilters = Object.values(filters).some((v) => !!v);
    return hasFilters
      ? 'Nenhum GMUD encontrado com os filtros selecionados.'
      : 'Nenhum GMUD cadastrado neste projeto.';
  }, [filters]);

  useEffect(() => {
    if (activeProjectId) {
    loadItems(filters)
    }
    loadKPIs();
  }, [String(activeProjectId), filters, loadItems, loadKPIs]);

  useEffect(() => {
    let isMounted = true;
    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const catalog = await riskProblemService.listProjectsCatalog();
        if (!isMounted) {
          return;
        }
        if (catalog.length > 0) {
          setProjectsCatalog(catalog);
          setCatalogError(null);
        } else {
          setProjectsCatalog([]);
          setCatalogError(null);
        }
      } catch {
        if (isMounted) {
          setProjectsCatalog([]);
          setCatalogError("Não foi possível carregar o catálogo de projetos.");
        }
      } finally {
        if (isMounted) {
          setCatalogLoading(false);
        }
      }
    };
    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);



  useEffect(() => {
    setActiveProjectId(selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    setFilters({});
    setEditingId(null);
    setSelectedItem(null);
    // setDrawerMode("create");
  }, [activeProjectId]);

  // 🔗 Sincroniza seleção global (select) com o projeto ativo do GMUD
  useEffect(() => {
    console.log({
      selectedProjectId,
      activeProjectId,
      projectsCatalog
    });
  }, [selectedProjectId, activeProjectId, projectsCatalog]);

  const hasGMUD = (items?.length ?? 0) > 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {selectedProjectId && hasGMUD && error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <GMUDHeader
          title="GMUD"
          description="Gerenciamento de Mudanças do Projeto"
          projectName={activeProjectId ? `Projeto ${activeProjectId}` : undefined}
          openProjectProjectId={activeProjectId || undefined}
          hasSelectedProject={!!activeProjectId}
          loading={loading}
          createButtonLabel="Nova Mudança"
          onCreate={handleCreate}
        />

        <div className="mt-4 max-w-md">
          <label
            htmlFor="project-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Projeto
          </label>
          <select
            value={selectedProjectId ?? ""}
            id="project-select"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            disabled={catalogLoading}
            aria-busy={catalogLoading}
            onChange={(event) => setSelectedProjectId(event.target.value || null)}
          >
            <option value="">
              Selecione um projeto
            </option>
            {projectsCatalog.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {catalogLoading ? (
            <p className="mt-2 text-sm text-blue-600">Carregando projetos...</p>
          ) : catalogError ? (
            <p className="mt-2 text-sm text-amber-700">{catalogError}</p>
          ) : projectsCatalog.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Nenhum projeto disponível para seleção.</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Selecione um projeto para carregar a lista e habilitar as ações.</p>
          )}
        </div>
       
        {selectedProjectId && hasGMUD && (
        <GMUDKpis
          total={kpis?.total ?? 0}
          emRevisao={kpis?.em_revisao ?? 0}
          agendadas={kpis?.agendadas ?? 0}
          emExecucao={kpis?.em_execucao ?? 0}
          concluidas={kpis?.concluidas ?? 0}
          rollbacks={kpis?.rollbacks ?? 0}
          loading={loadKPIs === undefined || loading}
        />
        )}
        <GMUDFilters
          loading={loading}
          disabled={!activeProjectId || loading}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
        <GMUDTable
          data={tableItems}
          loading={loading}
          emptyMessage={selectedProjectId ? emptyMessage : ""}
          onView={(id) => void handleView(id)}
          onEdit={(id) => void handleEdit(id)}
          onDelete={(id) => void handleDelete(id)}
        />
      </div>
      {drawerOpen && (
            console.debug("[PAGE][DRAWER] Montando Drawer com props:", {
              gmud: drawerGMUD,
              mode: drawerMode,
              prioridade: drawerForm.prioridade,
              impacto: drawerForm.impacto,
              ambiente: drawerForm.ambiente,
              tipo_execucao: drawerForm.tipo_execucao,
              origem: drawerForm.origem,
              status: drawerForm.status,
              temOnAddChecklistItem: !!onAddChecklistItem,
              temOnUpdateChecklistItem: !!onUpdateChecklistItem,
              temOnDeleteChecklistItem: !!onDeleteChecklistItem,
            }),
        <div className="fixed inset-0 z-40 flex">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseDrawer}
          />

          {/* Drawer */}
          <div className="relative z-50 ml-auto h-full w-[420px] bg-white shadow-xl">
            <GMUDDrawer
              open={drawerOpen}
              openproject_project_id={selectedProjectId}
              gmud={drawerGMUD ?? undefined}
              mode={drawerMode}
              isLoading={drawerLoading}
              onClose={handleCloseDrawer}
              onSubmit={handleSubmit}
              onDelete={handleDeleteCurrent}
              titulo={drawerForm.titulo}
              descricao={drawerForm.descricao}
              solicitante={drawerForm.solicitante}
              responsavel_execucao={drawerForm.responsavel_execucao}
              data_agendada={drawerForm.data_agendada ?? ""}
              janela_execucao_inicio={drawerForm.janela_execucao_inicio ?? ""}
              janela_execucao_fim={drawerForm.janela_execucao_fim ?? ""}
              plano_rollback={drawerForm.plano_rollback}

              onChangeTitulo={(v) =>
                setDrawerForm((prev) => ({ ...prev, titulo: v }))
              }
              onChangeDescricao={(v) =>
                setDrawerForm((prev) => ({ ...prev, descricao: v }))
              }
              onChangeSolicitante={(v) =>{
                console.log("[DEBUG] solicitante mudou para:", v);
                setDrawerForm(prev => ({ ...prev, solicitante: v }))
              }}

              onChangeResponsavelExecucao={(v) =>{
                console.log("[DEBUG] responsavel_execucao mudou para:", v);
                setDrawerForm(prev => ({ ...prev, responsavel_execucao: v }))
              }}

              onChangeDataAgendada={(v) => {
                console.log("[DEBUG] data_agendada mudou para:", v);
                setDrawerForm(prev => ({ ...prev, data_agendada: v }))
              }}

              onChangeJanelaExecucaoInicio={(v) => {
                console.log("[DEBUG] janela_execucao_inicio mudou para:", v);
                setDrawerForm(prev => ({ ...prev, janela_execucao_inicio: v }))
              }}

              onChangeJanelaExecucaoFim={(v) => {
                console.log("[DEBUG] janela_execucao_fim mudou para:", v);
                setDrawerForm(prev => ({ ...prev, janela_execucao_fim: v }))
              }}

              onChangePlanoRollback={(v) => {
                console.log("[DEBUG] plano_rollback mudou para:", v);
                setDrawerForm(prev => ({ ...prev, plano_rollback: v }))
              }}
              onChangePrioridade={onChangePrioridade}
              onChangeImpacto={onChangeImpacto}
              onChangeAmbiente={onChangeAmbiente}
              onChangeTipoExecucao={onChangeTipoExecucao}
              onChangeOrigem={onChangeOrigem}
              onChangeStatus={onChangeStatus}

              onAddChecklistItem={onAddChecklistItem}
              onUpdateChecklistItem={onUpdateChecklistItem}
              onDeleteChecklistItem={onDeleteChecklistItem}
              onChecklistUpdated={handleChecklistUpdated}
              onChecklistEditStart={setEditingChecklistItemId}
              editingChecklistItemId={editingChecklistItemId}
            />
          </div>

        </div>
      )}
    </>
  );
}
