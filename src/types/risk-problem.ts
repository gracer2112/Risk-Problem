// src/types/risk-problem.ts

export enum NaturezaEnum {
  RISCO = "risco",
  PROBLEMA = "problema",
}

export enum StatusRiscoEnum {
  IDENTIFICADO = "identificado",
  EM_TRATAMENTO = "em_tratamento",
  MITIGADO = "mitigado",
  ENCERRADO = "encerrado",
}

export enum StatusProblemaEnum {
  IDENTIFICADO = "identificado",
  EM_RESOLUCAO = "em_resolucao",
  RESOLVIDO = "resolvido",
  ENCERRADO = "encerrado",
}

export enum SeveridadeEnum {
  BAIXA = "baixa",
  MEDIA = "media",
  ALTA = "alta",
  CRITICA = "critica",
}

export interface RiskProblemItem {
  // id: string;
  // projeto_id?: string;
  // tipo_inicial: NaturezaEnum;
  // natureza_atual: NaturezaEnum;
  // titulo: string;
  // descricao: string;
  // origem?: string;
  // status_operacional: StatusRiscoEnum | StatusProblemaEnum;
  // severidade: SeveridadeEnum;
  
  // // Campos de Risco
  // probabilidade?: number;
  // impacto_potencial?: number;
  // impacto?: number;  // ← ADICIONE (para compatibilidade com Drawer)
  // efetividade_controle?: number;
  // nivel_risco_inerente?: number;
  // nivel_risco_residual?: number;
  
  // // Campos de Problema
  // urgencia?: number;
  // impacto_atual?: number;
  // prioridade?: number;
  
  // // Campos de Ação
  // acao_corretiva?: string;
  // agente_solucao?: string;
  // responsavel?: string; 
  // data_alvo_solucao?: string;
  // data_prazo?: string;  
  // mitigacao?: number;
  // coordenador_agente?: string;
  
  // // Campos de Status e Auditoria
  // data_status?: string;
  // atraso_dias?: number;
  // criado_em?: string;
  // criado_por?: string;
  // atualizado_em?: string;
  // atualizado_por?: string;
  // convertido_em_problema_em?: string;
  
  // // Campos Adicionais
  // tags?: string[];
  // observacoes?: string;
  // data_criacao?: string;
  // data_atualizacao?: string;
  // historico?: Array<{ data: string; acao: string; usuario: string }>;
  id: string;
  projeto_id?: number;
  tipo_inicial: NaturezaEnum;
  natureza_atual: NaturezaEnum;
  titulo: string;
  descricao: string;
  origem?: string;
  probabilidade?: number;
  impacto?: number;
  impacto_potencial?: number;
  efetividade_controle?: number;
  nivel_risco_inerente?: number;
  nivel_risco_residual?: number;
  urgencia?: number;
  impacto_atual?: number;
  prioridade?: number;
  severidade?: SeveridadeEnum;
  acao_corretiva?: string;
  agente_solucao?: string;
  data_alvo_solucao?: string;
  coordenador_agente?: string;
  status_operacional?: StatusRiscoEnum | StatusProblemaEnum;
  data_status?: string;
  criado_em?: string;
  criado_por?: string;
  atualizado_em?: string;
  atualizado_por?: string;
  convertido_em_problema_em?: string | null;
  encerrado_em?: string | null;
  tags?: string | string[];
  observacoes?: string;
  responsavel?: string;
  data_prazo?: string;
  mitigacao?: number;
}

export interface RiskProblemFormData {
  tipo_inicial: NaturezaEnum;
  natureza_atual: NaturezaEnum;
  titulo: string;
  descricao: string;
  status_operacional: StatusRiscoEnum | StatusProblemaEnum;
  severidade: SeveridadeEnum;
  probabilidade?: number;
  impacto?: number;
  urgencia?: number;
  acao_corretiva?: string;
  responsavel?: string;
  data_prazo?: string;
}

export interface RiskProblemListResponse {
  items: RiskProblemItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RiskProblemCreateRequest {
  tipo_inicial: NaturezaEnum;
  natureza_atual: NaturezaEnum;
  titulo: string;
  descricao: string;
  acao_corretiva?: string;
  agente_solucao?: string;
  data_alvo_solucao?: string;
  coordenador_agente?: string;
  status_operacional: StatusRiscoEnum | StatusProblemaEnum;
  severidade?: SeveridadeEnum;
  probabilidade?: number;
  impacto_potencial?: number;
  efetividade_controle?: number;
  nivel_risco_inerente?: number;
  nivel_risco_residual?: number;
  urgencia?: number;
  prioridade?: number;
  origem?: string;
  tags?: string;
  observacoes?: string;
}