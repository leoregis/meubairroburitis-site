// Pedido como o cliente vê (acompanhamento_por_link e meus_pedidos_listar).
export interface Publicacao { canal: string | null, url: string, publicado_em: string }
export interface Entrega {
  tipo: string
  quantidade: number
  situacao: string
  previsto_para: string | null
  com_horario: boolean
  material_recebido_em: string | null
  gravacao_para: string | null
  gravacao_com_horario: boolean
  publicado_em: string | null
  publicacoes: Publicacao[]
  aprovacao_link: string | null
}
export interface Item { produto: string, quantidade: number, a_agendar: number, entregas: Entrega[] }
export interface PedidoAcompanhamento {
  encontrado: boolean
  disponivel?: boolean
  expirado?: boolean
  numero?: number
  data?: string
  empresa?: string
  cancelado?: boolean
  em_aberto?: boolean
  itens?: Item[]
  atualizado_em?: string
  // pedido feito no site: pago, ainda sem a venda registrada na Central
  aguardando_registro?: boolean
  // pedido feito no site: pagamento estornado/cancelado no Mercado Pago
  pagamento_estornado?: boolean
}

// Item da lista de /meus-pedidos (meus_pedidos_listar)
export interface PedidoDaLista extends PedidoAcompanhamento {
  ref: string
  // pedido pago no site antes do acompanhamento online (sem entregas)
  antigo: boolean
}
