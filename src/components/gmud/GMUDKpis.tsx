// src/components/gmud/GMUDKpis.tsx

interface GMUDKpisProps {
  total?: number;
  emRevisao?: number;
  agendadas?: number;
  emExecucao?: number;
  concluidas?: number;
  rollbacks?: number;
  loading?: boolean;
}

const GMUDKpis = ({
  total = 0,
  emRevisao = 0,
  agendadas = 0,
  emExecucao = 0,
  concluidas = 0,
  rollbacks = 0,
  loading = false,
}: GMUDKpisProps) => {
  const kpis = [
    { label: 'Total', value: total },
    { label: 'Em revisão', value: emRevisao },
    { label: 'Agendadas', value: agendadas },
    { label: 'Em execução', value: emExecucao },
    { label: 'Concluídas', value: concluidas },
    { label: 'Rollbacks', value: rollbacks },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {kpis.map(({ label, value }, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 text-center hover:shadow-md transition-shadow"
        >
          <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            {label}
          </p>
          {loading ? (
            <div className="h-12 bg-gray-200 animate-pulse rounded-lg mx-auto w-24 mb-2"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {value.toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export type { GMUDKpisProps };
export default GMUDKpis;
