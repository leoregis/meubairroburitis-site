// Melhores do Ano -- atalho na home ("Últimas do bairro"). O site é estático:
// o texto é decidido NO NAVEGADOR, pela data de agora, para nunca ficar
// vencido entre um deploy e outro. Para a próxima edição, mude só as datas
// e o título aqui. Os horários levam o -03:00 de America/Sao_Paulo (sem
// horário de verão desde 2019).

export const MELHORES_DO_ANO = {
  titulo: 'Melhores do Ano 2026',
  destino: '/guia/melhores-do-ano',
  // votação dos finalistas: de inicioVotacao até fimVotacao (inclusive)
  inicioVotacao: '2026-12-01T00:00:00-03:00',
  fimVotacao: '2026-12-20T23:59:59-03:00',
  textos: {
    indicacoes: 'Indicações abertas · votação dos finalistas a partir de 1º/12',
    votacao: 'Votação aberta até 20/12',
  },
}

export type FaseMelhoresDoAno = 'indicacoes' | 'votacao' | 'encerrado'

export function faseMelhoresDoAno(agora: Date = new Date()): FaseMelhoresDoAno {
  const t = agora.getTime()
  if (t < new Date(MELHORES_DO_ANO.inicioVotacao).getTime()) return 'indicacoes'
  if (t <= new Date(MELHORES_DO_ANO.fimVotacao).getTime()) return 'votacao'
  return 'encerrado'
}
