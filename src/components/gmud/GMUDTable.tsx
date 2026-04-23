// src/components/gmud/GMUDTable.tsx

export type GMUDTableItem = {
  id: string;
  titulo: string;
  status: string;
  prioridade: string;
  impacto: string;
  ambiente: string;
  dataAgendada?: string | null;
  responsavelExecucao?: string | null;
  updatedAt?: string | null;
};

export type GMUDTableProps = {
  items?: GMUDTableItem[];
  loading?: boolean;
  emptyMessage?: string;
  onView?: (itemId: string) => void;
  onEdit?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
};

const formatCell = (value?: string | null): string => value || '-';

const getStatusClass = (status: string): string => {
  const s = status.toLowerCase();
  switch (s) {
    case 'rascunho':
      return 'bg-gray-100 text-gray-800 border border-gray-200';
    case 'em_revisao':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'aprovado':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'rejeitado':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'agendado':
      return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
    case 'em_execucao':
      return 'bg-orange-100 text-orange-800 border border-orange-200';
    case 'concluido':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'cancelado':
      return 'bg-red-200 text-red-900 border border-red-300';
    case 'rollback':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    default:
      return 'bg-gray-200 text-gray-900 border border-gray-300';
  }
};

const GMUDTable = ({
  items = [],
  loading = false,
  emptyMessage = 'Nenhum item encontrado.',
  onView,
  onEdit,
  onDelete,
}: GMUDTableProps) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ambiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agendamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado em</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-48 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-6 w-20 rounded-full"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-28 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ambiente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agendamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado em</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.titulo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCell(item.prioridade)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCell(item.impacto)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCell(item.ambiente)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCell(item.dataAgendada)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCell(item.responsavelExecucao)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCell(item.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  {onView && (
                    <button
                      onClick={() => onView(item.id)}
                      className="text-indigo-600 hover:text-indigo-900 text-xs font-medium transition-colors"
                    >
                      Visualizar
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item.id)}
                      className="text-indigo-600 hover:text-indigo-900 text-xs font-medium transition-colors"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-900 text-xs font-medium transition-colors"
                    >
                      Excluir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GMUDTable;
