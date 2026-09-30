<script setup lang="ts">
import type { Noticia } from '~/composables/useNoticias'

// Página de referência sobre o bairro (reformulação de 30/set/2026). Todo
// bloco dinâmico reaproveita composables/views já existentes (nenhuma
// consulta nova) e é resolvido no build estático -- o HTML sai completo,
// sem carregamento no navegador e sem salto de layout.
//
// Fontes verificadas (ver seção "Fontes e referências" no template):
// - história: dissertação de Leticia M. R. Epaminondas (UFMG, 2006);
// - população/domicílios/área/limite: base "População e Domicílio por Bairro
//   2022" da PBH (dataset ativo, recorte de bairro popular, NUM_BAIRRO 623);
// - parque: página oficial da Fundação de Parques Municipais e Zoobotânica.

const URL_PAGINA = 'https://meubairroburitis.com.br/o-bairro-buritis'
const TITULO_SEO = 'Bairro Buritis, BH: história, localização e guia completo'
const DESCRICAO_SEO =
  'Conheça o bairro Buritis, em Belo Horizonte: história, localização, comércio, lazer, mobilidade e informações úteis para moradores e visitantes.'

const FONTES = {
  dadosPbh: 'https://dados.pbh.gov.br/dataset/populacao-e-domicilio-por-bairro-2021',
  parque: 'https://prefeitura.pbh.gov.br/fundacao-de-parques-e-zoobotanica/informacoes/parques/parque-aggeo-pio-sobrinho',
  parqueHorarios: 'https://prefeitura.pbh.gov.br/fundacao-de-parques-e-zoobotanica/informacoes/precos-e-horarios',
  dissertacao: 'https://repositorio.ufmg.br/items/9576fece-0939-416e-8a6e-e2890cc294a0',
  bhtrans: 'https://prefeitura.pbh.gov.br/bhtrans',
  onibus: 'https://prefeitura.pbh.gov.br/bhtrans/informacoes/transportes/onibus',
  saude: 'https://prefeitura.pbh.gov.br/saude',
  educacao: 'https://prefeitura.pbh.gov.br/educacao',
  regionalOeste: 'https://prefeitura.pbh.gov.br/oeste',
}

// dados conferidos no CSV oficial (20250801_populacao_domicilio_bairro_2022.csv)
// em 30/09/2026 -- ver relatório da reformulação.
const DADOS_BAIRRO = {
  populacao: '42.030',
  domicilios: '16.966',
  areaKm2: '3,82',
  densidade: '11.015',
}

useSeoMeta({
  title: TITULO_SEO,
  description: DESCRICAO_SEO,
  ogTitle: TITULO_SEO,
  ogDescription: DESCRICAO_SEO,
  ogUrl: URL_PAGINA,
  ogType: 'website',
  // og:image fica de fora até a confirmação de origem/licença da foto
  // (pendência registrada no relatório) -- sem imagem, o cartão é resumido.
  twitterCard: 'summary',
}, { tagPriority: 15 })

useJsonLd({
  '@type': 'WebPage',
  name: TITULO_SEO,
  url: URL_PAGINA,
  inLanguage: 'pt-BR',
  description: DESCRICAO_SEO,
  isPartOf: { '@type': 'WebSite', name: 'Meu Bairro Buritis', url: 'https://meubairroburitis.com.br/' },
})

useJsonLd({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://meubairroburitis.com.br/' },
    { '@type': 'ListItem', position: 2, name: 'O Bairro Buritis', item: URL_PAGINA },
  ],
})

const sumario = [
  { id: 'onde-fica', titulo: 'Onde fica o bairro Buritis?' },
  { id: 'como-surgiu', titulo: 'Como surgiu o bairro Buritis?' },
  { id: 'buritis-hoje', titulo: 'Como é o Buritis atualmente?' },
  { id: 'populacao', titulo: 'População e características urbanas' },
  { id: 'comercio-servicos', titulo: 'Comércio, serviços e conveniência' },
  { id: 'gastronomia', titulo: 'Bares, restaurantes e gastronomia' },
  { id: 'parque-aggeo-pio-sobrinho', titulo: 'Parque Aggeo Pio Sobrinho e áreas verdes' },
  { id: 'mobilidade', titulo: 'Mobilidade e acessos' },
  { id: 'educacao-saude-servicos', titulo: 'Educação, saúde e serviços públicos' },
  { id: 'gente-do-buritis', titulo: 'Gente do Buritis' },
  { id: 'noticias', titulo: 'Notícias e atualizações' },
  { id: 'sobre', titulo: 'Sobre o Meu Bairro Buritis' },
  { id: 'fontes', titulo: 'Fontes e referências' },
]

// ---- blocos dinâmicos (mesmos composables de /empresas, /prestadores, /noticias e /conteudo)
const { data: empresasDestaque } = await useEmpresasDestaqueHome()
const { data: prestadoresDestaque } = await usePrestadoresDestaqueHome()
const { data: categoriasEmpresa } = await useCategoriasEmpresa()
const { data: categoriasPrestador } = await useCategoriasPrestador()
// { resumo: true }: só as colunas dos cartões, sem o conteúdo das matérias
// (sem isso o payload da página passava de 330KB e pesava na hidratação)
const resumo = { resumo: true }
const { data: guiasAlimentacao } = await useGuias('alimentacao', resumo)
const { data: guiasLazer } = await useGuias('lazer', resumo)
const { data: guiasParques } = await useGuias('parques-espacos-publicos', resumo)
const { data: guiasEducacao } = await useGuias('educacao', resumo)
const { data: noticiasMobilidade } = await useNoticiasPorCategoria('mobilidade-urbanismo', resumo)
const { data: noticiasComunidade } = await useNoticiasPorCategoria('pessoas-comunidade', resumo)
const { data: ultimasNoticias } = await useNoticiasPagina(1, resumo)

const empresas = computed(() => (empresasDestaque.value ?? []).slice(0, 3))
const prestadores = computed(() => (prestadoresDestaque.value ?? []).slice(0, 3))

// guia de bares fica na subcategoria "lazer" junto com guias que não são de
// gastronomia -- entra só o de bares.
const guiasGastronomia = computed(() => [
  ...(guiasAlimentacao.value ?? []),
  ...(guiasLazer.value ?? []).filter((g) => g.slug.startsWith('bares-')),
])

const mobilidade = computed(() => (noticiasMobilidade.value ?? []).slice(0, 3))
const comunidade = computed(() => (noticiasComunidade.value ?? []).slice(0, 6))

// notícias recentes sem repetir cartões já exibidos nas seções acima
const recentes = computed(() => {
  const jaExibidas = new Set([...mobilidade.value, ...comunidade.value].map((n: Noticia) => n.id))
  return (ultimasNoticias.value?.itens ?? []).filter((n) => !jaExibidas.has(n.id)).slice(0, 6)
})

const classeLinkBotao =
  'inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700'
</script>

<template>
  <article class="mx-auto max-w-3xl px-4 py-10 sm:py-14">
    <header>
      <nav aria-label="Breadcrumb" class="text-sm text-stone-500">
        <ol class="flex flex-wrap items-center gap-1">
          <li><NuxtLink to="/" class="hover:text-orange-700 hover:underline">Início</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li><span aria-current="page" class="text-stone-700">O Bairro Buritis</span></li>
        </ol>
      </nav>

      <p class="mt-6 text-sm font-semibold uppercase tracking-wide text-orange-700">O Bairro Buritis</p>
      <h1 class="mt-2 text-balance font-serif text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
        Conheça o Buritis: história, vida e informações sobre o bairro
      </h1>

      <div class="mt-5 space-y-4 text-[17px] leading-relaxed text-stone-700">
        <p>
          Localizado na Região Oeste de Belo Horizonte, o Buritis é um dos bairros mais conhecidos da capital
          mineira. Sua paisagem reúne edifícios residenciais, áreas comerciais, importantes vias de circulação e
          espaços de preservação ambiental. Ao longo das últimas décadas, a região passou por uma intensa
          transformação urbana e se consolidou como um importante polo residencial e de serviços da cidade.
        </p>
        <p>
          O Buritis também é feito pelas pessoas que vivem, trabalham e empreendem na região. São moradores que
          acompanham sua história há décadas, famílias que chegaram durante a expansão imobiliária, comerciantes,
          profissionais liberais e iniciativas comunitárias que ajudam a construir a identidade local.
        </p>
        <p>
          Nesta página, o Meu Bairro Buritis reúne informações sobre a localização, a história, as
          características urbanas, o comércio, o lazer e a vida cotidiana do bairro, além de conteúdos e serviços
          úteis para quem vive ou visita a região.
        </p>
      </div>

      <NuxtPicture
        src="/hero/capa-buritis.jpg"
        alt="Edifícios residenciais do bairro Buritis ao entardecer, vistos do alto, com uma faixa de mata em primeiro plano"
        format="avif,webp"
        :width="1200"
        :height="800"
        sizes="100vw sm:720px"
        loading="eager"
        fetchpriority="high"
        :img-attrs="{ class: 'mt-8 aspect-[3/2] w-full rounded-2xl object-cover' }"
      />
    </header>

    <nav aria-labelledby="sumario-titulo" class="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
      <p id="sumario-titulo" class="font-serif text-lg font-bold text-stone-900">Nesta página</p>
      <ol class="mt-3 grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-2">
        <li v-for="(item, i) in sumario" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="inline-flex min-h-[44px] items-center gap-2 text-stone-800 underline decoration-stone-300 underline-offset-4 hover:text-orange-700 hover:decoration-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-700"
          >
            <span class="w-5 shrink-0 text-right text-sm font-semibold text-orange-800">{{ i + 1 }}.</span>
            {{ item.titulo }}
          </a>
        </li>
      </ol>
    </nav>

    <div class="texto-bairro prose prose-stone mt-12 max-w-none sm:prose-lg prose-headings:font-serif prose-headings:text-stone-900 prose-a:text-orange-800 prose-a:underline-offset-2 hover:prose-a:text-orange-700">
      <!-- 1 -->
      <section id="onde-fica" aria-labelledby="onde-fica-titulo">
        <h2 id="onde-fica-titulo">Onde fica o bairro Buritis?</h2>
        <p>
          O Buritis está situado na Região Oeste de Belo Horizonte, em uma área de relevo marcado por vales e
          elevações e próxima a importantes corredores viários da capital.
        </p>
        <p>
          A Avenida Professor Mário Werneck é uma de suas principais referências. Ela concentra estabelecimentos
          comerciais, serviços, restaurantes e acessos a diferentes partes do bairro.
        </p>
        <p>
          A região também mantém relações urbanas e funcionais com bairros vizinhos, entre eles o Estoril, o
          Palmeiras e o Estrela D'Alva, além de outras áreas da Região Oeste.
        </p>
        <p>
          É importante distinguir o bairro oficialmente delimitado pelo município da região que os moradores
          reconhecem cotidianamente como Buritis. Em conversas, anúncios imobiliários e referências comerciais, o
          nome Buritis pode ser utilizado de maneira mais ampla, incluindo áreas próximas e partes de bairros
          vizinhos. A própria Prefeitura trabalha com mais de um recorte: o bairro aprovado nos processos de
          parcelamento e o chamado bairro popular, que segue os nomes e limites reconhecidos pela população.
        </p>
        <p>
          Por isso, limites territoriais e números oficiais devem ser interpretados conforme o mapa e a divisão
          utilizados pela Prefeitura de Belo Horizonte. O mapa abaixo mostra o limite do Buritis na base de
          bairros populares da PBH, a mesma usada para os dados de população desta página.
        </p>
        <BairroMapaLimites :fonte-url="FONTES.dadosPbh" />
      </section>

      <!-- 2 -->
      <section id="como-surgiu" aria-labelledby="como-surgiu-titulo">
        <h2 id="como-surgiu-titulo">Como surgiu o bairro Buritis?</h2>
        <p>
          A história do Buritis está ligada à expansão urbana de Belo Horizonte e ao parcelamento de antigas
          propriedades rurais situadas na Região Oeste da capital.
        </p>
        <p>
          Antes de se consolidar como bairro residencial, a área fazia parte de uma paisagem de grandes
          propriedades, terrenos pouco ocupados e áreas de vegetação. A expansão da cidade, a abertura de vias e as
          mudanças na legislação urbanística contribuíram para transformar essa paisagem ao longo do século XX.
        </p>

        <h3>A Fazenda Tebaídas e Aggêo Pio Sobrinho</h3>
        <p>
          A narrativa histórica tradicional do bairro associa parte importante de sua origem à Fazenda Tebaídas,
          também citada como Fazenda dos Tebaidas, e à trajetória de Aggêo Pio Sobrinho, seu proprietário.
        </p>
        <p>
          Esse vínculo aparece em estudo acadêmico sobre o bairro. Segundo a dissertação de mestrado de Leticia
          Maria Resende Epaminondas, defendida em 2006 na Universidade Federal de Minas Gerais, a área hoje ocupada
          pelo Buritis integrava a zona rural do município até meados da década de 1970, como parte da Fazenda
          Tebaídas, de propriedade de Aggeo Pio Sobrinho. Por volta de 1973, a fazenda começou a ser desmembrada e
          alguns terrenos foram vendidos. O mesmo trabalho registra processos de regularização em nome de Aggeo
          Pio Sobrinho e informa que a empresa responsável por etapas posteriores do loteamento tinha como
          principais sócios seus herdeiros.
        </p>
        <p>
          A história da propriedade, de seus antigos limites e das etapas de loteamento ajuda a compreender como
          uma região anteriormente pouco ocupada passou a integrar a expansão de Belo Horizonte. Ela merece ser
          aprofundada a partir de documentos históricos, registros de propriedade, materiais do Arquivo Público e
          outros estudos sobre a urbanização da Região Oeste.
        </p>

        <h3>De uma região de ocupação dispersa a um bairro residencial</h3>
        <p>
          A implantação do loteamento e a ocupação do Buritis ocorreram em etapas. Segundo a dissertação da UFMG,
          o pedido de parcelamento do solo do bairro foi protocolado na Prefeitura de Belo Horizonte em novembro
          de 1976. A primeira etapa do loteamento foi implantada entre 1979 e 1985. As obras da segunda etapa
          foram autorizadas em 1979 e iniciadas em 1985, e um novo projeto de parcelamento para essa etapa foi
          aprovado em 27 de novembro de 1992.
        </p>
        <p>
          A abertura de ruas, a instalação de infraestrutura e a construção das primeiras residências precederam
          a intensa verticalização que se tornaria característica da região. De acordo com o mesmo estudo, a
          ocupação do bairro acompanhou as regras de zoneamento vigentes em cada período, com predomínio de
          edifícios residenciais multifamiliares verticais.
        </p>
        <p>
          A transformação do bairro deve ser entendida no contexto do crescimento de Belo Horizonte, das mudanças
          nas regras de parcelamento e uso do solo e da expansão do mercado imobiliário para áreas da Região Oeste.
          Estudos acadêmicos sobre o Buritis analisam justamente a relação entre legislação urbanística, produção
          do espaço e transformação da paisagem urbana.
        </p>
        <p>
          A dissertação
          <a :href="FONTES.dissertacao" target="_blank" rel="noopener noreferrer">
            "A legislação urbanística e a produção do espaço: estudos do bairro Buritis em Belo Horizonte"</a>,
          disponível no repositório da Universidade Federal de Minas Gerais, é uma referência para quem deseja
          aprofundar esse processo.
        </p>

        <h3>Por que o bairro se chama Buritis?</h3>
        <p>
          A origem do nome Buritis é tradicionalmente associada à palmeira buriti e à literatura brasileira,
          especialmente à obra de João Guimarães Rosa.
        </p>
        <p>
          A narrativa local atribui a escolha do nome à influência literária e à valorização de referências da
          vegetação brasileira. Entretanto, a autoria da denominação e o contexto administrativo em que ela foi
          adotada ainda precisam ser confirmados por documentação histórica específica.
        </p>
        <p>
          O nome do bairro é hoje uma referência consolidada da identidade da Região Oeste de Belo Horizonte.
        </p>
      </section>

      <!-- 3 -->
      <section id="buritis-hoje" aria-labelledby="buritis-hoje-titulo">
        <h2 id="buritis-hoje-titulo">Como é o Buritis atualmente?</h2>
        <p>
          O Buritis apresenta uma ocupação predominantemente urbana, com edifícios residenciais, condomínios,
          comércio de rua, centros comerciais, serviços e equipamentos de lazer.
        </p>
        <p>
          A verticalização modificou significativamente a paisagem do bairro. Em diferentes áreas, prédios
          residenciais convivem com estabelecimentos comerciais e vias de circulação intensa.
        </p>
        <p>
          Essa combinação faz com que o bairro tenha uma dinâmica própria durante a semana e nos fins de semana,
          movimentada tanto pelos moradores quanto por pessoas que trabalham, estudam ou utilizam os serviços da
          região.
        </p>
        <p>
          A estrutura comercial e de serviços se desenvolve especialmente nos principais corredores viários, com
          destaque para a Avenida Professor Mário Werneck e suas vias de acesso.
        </p>
        <p>
          O crescimento urbano também trouxe desafios relacionados à mobilidade, à infraestrutura, à preservação
          ambiental e à convivência entre áreas residenciais e atividades comerciais.
        </p>
      </section>

      <!-- 4 -->
      <section id="populacao" aria-labelledby="populacao-titulo">
        <h2 id="populacao-titulo">População e características urbanas</h2>
        <p>
          O Buritis integra uma das áreas de expansão urbana de Belo Horizonte e apresenta uma ocupação
          residencial expressiva.
        </p>
        <p>
          Os dados oficiais de população e domicílios devem ser consultados conforme a divisão territorial da
          Prefeitura de Belo Horizonte e os resultados do Censo Demográfico 2022, do IBGE. A Prefeitura
          disponibiliza essas informações por bairro no
          <a :href="FONTES.dadosPbh" target="_blank" rel="noopener noreferrer">Portal de Dados Abertos de Belo Horizonte</a>,
          a partir dos dados do Censo 2022 por setor censitário.
        </p>

        <div class="not-prose my-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <p class="font-serif text-lg font-bold text-stone-900">O Buritis em números</p>
          <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <div>
              <dt class="text-sm text-stone-600">População</dt>
              <dd class="font-serif text-2xl font-bold text-orange-800">{{ DADOS_BAIRRO.populacao }}</dd>
            </div>
            <div>
              <dt class="text-sm text-stone-600">Domicílios</dt>
              <dd class="font-serif text-2xl font-bold text-orange-800">{{ DADOS_BAIRRO.domicilios }}</dd>
            </div>
            <div>
              <dt class="text-sm text-stone-600">Área</dt>
              <dd class="font-serif text-2xl font-bold text-orange-800">{{ DADOS_BAIRRO.areaKm2 }} km²</dd>
            </div>
            <div>
              <dt class="text-sm text-stone-600">Densidade</dt>
              <dd class="font-serif text-2xl font-bold text-orange-800">{{ DADOS_BAIRRO.densidade }} <span class="text-base font-semibold">hab./km²</span></dd>
            </div>
          </dl>
          <div class="mt-5 space-y-2 border-t border-stone-100 pt-4 text-sm leading-relaxed text-stone-600">
            <p>
              <strong class="text-stone-800">Referência:</strong> Censo Demográfico 2022 (IBGE), com dados por setor
              censitário distribuídos pela Prefeitura de Belo Horizonte entre os bairros do município.
            </p>
            <p>
              <strong class="text-stone-800">Recorte territorial:</strong> bairro popular Buritis (código 623) na
              base de bairros da Prefeitura, o mesmo limite do mapa desta página.
            </p>
            <p>
              <strong class="text-stone-800">Domicílios:</strong> a fonte informa a quantidade de domicílios por
              bairro, sem especificar se são domicílios ocupados ou o total de domicílios.
            </p>
            <p>
              <strong class="text-stone-800">Fonte:</strong>
              <a :href="FONTES.dadosPbh" target="_blank" rel="noopener noreferrer" class="font-medium text-orange-800 underline hover:no-underline">
                Prefeitura de Belo Horizonte, População e Domicílio por Bairro 2022</a>.
              Dados consultados em 30 de setembro de 2026.
            </p>
          </div>
        </div>

        <p>
          Nessa mesma base, que aplica a mesma metodologia aos 493 bairros de Belo Horizonte, o Buritis é o bairro
          com a maior população da cidade.
        </p>
        <p>
          A comparação de dados populacionais ao longo do tempo exige atenção aos limites utilizados em cada
          levantamento. Mudanças na delimitação de bairros ou diferenças entre a divisão administrativa e a área
          popularmente conhecida como Buritis podem produzir resultados distintos. Levantamentos que usam outro
          recorte territorial, como os agregados por bairro divulgados pelo próprio IBGE, podem apresentar números
          diferentes dos desta base.
        </p>
      </section>

      <!-- 5 -->
      <section id="comercio-servicos" aria-labelledby="comercio-servicos-titulo">
        <h2 id="comercio-servicos-titulo">Comércio, serviços e conveniência</h2>
        <p>
          Uma das características do Buritis é a concentração de estabelecimentos comerciais e prestadores de
          serviços que atendem às necessidades cotidianas dos moradores.
        </p>
        <p>
          O bairro conta com supermercados, farmácias, academias, clínicas, restaurantes, cafeterias, salões de
          beleza, escolas e diferentes serviços profissionais.
        </p>
        <p>
          A Avenida Professor Mário Werneck e as vias próximas concentram parte importante dessa atividade,
          enquanto centros comerciais e estabelecimentos distribuídos pelo bairro complementam a oferta.
        </p>
        <p>
          Essa estrutura permite que os moradores encontrem diferentes serviços nas proximidades de suas
          residências, embora a localização e a disponibilidade de cada estabelecimento devam ser verificadas
          diretamente.
        </p>

        <h3>Encontre empresas e profissionais do bairro</h3>
        <p>
          O Guia Buritis, do Meu Bairro Buritis, reúne empresas e prestadores de serviços que atendem o Buritis e o
          Estoril. A plataforma permite consultar categorias de estabelecimentos e encontrar opções para diferentes
          necessidades, como serviços residenciais, alimentação, saúde, beleza, educação e comércio.
        </p>
        <p>Acesse o Guia Buritis para pesquisar empresas e profissionais da região.</p>

        <div class="not-prose my-6 flex flex-wrap gap-3">
          <a href="/guia/" :class="[classeLinkBotao, 'bg-orange-700 text-white hover:bg-orange-800']">Explorar o Guia Buritis</a>
          <NuxtLink to="/empresas" :class="[classeLinkBotao, 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50']">Ver todas as empresas</NuxtLink>
          <NuxtLink to="/prestadores" :class="[classeLinkBotao, 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50']">Ver todos os prestadores</NuxtLink>
        </div>

        <div v-if="empresas.length" class="not-prose mt-8">
          <p class="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-800">Algumas empresas do Guia</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            <EmpresasCard v-for="empresa in empresas" :key="empresa.unidade_id" :empresa="empresa" ocultar-avaliacoes />
          </div>
        </div>

        <div v-if="prestadores.length" class="not-prose mt-8">
          <p class="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-800">Alguns prestadores de serviço</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            <PrestadoresCard v-for="prestador in prestadores" :key="prestador.id" :prestador="prestador" />
          </div>
        </div>

        <div v-if="categoriasEmpresa?.length || categoriasPrestador?.length" class="not-prose mt-8 space-y-5">
          <div v-if="categoriasEmpresa?.length">
            <p class="mb-2 text-sm font-semibold text-stone-800">Empresas por categoria</p>
            <ul class="flex flex-wrap gap-2">
              <li v-for="c in categoriasEmpresa" :key="c.id">
                <NuxtLink
                  :to="`/empresas/categoria/${c.slug}`"
                  class="inline-flex min-h-[44px] items-center rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                >
                  {{ c.nome }}
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div v-if="categoriasPrestador?.length">
            <p class="mb-2 text-sm font-semibold text-stone-800">Prestadores por categoria</p>
            <ul class="flex flex-wrap gap-2">
              <li v-for="c in categoriasPrestador" :key="c.id">
                <NuxtLink
                  :to="`/prestadores/categoria/${c.slug}`"
                  class="inline-flex min-h-[44px] items-center rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
                >
                  {{ c.nome }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 6 -->
      <section id="gastronomia" aria-labelledby="gastronomia-titulo">
        <h2 id="gastronomia-titulo">Bares, restaurantes e gastronomia</h2>
        <p>
          O Buritis e seu entorno contam com uma variedade de bares, restaurantes, cafeterias e estabelecimentos
          de alimentação.
        </p>
        <p>
          A oferta inclui diferentes estilos de cozinha, ambientes e faixas de preço, distribuídos principalmente
          pelos corredores comerciais do bairro e pelas áreas próximas.
        </p>
        <p>
          Além de atender aos moradores, esses estabelecimentos fazem parte da vida social e comercial da região,
          contribuindo para o movimento das ruas e dos centros comerciais.
        </p>
        <p>
          Para descobrir opções, consulte os guias de estabelecimentos do Meu Bairro Buritis e a categoria
          <NuxtLink to="/empresas/categoria/alimentacao">Alimentação do Guia Buritis</NuxtLink>.
        </p>
        <ul v-if="guiasGastronomia.length">
          <li v-for="g in guiasGastronomia" :key="g.id">
            <NuxtLink :to="`/noticias/${g.slug}`">{{ g.titulo }}</NuxtLink>
          </li>
        </ul>
        <p>
          O Meu Bairro Buritis também publica reportagens sobre estabelecimentos tradicionais, histórias de
          comerciantes e iniciativas que fazem parte da memória local, reunidas na seção
          <NuxtLink to="/noticias/categoria/cultura-historia-memoria">Cultura, História e Memória</NuxtLink>.
        </p>
      </section>

      <!-- 7 -->
      <section id="parque-aggeo-pio-sobrinho" aria-labelledby="parque-titulo">
        <h2 id="parque-titulo">Parque Aggeo Pio Sobrinho e áreas verdes</h2>
        <p>O Parque Aggeo Pio Sobrinho é uma das principais referências ambientais e de lazer do Buritis.</p>
        <p>
          Segundo a Prefeitura de Belo Horizonte, o parque ocupa uma área de aproximadamente 612 mil metros
          quadrados e integra parte do maciço da Serra do Curral. Sua área teve origem no processo de
          parcelamento do solo que deu origem ao bairro.
        </p>
        <p>
          O parque foi criado em 1990, pela Lei Municipal nº 5.755, e implantado em 1996, por meio do Programa
          Parque Preservado.
        </p>
        <p>
          A área abriga vegetação composta em sua maior parte por espécies da Mata Atlântica e do Cerrado, além de
          três nascentes que formam o córrego Ponte Queimada, afluente do córrego Cercadinho, e ambientes que
          favorecem a presença de diferentes espécies da fauna.
        </p>
        <p>
          Entre as estruturas de lazer disponíveis estão brinquedos, quadra poliesportiva, local para caminhada,
          trilha ecológica e áreas de convivência.
        </p>
        <p>
          O parque é administrado pela Fundação de Parques Municipais e Zoobotânica de Belo Horizonte, e a entrada
          é gratuita. Antes da visita, consulte os canais oficiais para conferir o horário de funcionamento, as
          regras de uso e eventuais alterações.
        </p>
        <div class="not-prose my-6 flex flex-wrap gap-3">
          <a :href="FONTES.parque" target="_blank" rel="noopener noreferrer" :class="[classeLinkBotao, 'bg-orange-700 text-white hover:bg-orange-800']">
            Consultar informações oficiais do Parque Aggeo Pio Sobrinho
          </a>
          <a :href="FONTES.parqueHorarios" target="_blank" rel="noopener noreferrer" :class="[classeLinkBotao, 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50']">
            Horários dos parques municipais
          </a>
        </div>
        <p>
          O parque representa uma importante área de preservação ambiental em meio à ocupação urbana e contribui
          para a qualidade ambiental e as opções de lazer da região.
        </p>
        <p v-if="guiasParques?.length">
          Outras áreas verdes e espaços públicos da região estão reunidos no
          <NuxtLink :to="`/noticias/${guiasParques[0].slug}`">{{ guiasParques[0].titulo }}</NuxtLink>.
        </p>
      </section>

      <!-- 8 -->
      <section id="mobilidade" aria-labelledby="mobilidade-titulo">
        <h2 id="mobilidade-titulo">Mobilidade e acessos</h2>
        <p>
          A localização do Buritis permite conexões com diferentes partes de Belo Horizonte por meio de
          corredores viários da Região Oeste.
        </p>
        <p>
          A Avenida Professor Mário Werneck é uma das principais vias de circulação interna e de acesso ao
          bairro. Outras conexões regionais permitem deslocamentos em direção à Avenida Raja Gabaglia, ao Anel
          Rodoviário e a diferentes regiões da capital.
        </p>
        <p>
          A mobilidade cotidiana envolve deslocamentos de automóvel, transporte coletivo, caminhadas e outros
          meios de transporte. As condições de circulação variam conforme o horário, o trecho e a demanda viária.
        </p>
        <p>
          O crescimento residencial e comercial ampliou a importância da mobilidade e da infraestrutura para o
          funcionamento do bairro.
        </p>
        <p>
          Para informações atualizadas sobre linhas de ônibus, itinerários, horários, obras e alterações no
          trânsito, consulte os canais oficiais da
          <a :href="FONTES.bhtrans" target="_blank" rel="noopener noreferrer">BHTrans</a>, incluindo a página de
          <a :href="FONTES.onibus" target="_blank" rel="noopener noreferrer">informações sobre ônibus</a>, e da
          <a :href="FONTES.regionalOeste" target="_blank" rel="noopener noreferrer">Regional Oeste da Prefeitura</a>.
        </p>
        <p>
          O Meu Bairro Buritis também acompanha notícias relacionadas a trânsito, obras, transporte público e
          intervenções que afetam o cotidiano dos moradores, na seção
          <NuxtLink to="/noticias/categoria/mobilidade-urbanismo">Mobilidade e Urbanismo</NuxtLink>.
        </p>
        <div v-if="mobilidade.length" class="not-prose mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          <NoticiasNoticiaCard v-for="n in mobilidade" :key="n.id" :noticia="n" />
        </div>
      </section>

      <!-- 9 -->
      <section id="educacao-saude-servicos" aria-labelledby="educacao-titulo">
        <h2 id="educacao-titulo">Educação, saúde e serviços públicos</h2>
        <p>
          O Buritis e as áreas próximas contam com estabelecimentos de ensino, clínicas, consultórios, serviços
          de saúde e equipamentos públicos que atendem a população da região.
        </p>
        <p>A distribuição desses serviços varia conforme o tipo de atendimento, a localização e a rede responsável.</p>
        <p>
          Para encontrar instituições de ensino, profissionais de saúde e serviços privados, consulte o Guia
          Buritis, nas categorias
          <NuxtLink to="/empresas/categoria/educacao">Educação</NuxtLink>,
          <NuxtLink to="/empresas/categoria/saude">Saúde</NuxtLink> e
          <NuxtLink to="/prestadores/categoria/saude-e-bem-estar">Saúde e Bem-estar</NuxtLink>, e verifique
          diretamente com cada estabelecimento as informações de atendimento.
          <template v-if="guiasEducacao?.length">
            Para escolas, veja também o
            <NuxtLink :to="`/noticias/${guiasEducacao[0].slug}`">{{ guiasEducacao[0].titulo }}</NuxtLink>.
          </template>
        </p>
        <p>
          Para serviços públicos, como unidades de saúde, escolas municipais e atendimento da Prefeitura, utilize
          os canais oficiais de Belo Horizonte:
          <a :href="FONTES.saude" target="_blank" rel="noopener noreferrer">Saúde</a>,
          <a :href="FONTES.educacao" target="_blank" rel="noopener noreferrer">Educação</a> e
          <a :href="FONTES.regionalOeste" target="_blank" rel="noopener noreferrer">Regional Oeste</a>.
        </p>
      </section>

      <!-- 10 -->
      <section id="gente-do-buritis" aria-labelledby="gente-titulo">
        <h2 id="gente-titulo">Gente do Buritis: histórias de quem vive o bairro</h2>
        <p>
          A história do Buritis não é feita apenas de loteamentos, avenidas e edifícios. Ela também é construída
          pelas pessoas que vivem, trabalham e participam da comunidade.
        </p>
        <p>
          Na série Gente do Buritis e em outras reportagens sobre a comunidade, o Meu Bairro Buritis apresenta
          trajetórias de moradores, profissionais, comerciantes, artistas e pessoas que contribuem para a vida
          local. Os relatos ajudam a registrar experiências pessoais, memórias e transformações que fazem parte da
          identidade da região.
        </p>
        <template v-if="comunidade.length">
          <p>Histórias de moradores e da comunidade publicadas recentemente:</p>
          <div class="not-prose mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
            <NoticiasNoticiaCard v-for="n in comunidade" :key="n.id" :noticia="n" />
          </div>
        </template>
        <p>
          Conheça outras histórias na seção
          <NuxtLink to="/noticias/categoria/pessoas-comunidade">Pessoas e Comunidade</NuxtLink>.
        </p>
      </section>

      <!-- 11 -->
      <section id="noticias" aria-labelledby="noticias-titulo">
        <h2 id="noticias-titulo">Notícias e atualizações do Buritis e Estoril</h2>
        <p>
          O Meu Bairro Buritis acompanha acontecimentos, serviços, obras, comércio, mobilidade, cultura e assuntos
          de interesse dos moradores. Nesta seção, você encontra as notícias mais recentes sobre o Buritis e o
          Estoril, com links para as reportagens completas.
        </p>
        <div v-if="recentes.length" class="not-prose mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          <NoticiasNoticiaCard v-for="n in recentes" :key="n.id" :noticia="n" />
        </div>
        <div class="not-prose mt-6">
          <NuxtLink to="/noticias" :class="[classeLinkBotao, 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50']">
            Ver todas as notícias
          </NuxtLink>
        </div>
      </section>

      <!-- 12 -->
      <section id="sobre" aria-labelledby="sobre-titulo">
        <h2 id="sobre-titulo">Sobre o Meu Bairro Buritis</h2>
        <p>
          O Meu Bairro Buritis é uma iniciativa de comunicação comunitária dedicada ao Buritis e ao Estoril, em
          Belo Horizonte.
        </p>
        <p>
          O projeto reúne notícias, histórias de moradores, informações sobre o comércio local, serviços e
          conteúdos de interesse da comunidade. Por meio do site e de seus canais digitais, busca aproximar
          moradores, comerciantes, prestadores de serviços e instituições da região.
          <NuxtLink to="/quem-somos">Conheça a história do Meu Bairro Buritis</NuxtLink>.
        </p>
        <p>
          Esta página é um guia de referência sobre o bairro e será atualizada conforme novas informações,
          documentos e conteúdos locais forem publicados.
        </p>
      </section>

      <!-- 13 -->
      <section id="fontes" aria-labelledby="fontes-titulo">
        <h2 id="fontes-titulo">Fontes e referências</h2>
        <p>
          As informações históricas, urbanísticas, demográficas e ambientais desta página foram conferidas nas
          fontes abaixo e devem ser atualizadas a partir de documentos e dados institucionais.
        </p>
        <ul>
          <li>
            Prefeitura de Belo Horizonte, Fundação de Parques Municipais e Zoobotânica.
            <a :href="FONTES.parque" target="_blank" rel="noopener noreferrer">Parque Aggeo Pio Sobrinho</a>.
          </li>
          <li>
            Prefeitura de Belo Horizonte, Portal de Dados Abertos.
            <a :href="FONTES.dadosPbh" target="_blank" rel="noopener noreferrer">População e Domicílio por Bairro 2022</a>.
            Base usada para população, domicílios, área e limite do bairro.
          </li>
          <li>
            EPAMINONDAS, Leticia Maria Resende.
            <a :href="FONTES.dissertacao" target="_blank" rel="noopener noreferrer">
              A legislação urbanística e a produção do espaço: estudos do bairro Buritis em Belo Horizonte</a>.
            Dissertação (Mestrado em Geografia), Universidade Federal de Minas Gerais, 2006.
          </li>
        </ul>
        <p>
          As informações estatísticas indicam o ano de referência e o recorte territorial. As informações sobre
          estabelecimentos, horários e serviços devem ser conferidas diretamente com as instituições responsáveis.
        </p>
      </section>
    </div>
  </article>
</template>

<style scoped>
/* âncoras do sumário não ficam escondidas sob o cabeçalho fixo (sticky) */
.texto-bairro section {
  scroll-margin-top: 5.5rem;
}
.texto-bairro section + section {
  margin-top: 3.5rem;
}
</style>
