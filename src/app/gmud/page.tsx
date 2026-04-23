// src/app/gmud/page.tsx

'use client';

import { useCallback, useMemo, useState } from 'react';
import GMUDHeader from '@/components/gmud/GMUDHeader';
import GMUDKpis from '@/components/gmud/GMUDKpis';
import GMUDFilters from '@/components/gmud/GMUDFilters';
import GMUDTable, { type GMUDTableItem } from '@/components/gmud/GMUDTable';
import GMUDDrawer from '@/components/gmud/GMUDDrawer';

type GMUDPageChecklistItem = {
  id: string;
  descricao: string;
  status?: string;
  observacao?: string | null;
};

type GMUDPageHistoryItem = {
  id: string;
  timestamp?: string | null;
  tipoEvento?: string | null;
  usuarioNome?: string | null;
  observacao?: string | null;
};

type GMUDPageItem = {
  id: string;
  titulo: string;
  description: string;
  status: 'rascunho' | 'em_revisao' | 'aprovado' | 'agendado' | 'em_execucao' | 'concluido' | 'rollback';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  impacto: 'baixo' | 'medio' | 'alto' | 'critico';
  ambiente: 'desenvolvimento' | 'homologacao' | 'producao';
  tipoExecucao: 'manual' | 'automatica';
  origem: 'interna' | 'cliente' | 'fornecedor';
  dataAgendada: string | null;
  janelaExecucaoInicio: string | null;
  janelaExecucaoFim: string | null;
  solicitante: string | null;
  responsavelExecucao: string | null;
  planoRollback: string | null;
  updatedAt: string | null;
  projectName: string;
  openProjectProjectId: string | null;
  checklistItems: GMUDPageChecklistItem[];
  historyItems: GMUDPageHistoryItem[];
};

const MOCK_ITEMS: GMUDPageItem[] = [
  {
    id: 'gmud-001',
    titulo: 'Deploy da versão 2.4.0',
    description: 'Publicação da versão 2.4.0 com ajustes de performance e correções menores.',
    status: 'agendado',
    prioridade: 'alta',
    impacto: 'alto',
    ambiente: 'producao',
    tipoExecucao: 'automatica',
    origem: 'interna',
    dataAgendada: '2026-04-28',
    janelaExecucaoInicio: '22:00',
    janelaExecucaoFim: '23:30',
    solicitante: 'Time de Produto',
    responsavelExecucao: 'Carlos Mendes',
    planoRollback: 'Rollback via pipeline para a tag v2.3.9.',
    updatedAt: '2026-04-23 10:20',
    projectName: 'Portal Corporativo',
    openProjectProjectId: 'OP-1042',
    checklistItems: [
      { id: 'chk-1', descricao: 'Backup validado', status: 'concluido', observacao: null },
      { id: 'chk-2', descricao: 'Smoke test planejado', status: 'pendente', observacao: 'Executar após deploy' },
    ],
    historyItems: [
      { id: 'hist-1', timestamp: '2026-04-22 15:00', tipoEvento: 'Criação', usuarioNome: 'Erica', observacao: 'GMUD criada para release semanal' },
      { id: 'hist-2', timestamp: '2026-04-23 09:30', tipoEvento: 'Agendamento', usuarioNome: 'Carlos Mendes', observacao: 'Janela confirmada para 22h' },
    ],
  },
  {
    id: 'gmud-002',
    titulo: 'Correção emergencial de autenticação',
    description: 'Ajuste no fluxo de autenticação após falha intermitente em produção.',
    status: 'em_revisao',
    prioridade: 'critica',
    impacto: 'critico',
    ambiente: 'producao',
    tipoExecucao: 'manual',
    origem: 'cliente',
    dataAgendada: null,
    janelaExecucaoInicio: null,
    janelaExecucaoFim: null,
    solicitante: 'Operação',
    responsavelExecucao: 'Marina Lopes',
    planoRollback: 'Reaplicar configuração anterior do provedor de autenticação.',
    updatedAt: '2026-04-23 11:05',
    projectName: 'Portal Corporativo',
    openProjectProjectId: 'OP-1042',
    checklistItems: [
      { id: 'chk-3', descricao: 'Análise de causa concluída', status: 'concluido', observacao: null },
      { id: 'chk-4', descricao: 'Parecer de segurança', status: 'em_revisao', observacao: 'Aguardando validação final' },
    ],
    historyItems: [
      { id: 'hist-3', timestamp: '2026-04-23 08:10', tipoEvento: 'Criação', usuarioNome: 'Erica', observacao: 'Aberta por incidente reportado' },
    ],
  },
  {
    id: 'gmud-003',
    titulo: 'Migração de configuração do cache',
    description: 'Troca de parâmetros do cache distribuído para reduzir latência.',
    status: 'em_execucao',
    prioridade: 'media',
    impacto: 'medio',
    ambiente: 'homologacao',
    tipoExecucao: 'manual',
    origem: 'fornecedor',
    dataAgendada: '2026-04-23',
    janelaExecucaoInicio: '14:00',
    janelaExecucaoFim: '15:00',
    solicitante: 'Infraestrutura',
    responsavelExecucao: 'Bruno Reis',
    planoRollback: 'Restaurar parâmetros anteriores do cluster.',
    updatedAt: '2026-04-23 14:12',
    projectName: 'Plataforma de Atendimento',
    openProjectProjectId: 'OP-2088',
    checklistItems: [
      { id: 'chk-5', descricao: 'Alteração iniciada', status: 'em_execucao', observacao: 'Monitorando métricas' },
    ],
    historyItems: [
      { id: 'hist-4', timestamp: '2026-04-23 14:00', tipoEvento: 'Execução iniciada', usuarioNome: 'Bruno Reis', observacao: 'Janela iniciada conforme planejado' },
    ],
  },
  {
    id: 'gmud-004',
    titulo: 'Rollback de configuração de fila',
    description: 'Retorno para configuração anterior após aumento de erros de processamento.',
    status: 'rollback',
    prioridade: 'alta',
    impacto: 'alto',
    ambiente: 'producao',
    tipoExecucao: 'manual',
    origem: 'interna',
    dataAgendada: '2026-04-21',
    janelaExecucaoInicio: '19:00',
    janelaExecucaoFim: '19:40',
    solicitante: 'Operação',
    responsavelExecucao: 'Paulo Neri',
    planoRollback: 'Já executado — configuração anterior restaurada.',
    updatedAt: '2026-04-21 19:45',
    projectName: 'Plataforma de Atendimento',
    openProjectProjectId: 'OP-2088',
    checklistItems: [],
    historyItems: [
      { id: 'hist-5', timestamp: '2026-04-21 19:42', tipoEvento: 'Rollback executado', usuarioNome: 'Paulo Neri', observacao: 'Estabilidade restabelecida' },
    ],
  },
];

function createEmptyItem(): GMUDPageItem {
  return {
    id: 'new-gmud',
    titulo: '',
    description: '',
    status: 'rascunho',
    prioridade: 'baixa',
    impacto: 'baixo',
    ambiente: 'desenvolvimento',
    tipoExecucao: 'manual',
    origem: 'interna',
    dataAgendada: null,
    janelaExecucaoInicio: null,
    janelaExecucaoFim: null,
    solicitante: null,
    responsavelExecucao: null,
    planoRollback: null,
    updatedAt: null,
    projectName: 'Portal Corporativo',
    openProjectProjectId: 'OP-1042',
    checklistItems: [],
    historyItems: [],
  };
}

export default function GMUDPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [prioridadeFilter, setPrioridadeFilter] = useState('');
  const [impactoFilter, setImpactoFilter] = useState('');
  const [ambienteFilter, setAmbienteFilter] = useState('');
  const [buscaFilter, setBuscaFilter] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [drawerItem, setDrawerItem] = useState<GMUDPageItem>(createEmptyItem());

  const filteredItems = useMemo(() => {
    return MOCK_ITEMS.filter((item) => {
      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchPrioridade = !prioridadeFilter || item.prioridade === prioridadeFilter;
      const matchImpacto = !impactoFilter || item.impacto === impactoFilter;
      const matchAmbiente = !ambienteFilter || item.ambiente === ambienteFilter;
      const termo = buscaFilter.trim().toLowerCase();
      const matchBusca =
        !termo ||
        item.titulo.toLowerCase().includes(termo) ||
        item.description.toLowerCase().includes(termo) ||
        (item.responsavelExecucao ?? '').toLowerCase().includes(termo);

      return matchStatus && matchPrioridade && matchImpacto && matchAmbiente && matchBusca;
    });
  }, [statusFilter, prioridadeFilter, impactoFilter, ambienteFilter, buscaFilter]);

  const tableItems = useMemo<GMUDTableItem[]>(() => {
    return filteredItems.map((item) => ({
      id: item.id,
      titulo: item.titulo,
      status: item.status,
      prioridade: item.prioridade,
      impacto: item.impacto,
      ambiente: item.ambiente,
      dataAgendada: item.dataAgendada,
      responsavelExecucao: item.responsavelExecucao,
      updatedAt: item.updatedAt,
    }));
  }, [filteredItems]);

  const kpis = useMemo(() => {
    return {
      total: filteredItems.length,
      emRevisao: filteredItems.filter((item) => item.status === 'em_revisao').length,
      agendadas: filteredItems.filter((item) => item.status === 'agendado').length,
      emExecucao: filteredItems.filter((item) => item.status === 'em_execucao').length,
      concluidas: filteredItems.filter((item) => item.status === 'concluido').length,
      rollbacks: filteredItems.filter((item) => item.status === 'rollback').length,
    };
  }, [filteredItems]);

  const handleOpenCreate = useCallback(() => {
    setDrawerItem(createEmptyItem());
    setDrawerMode('create');
    setDrawerOpen(true);
  }, []);

  const handleOpenView = useCallback((itemId: string) => {
    const found = MOCK_ITEMS.find((item) => item.id === itemId);
    if (!found) return;
    setDrawerItem(found);
    setDrawerMode('view');
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((itemId: string) => {
    const found = MOCK_ITEMS.find((item) => item.id === itemId);
    if (!found) return;
    setDrawerItem({ ...found });
    setDrawerMode('edit');
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter('');
    setPrioridadeFilter('');
    setImpactoFilter('');
    setAmbienteFilter('');
    setBuscaFilter('');
  }, []);

  const handleSubmit = useCallback(() => {
    console.info('Submit GMUD:', drawerItem);
    setDrawerOpen(false);
  }, [drawerItem]);

  const handleDeleteFromTable = useCallback((itemId: string) => {
    console.info('Delete da tabela:', itemId);
  }, []);

  const handleDeleteFromDrawer = useCallback(() => {
    console.info('Delete do drawer:', drawerItem.id);
    setDrawerOpen(false);
  }, [drawerItem]);

  const updateDrawerField = useCallback(
    (field: keyof GMUDPageItem, value: string) => {
      setDrawerItem((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GMUDHeader
        title="GMUD"
        />

        <div className="mt-6">
          <GMUDKpis
            total={kpis.total}
            emRevisao={kpis.emRevisao}
            agendadas={kpis.agendadas}
            emExecucao={kpis.emExecucao}
            concluidas={kpis.concluidas}
            rollbacks={kpis.rollbacks}
            loading={false}
          />
        </div>

        <div className="mt-6">
          <GMUDFilters
            status={statusFilter}
            prioridade={prioridadeFilter}
            impacto={impactoFilter}
            ambiente={ambienteFilter}
            busca={buscaFilter}
            loading={false}
            disabled={false}
            onStatusChange={setStatusFilter}
            onPrioridadeChange={setPrioridadeFilter}
            onImpactoChange={setImpactoFilter}
            onAmbienteChange={setAmbienteFilter}
            onBuscaChange={setBuscaFilter}
            onApplyFilters={() => {}}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Estrutura funcional inicial da GMUD, ainda sem hook, api e mapper reais.
        </div>

        <div className="mt-6">
          <GMUDTable
            items={tableItems}
            loading={false}
            emptyMessage="Nenhuma GMUD encontrada para os filtros atuais."
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteFromTable}
          />
        </div>
      </div>

      <GMUDDrawer
        open={drawerOpen}
        mode={drawerMode}
        loading={false}
        saving={false}
        deleting={false}
        title={drawerItem.titulo}
        description={drawerItem.description}
        projectName={drawerItem.projectName}
        openProjectProjectId={drawerItem.openProjectProjectId}
        status={drawerItem.status}
        prioridade={drawerItem.prioridade}
        impacto={drawerItem.impacto}
        ambiente={drawerItem.ambiente}
        tipoExecucao={drawerItem.tipoExecucao}
        origem={drawerItem.origem}
        dataAgendada={drawerItem.dataAgendada}
        janelaExecucaoInicio={drawerItem.janelaExecucaoInicio}
        janelaExecucaoFim={drawerItem.janelaExecucaoFim}
        solicitante={drawerItem.solicitante}
        responsavelExecucao={drawerItem.responsavelExecucao}
        planoRollback={drawerItem.planoRollback}
        checklistItems={drawerItem.checklistItems}
        historyItems={drawerItem.historyItems}
        error={null}
        submitLabel={drawerMode === 'create' ? 'Criar GMUD' : 'Salvar Alterações'}
        deleteLabel="Excluir GMUD"
        closeLabel="Fechar"
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        onDelete={handleDeleteFromDrawer}
        onTitleChange={(value) => updateDrawerField('titulo', value)}
        onDescriptionChange={(value) => updateDrawerField('description', value)}
        onStatusChange={(value) => updateDrawerField('status', value)}
        onPrioridadeChange={(value) => updateDrawerField('prioridade', value)}
        onImpactoChange={(value) => updateDrawerField('impacto', value)}
        onAmbienteChange={(value) => updateDrawerField('ambiente', value)}
        onTipoExecucaoChange={(value) => updateDrawerField('tipoExecucao', value)}
        onOrigemChange={(value) => updateDrawerField('origem', value)}
        onDataAgendadaChange={(value) => updateDrawerField('dataAgendada', value)}
        onJanelaExecucaoInicioChange={(value) => updateDrawerField('janelaExecucaoInicio', value)}
        onJanelaExecucaoFimChange={(value) => updateDrawerField('janelaExecucaoFim', value)}
        onSolicitanteChange={(value) => updateDrawerField('solicitante', value)}
        onResponsavelExecucaoChange={(value) => updateDrawerField('responsavelExecucao', value)}
        onPlanoRollbackChange={(value) => updateDrawerField('planoRollback', value)}
      />
    </div>
  );
}
