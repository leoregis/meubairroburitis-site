// Fase 4 -- helpers de link tel:/wa.me para as páginas públicas de
// empresa/prestador.
//
// empresas.telefone/whatsapp NÃO tem constraint de formato no banco (visto
// na auditoria de segurança) -- o exemplo real observado vem sem o prefixo
// de país ("31971109678"), então normaliza igual ao app
// (app/pages/empresa/[slug].vue, função normalizarTelefone) antes de montar
// o link, replicado aqui verbatim pra manter o mesmo comportamento já
// validado em produção.
//
// prestadores.telefone TEM constraint de formato (`telefone ~
// '^55[0-9]{11}$'`) -- sempre "55" + 11 dígitos, sem normalização
// necessária.

export function normalizarTelefoneEmpresa(numero: string) {
  if (!numero) return ''

  // remove tudo que não for número
  let n = numero.replace(/\D/g, '')

  // remove 55 se existir
  if (n.startsWith('55')) {
    n = n.slice(2)
  }

  // FIXO "ADAPTADO" -- ex: 31 3 2345678 vira 31 2345678
  if (n.length === 11 && n[2] === '3') {
    const restante = n.slice(3)
    // fixo geralmente começa entre 2-5
    if (/^[2-5]/.test(restante)) {
      n = n.slice(0, 2) + restante
    }
  }

  return n
}

export function linkWhatsappEmpresa(whatsapp: string) {
  return `https://wa.me/55${normalizarTelefoneEmpresa(whatsapp)}`
}

export function linkTelefoneEmpresa(telefone: string) {
  return `tel:${normalizarTelefoneEmpresa(telefone)}`
}

export function linkWhatsappPrestador(telefone: string) {
  return `https://wa.me/${telefone.replace(/\D/g, '')}`
}

export function linkTelefonePrestador(telefone: string) {
  return `tel:+${telefone.replace(/\D/g, '')}`
}
