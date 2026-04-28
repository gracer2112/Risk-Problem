// src/app/gmud/page.tsx

'use client';

import { useCallback, useMemo, useState } from 'react';
import GMUDHeader from '@/components/gmud/GMUDHeader';
import GMUDKpis from '@/components/gmud/GMUDKpis';
import GMUDFilters from '@/components/gmud/GMUDFilters';
import GMUDTable, { type GMUDTableItem } from '@/components/gmud/GMUDTable';
import { StatusGMUD, PrioridadeGMUD, ImpactoGMUD, AmbienteGMUD, TipoExecucaoGMUD, OrigemGMUD, ChecklistItemGMUD, HistoricoItemGMUD } from '@/types/gmud';
import GMUDDrawer from '@/components/gmud/GMUDDrawer';

export interface GMUDPageItem {
  id: string;
  titulo: string;
  descricao: string;
  status: StatusGMUD;
  prioridade: PrioridadeGMUD;
  impacto: ImpactoGMUD;
  ambiente: AmbienteGMUD;
  tipo_execucao: TipoExecucaoGMUD;
  origem: OrigemGMUD;
  openproject_project_id?: string;
  data_agendada?: string;
  janela_execucao_inicio?: string;
  janela_execucao_fim?: string;
  solicitante?: string;
  responsavel_execucao?: string;
  plano_rollback?: string;
  itens_checklist: ChecklistItemGMUD[];
  historico: HistoricoItemGMUD[];
}

const MOCK_ITEMS: GMUDPageItem[] = [
  {
    id: '1',
    titulo: 'Atualização de Segurança Crítica',
    descricao: 'Aplicar patches de segurança no servidor de produção.',
    status: StatusGMUD.EM_EXECUCAO,
    prioridade: PrioridadeGMUD.CRITICA,
    impacto: ImpactoGMUD.CRITICO,
    ambiente: AmbienteGMUD.PRODUCAO,
    tipo_execucao: TipoExecucaoGMUD.MANUAL,
    origem: OrigemGMUD.INTERNA,
    openproject_project_id: 'OP-12345',
    data_agendada: '2024-10-20',
    janela_execucao_inicio: '2024-10-20T22:00:00Z',
    janela_execucao_fim: '2024-10-21T02:00:00Z',
    solicitante: 'João Silva',
    responsavel_execucao: 'Maria Oliveira',
    plano_rollback: 'Reverter snapshot do servidor.',
    itens_checklist: [
      {
        id: 'chk1',
        descricao: 'Verificar backup pré-execução',
        status: 'CONCLUIDO' as ChecklistItemGMUD['status'],
        observacao: 'Backup realizado com sucesso.'
      },
      {
        id: 'chk2',
        descricao: 'Testar em homologação',
        status: 'PENDENTE' as ChecklistItemGMUD['status'],
        observacao: ''
      },
      {
        id: 'chk3',
        descricao: 'Comunicar downtime',
        status: 'EM_ANDAMENTO' as ChecklistItemGMUD['status'],
        observacao: 'E-mail enviado aos stakeholders.'
      }
    ] as ChecklistItemGMUD[],
    historico: [
      {
        id: 'hist1',
        timestamp: '2024-10-18T09:00:00Z',
        tipo_evento: 'CRIACAO' as HistoricoItemGMUD['tipo_evento'],
        usuario_id: 'user1',
        usuario_nome: 'João Silva',
        observacao: 'GMUD criado.'
      },
      {
        id: 'hist2',
        timestamp: '2024-10-19T14:30:00Z',
        tipo_evento: 'APROVACAO' as HistoricoItemGMUD['tipo_evento'],
        usuario_id: 'user2',
        usuario_nome: 'Gerente de TI',
        observacao: 'Aprovado para execução.'
      }
    ]
  },
  {
    id: '2',
    titulo: 'Deploy de Nova Feature',
    descricao: 'Lançar nova funcionalidade de login no app mobile.',
    status: StatusGMUD.CONCLUIDO,
    prioridade: PrioridadeGMUD.ALTA,
    impacto: ImpactoGMUD.ALTO,
    ambiente: AmbienteGMUD.HOMOLOGACAO,
    tipo_execucao: TipoExecucaoGMUD.AUTOMATICA,
    origem: OrigemGMUD.CLIENTE,
    openproject_project_id: 'OP-67890',
    data_agendada: '2024-10-15',
    janela_execucao_inicio: '2024-10-15T18:00:00Z',
    janela_execucao_fim: '2024-10-15T20:00:00Z',
    solicitante: 'Equipe de Produto',
    responsavel_execucao: 'DevOps Team',
    plano_rollback: 'Rollback via Git tag anterior.',
    itens_checklist: [
      {
        id: 'chk4',
        descricao: 'Executar script de deploy',
        status: 'CONCLUIDO' as ChecklistItemGMUD['status'],
        observacao: 'Deploy automático bem-sucedido.'
      },
      {
        id: 'chk5',
        descricao: 'Validar logs pós-deploy',
        status: 'CONCLUIDO' as ChecklistItemGMUD['status'],
        observacao: 'Sem erros nos logs.'
      }
    ] as ChecklistItemGMUD[],
    historico: [
      {
        id: 'hist3',
        timestamp: '2024-10-14T10:00:00Z',
        tipo_evento: 'AGENDAMENTO' as HistoricoItemGMUD['tipo_evento'],
        usuario_id: 'user3',
        usuario_nome: 'Product Owner',
        observacao: 'Agendado para homologação.'
      },
      {
        id: 'hist4',
        timestamp: '2024-10-15T21:00:00Z',
        tipo_evento: 'CONCLUSAO' as HistoricoItemGMUD['tipo_evento'],
        usuario_id: 'user4',
        usuario_nome: 'DevOps Lead',
        observacao: 'Execução concluída sem incidentes.'
      }
    ]
  }
];

const createEmptyItem = (): GMUDPageItem => ({
  id: '',
  titulo: '',
  descricao: '',
  status: StatusGMUD.RASCUNHO,
  prioridade: PrioridadeGMUD.BAIXA,
  impacto: ImpactoGMUD.BAIXO,
  ambiente: AmbienteGMUD.DESENVOLVIMENTO,
  tipo_execucao: TipoExecucaoGMUD.MANUAL,
  origem: OrigemGMUD.INTERNA,
  openproject_project_id: '',
  data_agendada: '',
  janela_execucao_inicio: '',
  janela_execucao_fim: '',
  solicitante: '',
  responsavel_execucao: '',
  plano_rollback: '',
  itens_checklist: [],
  historico: []
});

/*function createEmptyItem(): GMUDPageItem {
  return {
    id: '',
    titulo: '',
    descricao: '',
    status: StatusGMUD.RASCUNHO,
    prioridade: PrioridadeGMUD.BAIXA,
    impacto: ImpactoGMUD.BAIXO,
    ambiente: AmbienteGMUD.HOMOLOGACAO,
    tipo_execucao: TipoExecucaoGMUD.MANUAL,
    origem: OrigemGMUD.INTERNA,
    openproject_project_id: '',
    data_agendada: '',
    janela_execucao_inicio: '',
    janela_execucao_fim: '',
    solicitante: '',
    responsavel_execucao: '',
    plano_rollback: '',
    itens_checklist: [] as ChecklistItemGMUD[],
    historico: [] as HistoricoItemGMUD[],
  };
}*/

export default function GMUDPage() {
  const [items, setItems] = useState<GMUDPageItem[]>(MOCK_ITEMS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<GMUDPageItem>(createEmptyItem());
  const [filters, setFilters] = useState({
    status: '' as StatusGMUD | '',
    prioridade: '' as PrioridadeGMUD | '',
  });

  const filteredItems = items.filter(
    (item) =>
      (!filters.status || item.status === filters.status) &&
      (!filters.prioridade || item.prioridade === filters.prioridade)
  );

  const openDrawer = (item?: GMUDPageItem) => {
    setDrawerData(item ?? createEmptyItem());
    setDrawerOpen(true);
  };

  const handleSave = useCallback(() => {
    console.log('Salvando:', drawerData);
    // Lógica de save: update or create
    setDrawerOpen(false);
  }, [drawerData]);

  const updateDrawerField = <K extends keyof GMUDPageItem>(
    field: K,
    value: GMUDPageItem[K]
  ) => {
    setDrawerData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de GMUD</h1>
        <button
          onClick={() => openDrawer()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Novo GMUD
        </button>
      </div>

      {/* Filtros simples */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
        <div>
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as StatusGMUD } as any)}
            className="w-full p-2 border rounded"
          >
            <option value="">Todos</option>
            {Object.values(StatusGMUD).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Prioridade</label>
          <select
            value={filters.prioridade}
            onChange={(e) => setFilters({ ...filters, prioridade: e.target.value as PrioridadeGMUD } as any)}
            className="w-full p-2 border rounded"
          >
            <option value="">Todos</option>
            {Object.values(PrioridadeGMUD).map((pri) => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Título</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Prioridade</th>
              <th className="px-4 py-2 border">Impacto</th>
              <th className="px-4 py-2 border">Ambiente</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDrawer(item)}>
                <td className="px-4 py-2 border">{item.id}</td>
                <td className="px-4 py-2 border">{item.titulo}</td>
                <td className="px-4 py-2 border">{item.status}</td>
                <td className="px-4 py-2 border">{item.prioridade}</td>
                <td className="px-4 py-2 border">{item.impacto}</td>
                <td className="px-4 py-2 border">{item.ambiente}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDrawer(item);
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        <GMUDDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          titulo={drawerData.titulo}
          descricao={drawerData.descricao}
          openproject_project_id={drawerData.openproject_project_id || ''}
          tipo_execucao={drawerData.tipo_execucao}
          data_agendada={drawerData.data_agendada || ''}
          janela_execucao_inicio={drawerData.janela_execucao_inicio || ''}
          janela_execucao_fim={drawerData.janela_execucao_fim || ''}
          solicitante={drawerData.solicitante || ''}
          responsavel_execucao={drawerData.responsavel_execucao || ''}
          plano_rollback={drawerData.plano_rollback || ''}
          itens_checklist={drawerData.itens_checklist}
          historico={drawerData.historico}
          onSubmit={handleSave}
        />
    </div>
  );
}
