// src/components/RiskProblemDrawer.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import DrawerSection from "./DrawerSection";
import { Badge } from "./Badge"; // Seu Badge com type, value, className
import { validateRiskProblem, getVisibilityRules } from "@/utils/drawer-validation";
import {
  RiskProblemItem,
  RiskProblemCreateRequest,
  NaturezaEnum,
  SeveridadeEnum,
  StatusRiscoEnum,
  StatusProblemaEnum,
} from "@/types/risk-problem";

// Funções de cálculo (adaptadas para mapear ao seu Badge via severidade)
const getLevelForBadge = (value: number): { level: string; badgeValue: "baixa" | "media" | "alta" | "critica" } => {
  if (value < 30) return { level: "Baixo", badgeValue: "baixa" };
  if (value < 60) return { level: "Médio", badgeValue: "media" };
  if (value < 80) return { level: "Alto", badgeValue: "alta" };
  return { level: "Crítico", badgeValue: "critica" };
};

const calculateInerente = (probabilidade: number, impacto: number): number => {
  return Math.round((probabilidade * impacto) / 100);
};

const calculateResidual = (inerente: number, mitigacao: number = 50): number => {
  return Math.round(inerente * (1 - mitigacao / 100));
};

const calculatePrioridadeProblema = (urgencia: number, severidade: SeveridadeEnum): number => {
  const pesoSeveridade = severidade === SeveridadeEnum.BAIXA ? 1 : severidade === SeveridadeEnum.MEDIA ? 2 : severidade === SeveridadeEnum.ALTA ? 3 : 4;
  return Math.round((urgencia * pesoSeveridade) / 4);
};

const normalizeValidationErrors = (
  result: unknown
): Record<string, string> => {
  if (!result || typeof result !== "object") {
    return {};
  }

  // Caso o validator já retorne um objeto plano de erros
  if (!("errors" in result)) {
    const plain = result as Record<string, unknown>;

    return Object.entries(plain).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === "string" && value.trim()) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  // Caso o validator retorne algo como { errors: {...} }
  const nested = (result as { errors?: unknown }).errors;

  if (!nested || typeof nested !== "object") {
    return {};
  }

  return Object.entries(nested as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (typeof value === "string" && value.trim()) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
};

interface RiskProblemDrawerProps {
  isOpen: boolean;
  item: RiskProblemItem | null;
  onClose: () => void;
  onSave: (data: RiskProblemCreateRequest | Partial<RiskProblemItem>) => Promise<void>;
  loading?: boolean;
}

// const initialFormData: Partial<RiskProblemItem> = {
//   titulo: "",
//   descricao: "",
//   tipo_inicial: NaturezaEnum.RISCO,
//   natureza_atual: NaturezaEnum.RISCO,
//   status_operacional: StatusRiscoEnum.IDENTIFICADO,
//   severidade: SeveridadeEnum.BAIXA,
//   probabilidade: 50,
//   impacto: 50,
//   urgencia: 50,
//   prioridade: 0,
//   acao_corretiva: "",
//   responsavel: "",
//   data_prazo: "",
//   mitigacao: 50, // Assumindo adicionado no tipo RiskProblemItem
// };

// const RiskProblemDrawer: React.FC<RiskProblemDrawerProps> = ({
//   isOpen,
//   item,
//   onClose,
//   onSave,
//   loading = false,
// }) => {
//   const [formData, setFormData] = useState<Partial<RiskProblemItem>>(initialFormData);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [isSaving, setIsSaving] = useState(false);
//   const [calculatedFields, setCalculatedFields] = useState({
//     inerente: 0,
//     residual: 0,
//     prioridade: 0,
//   });

//   // Efeito: Gerenciar body overflow
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen]);

//   // Efeito: Carregar dados do item
//   useEffect(() => {
//     if (isOpen) {
//       if (item) {
//         setFormData(item);
//       } else {
//         setFormData(initialFormData);
//       }
//       setErrors({});
//     }
//   }, [isOpen, item]);

//   // Efeito: Recalcular campos derivados
//   useEffect(() => {
//     const { probabilidade = 0, impacto = 0, urgencia = 0, natureza_atual, severidade, mitigacao = 50 } = formData;
    
//     let newPrioridade = 0;
//     let newInerente = 0;
//     let newResidual = 0;

//     if (natureza_atual === NaturezaEnum.RISCO) {
//       newInerente = calculateInerente(probabilidade, impacto);
//       newResidual = calculateResidual(newInerente, mitigacao);
//       newPrioridade = newResidual;
//     } else if (natureza_atual === NaturezaEnum.PROBLEMA) {
//       newPrioridade = calculatePrioridadeProblema(urgencia, severidade as SeveridadeEnum);
//       newInerente = 0;
//       newResidual = 0;
//     }

//     setCalculatedFields({ inerente: newInerente, residual: newResidual, prioridade: newPrioridade });
//     setFormData((prev) => ({ ...prev, prioridade: newPrioridade }));
//   }, [formData.probabilidade, formData.impacto, formData.urgencia, formData.natureza_atual, formData.severidade, formData.mitigacao]);

//   // Handler: Mudança em campos
//   const handleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//       const { name, value, type } = e.target;
//       let parsedValue: any = value;

//       if (type === "number" || type === "range") {
//         parsedValue = parseFloat(value);
//         if (isNaN(parsedValue)) parsedValue = 0;
//       }

//       setFormData((prev) => {
//         const newFormData = { ...prev, [name]: parsedValue };

//         if (name === "natureza_atual") {
//           if (parsedValue === NaturezaEnum.RISCO) {
//             newFormData.status_operacional = StatusRiscoEnum.IDENTIFICADO;
//           } else if (parsedValue === NaturezaEnum.PROBLEMA) {
//             newFormData.status_operacional = StatusProblemaEnum.IDENTIFICADO;
//           }
//         }

//         return newFormData;
//       });

//       setErrors((prev) => ({ ...prev, [name]: "" }));
//     },
//     []
//   );

//   // Handler: Salvar
//   const handleSave = useCallback(
//     async () => {
//       try {
//         setIsSaving(true);

//       // ✅ VALIDAÇÕES
//       if (!formData.titulo?.trim()) {
//         throw new Error("Título é obrigatório");
//       }
//       if (!formData.descricao?.trim()) {
//         throw new Error("Descrição é obrigatória");
//       }


//       // ✅ TRANSFORMAR: Mapear dados do formulário para o contrato da API
//       const payloadParaBackend = {
//         tipo_inicial: formData.tipo_inicial || NaturezaEnum.RISCO,
//         natureza_atual: formData.natureza_atual || NaturezaEnum.RISCO,
//         titulo: formData.titulo,
//         descricao: formData.descricao,
//         acao_corretiva: formData.acao_corretiva || "",
//         agente_solucao: formData.agente_solucao || formData.responsavel || "",
//         data_alvo_solucao: formData.data_alvo_solucao || formData.data_prazo || "",
//         coordenador_agente: formData.coordenador_agente || "",
//         status_operacional: formData.status_operacional || StatusRiscoEnum.IDENTIFICADO,
//         probabilidade: formData.probabilidade ?? 0,
//         impacto_potencial: formData.impacto ?? 0,
//         efetividade_controle: formData.efetividade_controle ?? 0,
//         nivel_risco_inerente: calculatedFields.inerente ?? 0,
//         nivel_risco_residual: calculatedFields.residual ?? 0,
//         origem: formData.origem || "Criação manual",
//         // ✅ CORRIGIDO: Type guard completo para tags
//         tags: Array.isArray(formData.tags)
//           ? formData.tags
//           : typeof formData.tags === "string"
//             ? (formData.tags as string).split(",").map((t: string) => t.trim())
//             : [],
//         observacoes: formData.observacoes || "",
//       };

//       console.log("📤 Payload transformado:", payloadParaBackend);

//       // ✅ ENVIAR
//       await onSave(payloadParaBackend);
//       onClose();
//     } catch (error) {
//       console.error("❌ Falha ao salvar:", error);
//       // Aqui você pode mostrar um toast/alert para o usuário
//     } finally {
//       setIsSaving(false);
//     }
//   },
//   [formData, calculatedFields, onSave, onClose]
// );

//   // Handler: Fechar
//   const handleClose = useCallback(() => {
//     setFormData(initialFormData);
//     setErrors({});
//     setCalculatedFields({ inerente: 0, residual: 0, prioridade: 0 });
//     onClose();
//   }, [onClose]);

//   if (!isOpen) {
//     return null;
//   }

//   const { showRiscoFields, showProblemaFields } = getVisibilityRules(formData.natureza_atual || "");
//   const isSubmitting = isSaving || loading;

//   return (
//     <>
//       {/* Overlay */}
//       <div
//         className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
//         onClick={handleClose}
//         style={{ pointerEvents: 'auto' }}
//       />

//       {/* Drawer */}
//       <div className="fixed right-0 top-0 h-full w-[500px] max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ease-in-out">
//         {/* Header */}
//         <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
//           <h2 className="text-xl font-bold text-gray-900">
//             {item ? "Editar" : "Novo"} Risco/Problema
//           </h2>
//           <button
//             onClick={handleClose}
//             className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
//             aria-label="Fechar drawer"
//           >
//             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
type RiskProblemDrawerFormData = Omit<Partial<RiskProblemItem>, "tags"> & {
  responsavel?: string;
  data_prazo?: string;
  mitigacao?: number;
  tags?: string | string[];
};

const initialFormData: RiskProblemDrawerFormData = {
  titulo: "",
  descricao: "",
  tipo_inicial: NaturezaEnum.RISCO,
  natureza_atual: NaturezaEnum.RISCO,
  status_operacional: StatusRiscoEnum.IDENTIFICADO,
  severidade: SeveridadeEnum.BAIXA,
  probabilidade: 50,
  impacto: 50,
  urgencia: 50,
  prioridade: 0,
  acao_corretiva: "",
  responsavel: "",
  data_prazo: "",
  mitigacao: 50,
};

const RiskProblemDrawer: React.FC<RiskProblemDrawerProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<RiskProblemDrawerFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [calculatedFields, setCalculatedFields] = useState({
    inerente: 0,
    residual: 0,
    prioridade: 0,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setFormData({
        ...initialFormData,
        ...item,
        impacto: item.impacto_potencial ?? item.impacto ?? 50,
        responsavel: item.agente_solucao || "",
        data_prazo: item.data_alvo_solucao || "",
        mitigacao: item.efetividade_controle ?? 50,
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
    setCalculatedFields({
      inerente: 0,
      residual: 0,
      prioridade: 0,
    });
  }, [isOpen, item]);

  useEffect(() => {
    const {
      probabilidade = 0,
      impacto = 0,
      urgencia = 0,
      natureza_atual,
      severidade,
      mitigacao = 50,
    } = formData;

    let newInerente = 0;
    let newResidual = 0;
    let newPrioridade = 0;

    if (natureza_atual === NaturezaEnum.RISCO) {
      newInerente = calculateInerente(probabilidade, impacto);
      newResidual = calculateResidual(newInerente, mitigacao);
      newPrioridade = newResidual;
    } else if (natureza_atual === NaturezaEnum.PROBLEMA) {
      newPrioridade = calculatePrioridadeProblema(
        urgencia,
        (severidade || SeveridadeEnum.BAIXA) as SeveridadeEnum
      );
    }

    setCalculatedFields({
      inerente: newInerente,
      residual: newResidual,
      prioridade: newPrioridade,
    });

    setFormData((prev) =>
      prev.prioridade === newPrioridade
        ? prev
        : { ...prev, prioridade: newPrioridade }
    );
  }, [
    formData.probabilidade,
    formData.impacto,
    formData.urgencia,
    formData.natureza_atual,
    formData.severidade,
    formData.mitigacao,
  ]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;

      let parsedValue: string | number = value;

      if (
        e.target instanceof HTMLInputElement &&
        (e.target.type === "number" || e.target.type === "range")
      ) {
        const numericValue = Number(value);
        parsedValue = Number.isNaN(numericValue) ? 0 : numericValue;
      }

      setFormData((prev) => {
        const next: RiskProblemDrawerFormData = {
          ...prev,
          [name]: parsedValue,
        };

        if (name === "natureza_atual") {
          if (parsedValue === NaturezaEnum.RISCO) {
            next.status_operacional = StatusRiscoEnum.IDENTIFICADO;
          } else if (parsedValue === NaturezaEnum.PROBLEMA) {
            next.status_operacional = StatusProblemaEnum.IDENTIFICADO;
          }

          if (!item?.id) {
            next.tipo_inicial = parsedValue as NaturezaEnum;
          }
        }

        return next;
      });

      setErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    [item?.id]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const normalizedTags = Array.isArray(formData.tags)
        ? formData.tags
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : typeof formData.tags === "string"
          ? formData.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter((tag: string) => tag.length > 0)
          : [];

      const dataParaValidacao = {
        ...formData,
        agente_solucao: formData.agente_solucao || formData.responsavel || "",
        data_alvo_solucao: formData.data_alvo_solucao || formData.data_prazo || "",
      };

      const validationResult = validateRiskProblem(
        dataParaValidacao as Partial<RiskProblemItem>
      );

      const validationErrors = normalizeValidationErrors(validationResult);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});

      const payloadParaBackend: RiskProblemCreateRequest | Partial<RiskProblemItem> = {
        tipo_inicial:
          formData.tipo_inicial ||
          formData.natureza_atual ||
          NaturezaEnum.RISCO,
        natureza_atual: formData.natureza_atual || NaturezaEnum.RISCO,
        titulo: formData.titulo?.trim() || "",
        descricao: formData.descricao?.trim() || "",
        acao_corretiva: formData.acao_corretiva?.trim() || "",
        agente_solucao:
          formData.agente_solucao?.trim() || formData.responsavel?.trim() || "",
        data_alvo_solucao:
          formData.data_alvo_solucao || formData.data_prazo || "",
        coordenador_agente: formData.coordenador_agente?.trim() || "",
        status_operacional:
          formData.status_operacional ||
          (formData.natureza_atual === NaturezaEnum.PROBLEMA
            ? StatusProblemaEnum.IDENTIFICADO
            : StatusRiscoEnum.IDENTIFICADO),
        severidade: formData.severidade || SeveridadeEnum.BAIXA,
        probabilidade: formData.probabilidade ?? 0,
        impacto_potencial: formData.impacto_potencial ?? formData.impacto ?? 0,
        efetividade_controle:
          formData.efetividade_controle ?? formData.mitigacao ?? 50,
        nivel_risco_inerente: calculatedFields.inerente,
        nivel_risco_residual: calculatedFields.residual,
        urgencia: formData.urgencia ?? 0,
        prioridade: calculatedFields.prioridade,
        origem: formData.origem?.trim() || "Criação manual",
        tags: normalizedTags.length > 0 ? normalizedTags.join(", ") : "",
        observacoes: formData.observacoes?.trim() || "",
      };

      console.log("Payload transformado:", payloadParaBackend);

      await onSave(payloadParaBackend);
      // Não fechar aqui.
      // O componente pai decide fechar o drawer após sucesso.
    } catch (error) {
      console.error("Falha ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, calculatedFields, onSave]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await handleSave();
    },
    [handleSave]
  );

  const handleClose = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setCalculatedFields({
      inerente: 0,
      residual: 0,
      prioridade: 0,
    });
    onClose();
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  const { showRiscoFields, showProblemaFields } = getVisibilityRules(
    formData.natureza_atual || ""
  );

  const isSubmitting = isSaving || loading;

return (
  <>
    <div
      className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
      onClick={handleClose}
      style={{ pointerEvents: "auto" }}
    />

    <div className="fixed right-0 top-0 h-full w-[500px] max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ease-in-out">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-xl font-bold text-gray-900">
          {item ? "Editar" : "Novo"} Risco/Problema
        </h2>

        <button
          type="button"
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          aria-label="Fechar drawer"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* <form onSubmit={handleSave} className="p-6 space-y-6"> */}
          {/* Bloco 1: Identificação */}
          <DrawerSection title="1. Identificação">
            <div className="space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Falha no servidor de autenticação"
                  required
                />
                {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
              </div>

              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva o risco ou problema em detalhes..."
                  required
                />
                {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="natureza_atual" className="block text-sm font-medium text-gray-700 mb-1">
                    Natureza *
                  </label>
                  <select
                    id="natureza_atual"
                    name="natureza_atual"
                    value={formData.natureza_atual || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value={NaturezaEnum.RISCO}>Risco</option>
                    <option value={NaturezaEnum.PROBLEMA}>Problema</option>
                  </select>
                  {errors.natureza_atual && <p className="mt-1 text-sm text-red-600">{errors.natureza_atual}</p>}
                </div>

                <div>
                  <label htmlFor="status_operacional" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status_operacional"
                    name="status_operacional"
                    value={formData.status_operacional || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {formData.natureza_atual === NaturezaEnum.RISCO ? (
                      <>
                        <option value={StatusRiscoEnum.IDENTIFICADO}>Identificado</option>
                        <option value={StatusRiscoEnum.EM_TRATAMENTO}>Em Tratamento</option>
                        <option value={StatusRiscoEnum.MITIGADO}>Mitigado</option>
                        <option value={StatusRiscoEnum.ENCERRADO}>Encerrado</option>
                      </>
                    ) : (
                      <>
                        <option value={StatusProblemaEnum.IDENTIFICADO}>Identificado</option>
                        <option value={StatusProblemaEnum.EM_RESOLUCAO}>Em Resolução</option>
                        <option value={StatusProblemaEnum.RESOLVIDO}>Resolvido</option>
                        <option value={StatusProblemaEnum.ENCERRADO}>Encerrado</option>
                      </>
                    )}
                  </select>
                  {errors.status_operacional && <p className="mt-1 text-sm text-red-600">{errors.status_operacional}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="severidade" className="block text-sm font-medium text-gray-700 mb-1">
                  Severidade *
                </label>
                <select
                  id="severidade"
                  name="severidade"
                  value={formData.severidade || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value={SeveridadeEnum.BAIXA}>Baixa</option>
                  <option value={SeveridadeEnum.MEDIA}>Média</option>
                  <option value={SeveridadeEnum.ALTA}>Alta</option>
                  <option value={SeveridadeEnum.CRITICA}>Crítica</option>
                </select>
                {errors.severidade && <p className="mt-1 text-sm text-red-600">{errors.severidade}</p>}
              </div>
            </div>
          </DrawerSection>

          {/* Bloco 2: Avaliação - Adaptado ao seu Badge com type="severidade" */}
          <DrawerSection title="2. Avaliação">
            {showRiscoFields && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="probabilidade" className="block text-sm font-medium text-gray-700 mb-1">
                    Probabilidade (%)
                  </label>
                  <input
                    type="range"
                    id="probabilidade"
                    name="probabilidade"
                    min="0"
                    max="100"
                    value={formData.probabilidade || 0}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{formData.probabilidade || 0}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="impacto" className="block text-sm font-medium text-gray-700 mb-1">
                    Impacto (%)
                  </label>
                  <input
                    type="range"
                    id="impacto"
                    name="impacto"
                    min="0"
                    max="100"
                    value={formData.impacto || 0}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{formData.impacto || 0}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="mitigacao" className="block text-sm font-medium text-gray-700 mb-1">
                    Mitigação Estimada (% de redução)
                  </label>
                  <input
                    type="range"
                    id="mitigacao"
                    name="mitigacao"
                    min="0"
                    max="100"
                    value={formData.mitigacao || 50}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{formData.mitigacao || 50}%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Badges usando seu type="severidade" e value mapeado */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-md">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-1">Risco Inerente</p>
                    <Badge type="severidade" value={getLevelForBadge(calculatedFields.inerente).badgeValue} />
                    <span className="block text-xs text-gray-600 mt-1">
                      {calculatedFields.inerente}% - {getLevelForBadge(calculatedFields.inerente).level}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-1">Risco Residual</p>
                    <Badge type="severidade" value={getLevelForBadge(calculatedFields.residual).badgeValue} />
                    <span className="block text-xs text-gray-600 mt-1">
                      {calculatedFields.residual}% - {getLevelForBadge(calculatedFields.residual).level}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-1">Prioridade</p>
                    <Badge type="severidade" value={getLevelForBadge(calculatedFields.prioridade).badgeValue} />
                    <span className="block text-xs text-gray-600 mt-1">
                      {calculatedFields.prioridade}% - {getLevelForBadge(calculatedFields.prioridade).level}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {showProblemaFields && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="urgencia" className="block text-sm font-medium text-gray-700 mb-1">
                    Urgência (%)
                  </label>
                  <input
                    type="range"
                    id="urgencia"
                    name="urgencia"
                    min="0"
                    max="100"
                    value={formData.urgencia || 0}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>{formData.urgencia || 0}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-md text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Prioridade do Problema</p>
                  <Badge type="severidade" value={getLevelForBadge(calculatedFields.prioridade).badgeValue} />
                  <span className="block text-xs text-blue-700 mt-1">
                    {calculatedFields.prioridade}% - {getLevelForBadge(calculatedFields.prioridade).level}
                  </span>
                  <p className="text-xs text-blue-700 mt-2">Baseado em urgência e severidade</p>
                </div>
              </div>
            )}
          </DrawerSection>

          {/* Bloco 3: Plano de Ação */}
          <DrawerSection title="3. Plano de Ação">
            <div className="space-y-4">
              <div>
                <label htmlFor="acao_corretiva" className="block text-sm font-medium text-gray-700 mb-1">
                  Ação Corretiva *
                </label>
                <textarea
                  id="acao_corretiva"
                  name="acao_corretiva"
                  value={formData.acao_corretiva || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva as ações a serem tomadas para mitigar ou resolver..."
                  required
                />
                {errors.acao_corretiva && <p className="mt-1 text-sm text-red-600">{errors.acao_corretiva}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável *
                  </label>
                  <input
                    type="text"
                    id="responsavel"
                    name="responsavel"
                    value={formData.responsavel || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome ou e-mail do responsável"
                    required
                  />
                  {errors.responsavel && <p className="mt-1 text-sm text-red-600">{errors.responsavel}</p>}
                </div>

                <div>
                  <label htmlFor="data_prazo" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Prazo *
                  </label>
                  <input
                    type="date"
                    id="data_prazo"
                    name="data_prazo"
                    value={formData.data_prazo || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  {errors.data_prazo && <p className="mt-1 text-sm text-red-600">{errors.data_prazo}</p>}
                </div>
              </div>
            </div>
          </DrawerSection>

          {/* Botões */}
          <div className="flex justify-end gap-3 mt-6 pb-4 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RiskProblemDrawer;