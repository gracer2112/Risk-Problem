// src/components/gmud/GMUDDrawer.tsx

import React from 'react';
import { useState } from 'react';
import DrawerSection from '@/components/DrawerSection';
import {
  StatusGMUD,
  PrioridadeGMUD,
  ImpactoGMUD,
  AmbienteGMUD,
  TipoExecucaoGMUD,
  OrigemGMUD,
  StatusChecklistGMUD,
} from '@/types/gmud';
import type {
  GMUDResponseDTO,
  ChecklistItemGMUD,
  HistoricoItemGMUD,
  PayloadChecklistItemGMUD,
} from '@/types/gmud';
import {
  getStatusGMUDLabel,
  getPrioridadeGMUDLabel,
  getImpactoGMUDLabel,
  getAmbienteGMUDLabel,
  getTipoExecucaoGMUDLabel,
  getOrigemGMUDLabel,
  getChecklistResumoGMUD,
  getStatusChecklistGMUDLabel,
} from '@/utils/gmud-domain';
import { GMUDBadge } from './GMUDBadge';
import GMUDChecklist from './GMUDChecklist';
import GMUDHistorico from './GMUDHistorico';
import GMUDRollback from './GMUDRollback';

type Props = {
  open: boolean;
  openproject_project_id: string | null;
  gmud?: GMUDResponseDTO;
  isLoading?: boolean;
  loading?: boolean;
  saving?: boolean;
  deleting?: boolean;
  mode?: 'create' | 'edit' | 'view';
  titulo?: string;
  descricao?: string;
  status?: StatusGMUD;
  prioridade?: PrioridadeGMUD;
  impacto?: ImpactoGMUD;
  ambiente?: AmbienteGMUD;
  tipo_execucao?: TipoExecucaoGMUD;
  origem?: OrigemGMUD;
  data_agendada?: string;
  janela_execucao_inicio?: string;
  janela_execucao_fim?: string;
  solicitante?: string;
  responsavel_execucao?: string;
  plano_rollback?: string;
  itens_checklist?: ChecklistItemGMUD[];
  historico?: HistoricoItemGMUD[];
  error?: string;
  submitLabel?: string;
  deleteLabel?: string;
  closeLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  onChangeTitulo?: (value: string) => void;
  onChangeDescricao?: (value: string) => void;
  onChangeSolicitante?: (value: string) => void;
  onChangeResponsavelExecucao?: (value: string) => void;
  onChangeDataAgendada?: (value: string) => void;
  onChangeJanelaExecucaoInicio?: (value: string) => void;
  onChangeJanelaExecucaoFim?: (value: string) => void;
  onChangePlanoRollback?: (value: string) => void;
  onChangeStatus?: (value: StatusGMUD) => void; 
  onChangePrioridade?: (value: PrioridadeGMUD) => void;
  onChangeImpacto?: (value: ImpactoGMUD) => void;
  onChangeAmbiente?: (value: AmbienteGMUD) => void;
  onChangeTipoExecucao?: (value: TipoExecucaoGMUD) => void;
  onChangeOrigem?: (value: OrigemGMUD) => void;
  onAddChecklistItem?: (gmudId: string, descricao: string) => void;
  onUpdateChecklistItem?: (gmudId: string, itemId: string, payload: PayloadChecklistItemGMUD) => void;
  onDeleteChecklistItem?: (gmudId: string, itemId: string) => void;
  onChecklistUpdated?: () => void;
  onChecklistEditStart?: (itemId: string | null) => void;
  editingChecklistItemId?: string | null;
};


const GMUDDrawer: React.FC<Props> = ({
  open,
  openproject_project_id,
  gmud,
  isLoading = false,
  loading = false,
  saving = false,
  deleting = false,
  mode: modeProp,
  titulo: propTitulo,
  descricao: propDescricao,
  status: propStatus,
  prioridade: propPrioridade,
  impacto: propImpacto,
  ambiente: propAmbiente,
  tipo_execucao: propTipoExecucao,
  origem: propOrigem,
  data_agendada: propDataAgendada,
  janela_execucao_inicio: propJanelaInicio,
  janela_execucao_fim: propJanelaFim,
  solicitante: propSolicitante,
  responsavel_execucao: propResponsavel,
  plano_rollback: propPlanoRollback,
  itens_checklist: propItensChecklist = [],
  historico: propHistorico = [],
  error,
  submitLabel,
  deleteLabel,
  closeLabel,
  onClose,
  onSubmit,
  onDelete,
  onChangeTitulo,
  onChangeDescricao,
  onChangeSolicitante,
  onChangeResponsavelExecucao,
  onChangeDataAgendada,
  onChangeJanelaExecucaoInicio,
  onChangeJanelaExecucaoFim,
  onChangePlanoRollback,
  onChangeStatus,
  onChangePrioridade,
  onChangeImpacto,
  onChangeAmbiente,
  onChangeTipoExecucao,
  onChangeOrigem,
  onAddChecklistItem,
  onUpdateChecklistItem,
  onDeleteChecklistItem,
  onChecklistUpdated,
  onChecklistEditStart,
  editingChecklistItemId,
}) => {

  if (!open) return null;

  const mode = modeProp ?? (gmud ? 'edit' : 'create');

  const [localStatus, setLocalStatus] = useState<StatusGMUD>(gmud?.status ?? propStatus ?? StatusGMUD.RASCUNHO);
  const [localPrioridade, setLocalPrioridade] = useState<PrioridadeGMUD>(gmud?.prioridade ?? propPrioridade ?? PrioridadeGMUD.BAIXA);
  const [localImpacto, setLocalImpacto] = useState<ImpactoGMUD>(gmud?.impacto ?? propImpacto ?? ImpactoGMUD.BAIXO);
  const [localAmbiente, setLocalAmbiente] = useState<AmbienteGMUD>(gmud?.ambiente ?? propAmbiente ?? AmbienteGMUD.DESENVOLVIMENTO);
  const [localTipoExecucao, setLocalTipoExecucao] = useState<TipoExecucaoGMUD>(gmud?.tipo_execucao ?? propTipoExecucao ?? TipoExecucaoGMUD.MANUAL);
  const [localOrigem, setLocalOrigem] = useState<OrigemGMUD>(gmud?.origem ?? propOrigem ?? OrigemGMUD.INTERNA);

  const titulo = propTitulo ?? gmud?.titulo ?? '';
  const descricao = propDescricao ?? gmud?.descricao ?? '';
  const status = gmud?.status ?? propStatus;
  const prioridade = gmud?.prioridade ?? propPrioridade;
  const impacto = gmud?.impacto ?? propImpacto;
  const ambiente = gmud?.ambiente ?? propAmbiente;
  const tipo_execucao = gmud?.tipo_execucao ?? propTipoExecucao;
  const origem = gmud?.origem ?? propOrigem;
  const data_agendada = propDataAgendada ?? gmud?.data_agendada ?? "";
  const janela_execucao_inicio = propJanelaInicio ?? gmud?.janela_execucao_inicio ?? "";
  const janela_execucao_fim = propJanelaFim ?? gmud?.janela_execucao_fim ?? "";
  const solicitante = propSolicitante ?? gmud?.solicitante ?? "";
  const responsavel_execucao = propResponsavel ?? gmud?.responsavel_execucao ?? "";
  const plano_rollback = propPlanoRollback ?? gmud?.plano_rollback ?? "";
  
  const itens_checklist: ChecklistItemGMUD[] = gmud?.itens_checklist ?? propItensChecklist;
  const historico: HistoricoItemGMUD[] = gmud?.historico ?? propHistorico;

  const effectiveStatus = gmud?.status ?? status;
  const effectivePrioridade = gmud?.prioridade ?? prioridade;
  const effectiveImpacto = gmud?.impacto ?? impacto;
  const effectiveAmbiente = gmud?.ambiente ?? ambiente;
  const effectiveTipoExecucao = gmud?.tipo_execucao ?? tipo_execucao;
  const effectiveOrigem = gmud?.origem ?? origem;

  const safeStatus: StatusGMUD = effectiveStatus ?? StatusGMUD.RASCUNHO;
  const safePrioridade: PrioridadeGMUD = effectivePrioridade ?? PrioridadeGMUD.BAIXA;
  const safeImpacto: ImpactoGMUD = effectiveImpacto ?? ImpactoGMUD.BAIXO;
  const safeAmbiente: AmbienteGMUD = effectiveAmbiente ?? AmbienteGMUD.DESENVOLVIMENTO;
  const safeTipoExecucao: TipoExecucaoGMUD = effectiveTipoExecucao ?? TipoExecucaoGMUD.MANUAL;
  const safeOrigem: OrigemGMUD = effectiveOrigem ?? OrigemGMUD.INTERNA;

  console.log("%c[DEBUG DRAWER] props recebidas", "background: #006; color: #fff; padding: 4px;", {
    editingChecklistItemId,
    itens_checklist_length: itens_checklist?.length,
    gmud_id: gmud?.id
  });

  const [newChecklistDescricao, setNewChecklistDescricao] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editObservacao, setEditObservacao] = useState("");
  const [editStatus, setEditStatus] = useState<StatusChecklistGMUD>(StatusChecklistGMUD.PENDENTE);

  const drawerTitle = `${
    mode === 'create' ? 'Novo GMUD' :
    mode === 'view' ? 'Visualizar GMUD' :
    'Editar GMUD'
  }${titulo ? `: ${titulo}` : ''}`;

  function normalizeDate(dateStr?: string | null) {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  }

  function normalizeDateTime(dateStr?: string | null) {
    if (!dateStr) return "";
    const [date, time] = dateStr.split("T");
    const [h, m] = time.split(":");
    return `${date}T${h}:${m}`;
  }
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleString('pt-BR') : 'N/A';
  const formatDateOnly = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : 'N/A';
  const formatTime = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleTimeString('pt-BR') : 'N/A';

  const isSkeleton = isLoading || loading;
  const checklistResumo = getChecklistResumoGMUD(itens_checklist);

  React.useEffect(() => {
    if (gmud) {
      setLocalStatus(gmud.status ?? StatusGMUD.RASCUNHO);
      setLocalPrioridade(gmud.prioridade ?? PrioridadeGMUD.BAIXA);
      setLocalImpacto(gmud.impacto ?? ImpactoGMUD.BAIXO);
      setLocalAmbiente(gmud.ambiente ?? AmbienteGMUD.DESENVOLVIMENTO);
      setLocalTipoExecucao(gmud.tipo_execucao ?? TipoExecucaoGMUD.MANUAL);
      setLocalOrigem(gmud.origem ?? OrigemGMUD.INTERNA);
    }
  }, [gmud]);
  
  return (
    
    <div
      className="w-96 h-full bg-background shadow-2xl border-l border-border overflow-hidden flex flex-col max-h-screen"
      onClick={(e) => e.stopPropagation()}
  >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-foreground tracking-tight">{drawerTitle}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:bg-accent hover:text-foreground p-2 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && !isSkeleton && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          {isSkeleton ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-48 animate-pulse" />
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-32 animate-pulse" />
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-32 animate-pulse" />
                <div className="h-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-32 animate-pulse" />
                {[1,2,3].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-32 animate-pulse" />
                <div className="h-24 bg-muted rounded animate-pulse overflow-hidden" />
              </div>
            </div>
          ) : (
            <>
              <DrawerSection title="Identificação">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  {gmud?.project_id && (
                    <div>
                      <span className="font-medium text-muted-foreground">Project ID:</span>
                      <p className="mt-1 font-mono text-foreground bg-muted/50 px-2 py-1 rounded text-xs">
                        {gmud.project_id}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-muted-foreground">OpenProject ID:</span>
                    <p className="mt-1 font-mono text-foreground bg-muted/50 px-2 py-1 rounded text-xs">
                      {openproject_project_id || 'N/A'}
                    </p>
                  </div>
                  <div className="lg:col-span-2">
                    <span className="font-medium text-muted-foreground">Título:</span>
                    {mode === "create" || mode === "edit" ? (
                      <input
                        type="text"
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                        value={titulo}
                        onChange={(e) => onChangeTitulo?.(e.target.value)}
                        placeholder="Digite o título da GMUD"
                      />
                    ) : (
                      <p className="mt-1 text-foreground font-medium">{titulo}</p>
                    )}
                  </div>
                <div className="lg:col-span-2">
                  <span className="font-medium text-muted-foreground">Descrição:</span>

                  {mode === "create" || mode === "edit" ? (
                    <textarea
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground min-h-[120px]"
                      value={descricao}
                      onChange={(e) => onChangeDescricao?.(e.target.value)}
                      placeholder="Descreva a mudança"
                    />
                  ) : (
                    <p className="mt-1 text-foreground whitespace-pre-line">{descricao}</p>
                  )}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Solicitante:</span>
                  {mode === "create" || mode === "edit"? (
                    <input
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                      value={solicitante ?? ""}
                      onChange={(e) =>
                        onChangeSolicitante?.(e.target.value)
                      }
                      placeholder="Digite o solicitante"
                    />
                  ) : (<p className="mt-1 text-foreground">{solicitante}</p>
                  )}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Responsável Execução:</span>
                  {mode === "create" || mode === "edit"? (
                    <input
                      className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                      value={responsavel_execucao ?? ""}
                      onChange={(e) =>
                        onChangeResponsavelExecucao?.(e.target.value)
                      }
                      placeholder="Digite o responsável pela execução"
                    />
                  ) : (
                    <p className="mt-1 text-foreground">{responsavel_execucao}</p>
                  )}
                </div>
                  {gmud?.created_at && (
                    <div>
                      <span className="font-medium text-muted-foreground">Criado em:</span>
                      <p className="mt-1 text-foreground text-xs">{formatDate(gmud.created_at)}</p>
                    </div>
                  )}
                  {gmud?.updated_at && (
                    <div>
                      <span className="font-medium text-muted-foreground">Atualizado em:</span>
                      <p className="mt-1 text-foreground text-xs">{formatDate(gmud.updated_at)}</p>
                    </div>
                  )}
                </div>
              </DrawerSection>

              <DrawerSection title="Classificação">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground block mb-1">Status</span>
                    {mode === "edit" || mode === "create" ? (
                      <select
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                        value={localStatus}
                        onChange={(e) => {
                          const v = e.target.value as StatusGMUD;
                          setLocalStatus(v);
                          onChangeStatus?.(v);
                        }}
                      >
                        {Object.values(StatusGMUD).map((st) => (
                          <option key={st} value={st}>
                            {getStatusGMUDLabel(st)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <GMUDBadge type="status" value={safeStatus} />
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground block mb-1">Prioridade</span>
                    {mode === "edit" || mode === "create" ? (
                      <select
                        value={localPrioridade}
                        onChange={(e) => {
                          const v = e.target.value as PrioridadeGMUD;
                          setLocalPrioridade(v);
                          onChangePrioridade?.(v);
                        }}
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                      >
                        {Object.values(PrioridadeGMUD).map((p) => (
                          <option key={p} value={p}>
                            {getPrioridadeGMUDLabel(p)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{getPrioridadeGMUDLabel(safePrioridade)}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground block mb-1">Impacto</span>
                    {mode === "edit" || mode === "create" ? (
                      <select
                        value={localImpacto}
                        onChange={(e) => {
                          const v = e.target.value as ImpactoGMUD;
                          setLocalImpacto(v);
                          onChangeImpacto?.(v);
                        }}
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                      >
                        {Object.values(ImpactoGMUD).map((i) => (
                          <option key={i} value={i}>
                            {getImpactoGMUDLabel(i)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{getImpactoGMUDLabel(safeImpacto)}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground block mb-1">Ambiente</span>
                    {mode === "edit" || mode === "create" ? (
                      <select
                        value={localAmbiente}
                        onChange={(e) => {
                          const v = e.target.value as AmbienteGMUD;
                          setLocalAmbiente(v);
                          onChangeAmbiente?.(v);
                        }}
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                      >
                        {Object.values(AmbienteGMUD).map((amb) => (
                          <option key={amb} value={amb}>
                            {getAmbienteGMUDLabel(amb)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{getAmbienteGMUDLabel(safeAmbiente)}</span>
)}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground block mb-1">Tipo Execução</span>
                    {mode === "edit" || mode === "create" ? (
                      <select
                        value={localTipoExecucao}
                        onChange={(e) => {
                          const v = e.target.value as TipoExecucaoGMUD;
                          setLocalTipoExecucao(v);
                          onChangeTipoExecucao?.(v);
                        }}
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                      >
                        {Object.values(TipoExecucaoGMUD).map((t) => (
                          <option key={t} value={t}>
                            {getTipoExecucaoGMUDLabel(t)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{getTipoExecucaoGMUDLabel(safeTipoExecucao)}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground block mb-1">Origem</span>
                    {mode === "edit" || mode === "create" ? (
                      <select
                        value={localOrigem}
                        onChange={(e) => {
                          const v = e.target.value as OrigemGMUD;
                          setLocalOrigem(v);
                          onChangeOrigem?.(v);
                        }}
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                      >
                        {Object.values(OrigemGMUD).map((o) => (
                          <option key={o} value={o}>
                            {getOrigemGMUDLabel(o)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{getOrigemGMUDLabel(safeOrigem)}</span>
                    )}
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection title="Agenda / Execução">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                  {data_agendada && (
                    <div>
                      <span className="font-medium text-muted-foreground">Data Agendada:</span>
                      {mode === "create" || mode === "edit"? (
                        <input
                          type="date"
                          className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                          value={normalizeDate(data_agendada)}
                          onChange={(e) =>
                            onChangeDataAgendada?.(e.target.value)
                          }
                        />
                      ) : (
                        data_agendada && (
                          <p className="mt-1 font-mono">{formatDateOnly(data_agendada)}</p>
                        )
                      )}
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-muted-foreground">Janela Início:</span>
                    {mode === "create" || mode === "edit" ? (
                      <input
                        type="datetime-local"
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                        value={normalizeDateTime(janela_execucao_inicio)}
                        onChange={(e) =>
                          onChangeJanelaExecucaoInicio?.(e.target.value)
                        }
                      />
                    ) : (
                      <p className="mt-1 font-mono">{formatTime(janela_execucao_inicio)}</p>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Janela Fim:</span>
                    {mode === "create" || mode === "edit" ? (
                      <input
                        type="datetime-local"
                        className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground"
                        value={normalizeDateTime(janela_execucao_fim)}
                        onChange={(e) =>
                          onChangeJanelaExecucaoFim?.(e.target.value)
                        }
                      />
                    ) : (
                      <p className="mt-1 font-mono">{formatTime(janela_execucao_fim)}</p>
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    <span className="font-medium text-muted-foreground">Plano Rollback:</span>
                      {mode === "create" || mode === "edit"? (
                        <textarea
                          className="mt-1 w-full px-3 py-2 border rounded-md bg-white text-foreground min-h-[120px]"
                          value={plano_rollback ?? ""}
                          onChange={(e) =>
                            onChangePlanoRollback?.(e.target.value)
                          }
                          placeholder="Descreva o plano de rollback"
                        />
                      ) : (
                        <p className="mt-1 text-foreground whitespace-pre-wrap">{plano_rollback || "Não definido"}</p>
                      )}
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection title="Checklist">
                <GMUDChecklist
                  itens={itens_checklist}
                  mode={mode}
                  editingId={editingChecklistItemId ?? null}
                  onStartEdit={(id) => onChecklistEditStart?.(id)}
                  onCancelEdit={() => onChecklistEditStart?.(null)}
                  onAdd={async (descricao) => {
                    console.log("[DRAWER] onAddChecklistItem disparado", {
                      gmudId: gmud?.id,
                      descricao,
                    });

                    if (!gmud?.id) {
                      console.log("[DRAWER] gmud ou gmud.id inválido — abortando onAdd", { gmud, gmudId: gmud?.id });
                      return;
                    }

                    const result = await onAddChecklistItem?.(gmud.id, descricao);
                    console.log("[DRAWER] retorno do onAddChecklistItem:", result);

                    return result;
                  }}
                  onUpdate={async (id, data) => {
                    console.log("[DRAWER] onUpdateChecklistItem disparado", {
                        gmudId: gmud?.id,
                        id,
                        data,
                    });

                    if (!gmud) {
                      console.log("[DRAWER] gmud undefined — abortando onUpdate");
                      return;
                    }

                    const result = await onUpdateChecklistItem?.(gmud.id, id, data);
                    return result;
                  }}
                  onDelete={async (id) => {
                    if (!gmud) return;
                    return await onDeleteChecklistItem?.(gmud.id, id);
                  }}
                  onAfterChange={() => onChecklistUpdated?.()}
                />
              </DrawerSection>
              {/* Resumo */}
              <div className="mb-4 p-3 bg-accent/10 rounded-md font-medium">
                <div>Total: {checklistResumo.total}</div>
                <div>Concluídos: {checklistResumo.concluidos}</div>
                <div>Pendentes: {checklistResumo.pendentes}</div>
                <div>Dispensados: {checklistResumo.dispensados}</div>
                <div>Percentual de conclusão: {checklistResumo.percentual_conclusao}%</div>
                <div>Pronto: {checklistResumo.pronto ? "Sim" : "Não"}</div>
              </div>      

              <DrawerSection title="Histórico">
                <GMUDHistorico eventos={historico} />
              </DrawerSection>

              {gmud?.eventos_rollback && gmud.eventos_rollback.length > 0 && (
                <DrawerSection title="Rollbacks">
                  <GMUDRollback
                    rollbacks={[]}   // POR ENQUANTO
                    mode={mode}
                    editingId={null}
                    onStartEdit={() => {}}
                    onCancelEdit={() => {}}
                    onUpdate={() => {}}
                    onAdd={() => {}}
                    onDelete={() => {}}
                  />
                </DrawerSection>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6 pt-0 flex justify-end space-x-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="px-4 py-2 h-10 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2"
          >
            {closeLabel ?? 'Fechar'}
          </button>
          {mode !== 'view' && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving || deleting}
              className="px-4 py-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-sm rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Salvando...' : (submitLabel ?? 'Salvar')}
            </button>
          )}
          {onDelete && mode !== 'create' && (
            <button
              type="button"
              onClick={
                () => {
                  console.debug("[DRAWER][CHECKLIST][DELETE] disparado", {
                    gmudId: gmud?.id,
                    //itemId: item.id,
                  });
                  onDelete();
                }
              }
              disabled={deleting || saving}
              className="px-4 py-2 h-10 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2"
            >
              {deleting ? 'Excluindo...' : (deleteLabel ?? 'Excluir')}
            </button>
          )}
        </div>
      </div>
  );
};

export default GMUDDrawer;
