<script setup lang="ts">
useSeoMeta({
  title: 'Quem Somos — Meu Bairro Buritis',
  description:
    'A história do Meu Bairro Buritis, criado em 2012 por Leonardo Régis Orrico para conectar moradores do Buritis e do Estoril.',
})

// background-image via CSS não passa pelo <NuxtPicture>, então usamos
// useImage() pra gerar a mesma URL otimizada (webp) manualmente.
const img = useImage()
const fundoOtimizado = img('/hero/postfixo-facebook.png', { width: 1600, format: 'webp' })

const marcos = [
  {
    ano: '2012',
    titulo: 'Nasce o Meu Bairro Buritis',
    texto:
      'Leonardo Régis Orrico cria o Meu Bairro Buritis com a proposta de conectar moradores do Buritis e do Estoril, criando um espaço para troca de informações, experiências e assuntos relacionados à vida na comunidade.',
    link: 'https://meubairroburitis.com.br/quem-somos',
  },
  {
    ano: '2016',
    titulo: 'Expansão da comunidade e participação dos moradores',
    texto:
      'O Meu Bairro Buritis já promove iniciativas voltadas à participação da comunidade, entre elas um concurso de fotografias do bairro, estimulando os próprios moradores a registrar e compartilhar diferentes olhares sobre a região.',
    link: null,
  },
  {
    ano: '2016',
    titulo: 'Entrevistas e debate sobre os assuntos do bairro',
    texto:
      'O MBB passa a abrir espaço também para entrevistas com lideranças políticas e comunitárias, incluindo Braulio Lara.',
    link: 'https://www.brauliolara.com.br/2016/?m=0',
  },
  {
    ano: '2017',
    titulo: 'Batalha das Bandas',
    texto:
      'Promoção de uma Batalha das Bandas, com etapas classificatórias e grande final presencial com shows ao vivo no Buritis.',
    link: 'https://www.daquibh.com.br/tag/cultura/page/6/',
  },
  {
    ano: '2017',
    titulo: 'Esporte e integração comunitária',
    texto: 'Torneio de handebol feminino, reunindo atletas e moradores.',
    link: null,
  },
  {
    ano: '2018',
    titulo: 'A comunidade ultrapassa 45 mil integrantes',
    texto: 'Reportagem da Revista Encontro registra mais de 45 mil integrantes no grupo.',
    link: 'https://www.revistaencontro.com.br/canal/revista/2018/03/moradores-do-buritis-apontam-os-beneficios-do-bairro.amp.html',
  },
  {
    ano: '2018',
    titulo: 'MBB ganha espaço como fonte de informação',
    texto: 'Jornal Daqui entrevista Leonardo Régis sobre obras da Av. Prof. Mário Werneck.',
    link: 'https://www.daquibh.com.br/transito-fica-caotico-no-buritis-com-obras-na-mario-werneck/',
  },
  {
    ano: '2018–2019',
    titulo: 'Comunicação comunitária e debate público',
    texto: 'Consolidação como um dos principais espaços digitais de comunicação do Buritis.',
    link: null,
  },
  {
    ano: '2019',
    titulo: 'Nasce o Buri Dogs',
    texto:
      'Mobilização de moradores dá origem ao Buri Dogs, grupo de resgate e proteção de cães abandonados.',
    link: 'https://buridogs.com.br/sobre-nos',
  },
  {
    ano: '2019',
    titulo: 'O MBB se consolida como fonte para a imprensa',
    texto: 'Conteúdo da comunidade passa a ser usado regularmente por veículos locais e nacionais.',
    link: null,
  },
  {
    ano: '2020',
    titulo: 'Caso Backer',
    texto: 'MBB ajuda a conectar moradores durante a crise da cervejaria Backer.',
    link: 'https://www.daquibh.com.br/moradores-entram-em-acao/',
  },
  {
    ano: '2020',
    titulo: 'O acervo do MBB também passa a ser utilizado pela imprensa',
    texto: 'Jornal Daqui usa fotografia do acervo do MBB.',
    link: 'https://www.daquibh.com.br/diferencas-sociais-ao-longo-da-avenida-raja-gabaglia/',
  },
  {
    ano: '2020–2021',
    titulo: 'Buri Dogs amplia sua atuação',
    texto: 'Resgates, tratamentos, campanhas, adoções, casinhas para cães de rua.',
    link: 'https://associacaobairroburitis.com.br/noticias-buritis/buri-dogs-instalam-casinhas-para-cachorros-no-bairro/',
  },
  {
    ano: '2021',
    titulo: 'Entrevistas políticas e transmissões ao vivo',
    texto: 'Entrevistas e debates, incluindo com o vereador Braulio Lara.',
    link: 'https://www.brauliolara.com.br/2021/02/?m=0',
  },
  {
    ano: '2021',
    titulo: 'Debate sobre mobilidade e circulação de veículos',
    texto: 'Transmissão ao vivo sobre trânsito e veículos pesados no Buritis.',
    link: 'https://www.brauliolara.com.br/2021/07/?m=0',
  },
  {
    ano: '2021',
    titulo: 'O Buri Dogs chega a centenas de animais atendidos',
    texto: '',
    link: null,
  },
  {
    ano: '2022',
    titulo: 'Buri Dogs recebe homenagem da Câmara Municipal',
    texto: 'Diploma de Honra ao Mérito concedido pela Câmara Municipal de BH.',
    link: 'https://www.cmbh.mg.gov.br/comunica%C3%A7%C3%A3o/v%C3%ADdeos/solenidades/titulo-de-cidadania-honor%C3%A1ria-advogada-e-professora-juliana-frederico-fontes-11-08-2017?page=24&qt-pesquisa_de_leis_mobile=1',
  },
  {
    ano: '2022 em diante',
    titulo: 'O Buri Dogs continua independente',
    texto: '',
    link: null,
  },
  {
    ano: '2023',
    titulo: 'O Meu Bairro Buritis vira objeto de pesquisa acadêmica',
    texto:
      'Pesquisadores da UFMG apresentam estudo no Intercom sobre capital social e engajamento cívico.',
    link: 'https://sistemas.intercom.org.br/pdf/link_aceite/nacional/11/0816202322440764dd7b67b158c.pdf',
  },
  {
    ano: '2024',
    titulo: 'Conteúdo do MBB continua chegando a grandes veículos',
    texto: 'Estado de Minas publica fotografia creditada ao MBB.',
    link: 'https://www.em.com.br/gerais/2024/04/6844020-acusado-de-matar-e-ocultar-corpo-de-pedreiro-em-bh-e-inocentado.html',
  },
  {
    ano: '2024–2026',
    titulo: 'Expansão para um ecossistema de comunicação hiperlocal',
    texto:
      'Ampliação para portal de notícias, Instagram, WhatsApp, Telegram, YouTube, TikTok, Guia de empresas.',
    link: 'https://meubairroburitis.com.br/quem-somos',
  },
  {
    ano: '2026',
    titulo: 'Uma comunidade com mais de 150 mil membros',
    texto: 'Mais de 150 mil pessoas no Facebook.',
    link: null,
  },
  {
    ano: '2026',
    titulo: 'Mais de mil cães ajudados pelo Buri Dogs',
    texto: 'Mais de mil cães retirados das ruas e encaminhados para adoção desde 2019.',
    link: 'https://buridogs.com.br/',
  },
].map((marco, i, todos) => ({
  ...marco,
  // marcos consecutivos do mesmo ano ficam com espaçamento reduzido entre
  // si, pra ler como "mesma leva", em vez de parecer item duplicado
  agrupadoComProximo: todos[i + 1]?.ano === marco.ano,
}))
</script>

<template>
  <article>
    <div
      class="bg-cover bg-center py-24"
      :style="{ backgroundImage: `linear-gradient(rgba(20, 20, 18, 0.75), rgba(20, 20, 18, 0.75)), url(${fundoOtimizado})` }"
    >
      <div class="mx-auto max-w-2xl px-4 text-center text-white">
        <p class="text-sm font-semibold uppercase tracking-wide text-orange-300">Quem Somos</p>
        <h1 class="mt-2 text-balance font-serif text-3xl font-bold">
          Conectando vidas, contando histórias
        </h1>
      </div>
    </div>

    <div class="mx-auto max-w-2xl px-4 py-16">

    <div class="prose prose-stone mt-8 max-w-none">
      <p>
        Tudo começou com uma ideia simples: conectar os moradores do Buritis e do Estoril em um
        espaço acolhedor, onde informação de qualidade e espírito de comunidade andassem lado a
        lado. Em 2012, muito antes das redes sociais dominarem a comunicação local, nascia o
        projeto Meu Bairro Buritis — criado por Leonardo Régis Orrico, publicitário, especialista
        em marketing digital e morador apaixonado pelo bairro.
      </p>
      <p>
        O objetivo era claro: dar voz à vizinhança, apoiar o comércio local e fortalecer os laços
        entre os moradores. O que começou como um pequeno grupo no Facebook cresceu e se
        transformou em uma verdadeira rede de apoio, informação e oportunidades. Ao longo dos anos,
        fomos palco de campanhas solidárias, promovemos eventos gratuitos, valorizamos histórias
        inspiradoras, denunciamos problemas urbanos e celebramos conquistas da nossa região.
      </p>
      <p>
        Nosso projeto é feito por quem vive o bairro todos os dias. Gente que acredita no poder da
        união e da informação local. Hoje, com mais de uma década de atuação, o Meu Bairro Buritis
        está presente no Instagram, Facebook, WhatsApp, Telegram, TikTok e YouTube — além de manter
        este portal completo, moderno e cheio de novidades para você.
      </p>
      <p>
        A mente por trás dessa jornada é Leonardo Régis Orrico. Nascido em Brasília, mas criado em
        BH, ele enfrentou desde jovem uma deficiência física progressiva que afeta sua coordenação
        motora e audição. Mesmo diante dos desafios, Leonardo nunca deixou de acreditar no impacto
        que a comunicação pode ter na vida das pessoas. Seu olhar sensível, seu perfeccionismo e sua
        dedicação diária ao projeto são os pilares que sustentam tudo isso. Em 2024, pela primeira
        vez, ele decidiu mostrar seu rosto em um vídeo para a comunidade, revelando sua história e a
        trajetória por trás do projeto. O vídeo viralizou e trouxe ainda mais reconhecimento e afeto
        por parte dos seguidores.
      </p>
      <p>
        O Meu Bairro Buritis é mais do que um site ou um perfil nas redes: é uma ponte. Um canal
        direto entre quem quer divulgar, quem quer descobrir e quem quer transformar o bairro num
        lugar ainda melhor. Se você também acredita nisso, junte-se a nós.
      </p>
      <p class="font-semibold text-stone-900">
        Juntos, somos mais fortes. Juntos, somos Meu Bairro Buritis.
      </p>
      </div>
    </div>

    <div class="border-t border-stone-200 bg-stone-50 py-16">
      <div class="mx-auto max-w-2xl px-4">
        <p class="text-sm font-semibold uppercase tracking-wide text-orange-700">Histórico</p>
        <h2 class="mt-2 text-balance font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
          Uma trajetória de mais de uma década
        </h2>

        <div class="prose prose-stone mt-6 max-w-none">
          <p>
            Ao longo de sua trajetória, o Meu Bairro Buritis também abriu espaço para o debate
            público. Foram realizadas entrevistas e transmissões ao vivo com políticos e
            lideranças locais, entre eles <strong>Braulio Lara, Fidelis Alcântara e Gabriel
            Azevedo</strong>, discutindo eleições, política e temas de interesse do Buritis e de
            Belo Horizonte.
          </p>
          <p>
            Essa atuação sempre foi pautada pela <strong>independência e pela neutralidade
            política</strong>. O Meu Bairro Buritis nunca esteve vinculado a partido político ou
            grupo político e procura oferecer espaço para diferentes posições e correntes de
            pensamento, mantendo como prioridade os interesses da comunidade e dos moradores.
          </p>
          <p>
            Da mesma forma, o Meu Bairro Buritis é um projeto <strong>independente de empresas,
            grupos econômicos ou estabelecimentos específicos do bairro</strong>. Embora mantenha
            relacionamento comercial com empresas e profissionais por meio de publicidade e
            divulgação, isso não significa vínculo, sociedade ou subordinação editorial. A
            independência do projeto permite que ele divulgue, questione ou critique assuntos de
            interesse da comunidade de acordo com os fatos e as demandas dos moradores.
          </p>
        </div>

        <ol class="mt-10">
          <li
            v-for="(marco, i) in marcos"
            :key="`${marco.ano}-${marco.titulo}`"
            class="relative flex gap-4 sm:gap-6"
            :class="marco.agrupadoComProximo ? 'pb-5' : 'pb-9'"
          >
            <div class="flex flex-col items-center">
              <span
                class="mt-1.5 h-3 w-3 flex-none rounded-full bg-orange-500 ring-4 ring-orange-100"
              />
              <span v-if="i < marcos.length - 1" class="w-px flex-1 bg-stone-300" />
            </div>

            <div class="flex-1 pb-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-orange-700">
                {{ marco.ano }}
              </p>
              <h3 class="mt-1 text-balance font-serif text-base font-bold text-stone-900 sm:text-lg">
                {{ marco.titulo }}
              </h3>
              <p v-if="marco.texto" class="mt-1.5 text-sm leading-relaxed text-stone-600">
                {{ marco.texto }}
              </p>
              <a
                v-if="marco.link"
                :href="marco.link"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-orange-700 hover:underline"
              >
                Ver fonte
                <Icon name="lucide:arrow-up-right" class="h-3.5 w-3.5" />
              </a>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </article>
</template>
