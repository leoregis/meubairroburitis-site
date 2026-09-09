-- Novo produto da loja, com preço promocional (ver migration anterior,
-- 20260909181000, que criou a coluna preco_original_centavos).
insert into public.produtos (
  slug, nome, descricao_curta, descricao,
  preco_centavos, preco_original_centavos, imagem_url, ordem
) values (
  'conteudo-publicitario-especial',
  'Conteúdo Publicitário Especial',
  'Matéria personalizada da sua empresa no nosso site e no feed do Instagram, identificada como conteúdo publicitário.',
$desc$Sua empresa tem uma história, novidade, serviço ou informação que merece ser conhecida pelos moradores do Buritis e Estoril?

Neste formato, o Meu Bairro Buritis produz um conteúdo personalizado a partir das informações fornecidas pela sua empresa e publica o material em formato de matéria no nosso site e no feed do Instagram.

O conteúdo é desenvolvido pela nossa equipe, com linguagem informativa e apresentação editorial, mas é identificado claramente como CONTEÚDO PUBLICITÁRIO.

Inclui:
- Produção do texto pelo Meu Bairro Buritis
- Publicação da matéria no site
- Publicação no feed do Instagram
- Identificação como conteúdo publicitário
- Link para o site, empresa ou canal indicado pelo anunciante
- Permanência da matéria no site

O anunciante fornece as informações, imagens e materiais necessários para a produção. A publicação final é editada e aprovada pelo Meu Bairro Buritis.$desc$,
  39900,
  54900,
  '/produtos/conteudo-publicitario-especial.jpeg',
  6
);
