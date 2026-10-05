// Dados institucionais do veículo -- fonte única pro Expediente, pras
// páginas de política editorial/correções/publicidade e pro rodapé.
//
// E-mails: o único endereço que o projeto já usava publicamente é o
// contato@ (ícone de e-mail do rodapé). Não existe hoje um e-mail
// editorial ou comercial separado, então os dois apontam pro mesmo
// endereço. Se um dia forem criados endereços próprios, basta trocar aqui.
export const DADOS_INSTITUCIONAIS = {
  nomeVeiculo: 'Meu Bairro Buritis',
  responsavel: 'Leonardo Régis Orrico',
  razaoSocial: 'Leonardo Regis Orrico — Meu Bairro Buritis',
  cnpj: '42.495.449/0001-18',
  sede: 'Belo Horizonte — MG',
  dominio: 'meubairroburitis.com.br',
  atuacao: 'Buritis e Estoril — Belo Horizonte/MG',
  anoCriacao: 2012,
  emailContato: 'contato@meubairroburitis.com.br',
  emailEditorial: 'contato@meubairroburitis.com.br',
  emailComercial: 'contato@meubairroburitis.com.br',
}

// Organization (Schema.org) do veículo -- fonte única pro JSON-LD da home e
// pro publisher/author das notícias, com o mesmo @id em todo o site.
// Logo: logo_mbb_completa.png (465x240, PNG transparente, legível em fundo
// branco, como o Google recomenda). O logo_mbb_rodape.png que a home usava
// tem letreiro branco e some em fundo branco.
export const URL_SITE = 'https://meubairroburitis.com.br'

export const ORGANIZACAO_SCHEMA = {
  '@type': 'Organization',
  '@id': `${URL_SITE}/#organization`,
  name: DADOS_INSTITUCIONAIS.nomeVeiculo,
  url: `${URL_SITE}/`,
  logo: `${URL_SITE}/logo/logo_mbb_completa.png`,
}
