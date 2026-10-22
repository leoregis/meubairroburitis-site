-- Casos da normalização do telefone no banco (public.acompanhamento_normalizar_telefone).
-- Os mesmos de telefone-casos.json / telefone.test.ts. Só leitura: roda no branch
-- ou em produção. Gerado de telefone-casos.json (não editar à mão os casos).
select count(*) filter (where ok) || '/' || count(*) || ' casos OK' as resultado,
  coalesce(string_agg(case when not ok then descricao || ': ' || entrada || ' -> ' || coalesce(obtido, 'null') end, '; '), '') as falhas
from (
  select entrada, descricao, public.acompanhamento_normalizar_telefone(entrada) as obtido,
    public.acompanhamento_normalizar_telefone(entrada) is not distinct from esperado as ok
  from (values
  ('(31) 99999-8888', '5531999998888', 'celular com máscara'),
  ('31999998888', '5531999998888', 'formato da Central (DDD + número)'),
  ('31 9999-8888', '5531999998888', 'celular antigo sem o 9'),
  ('3199998888', '5531999998888', 'celular sem o 9, só dígitos'),
  ('+55 31 99999-8888', '5531999998888', 'com +55'),
  ('5531999998888', '5531999998888', 'já normalizado'),
  ('553199998888', '5531999998888', '55 e sem o 9'),
  ('031999998888', '5531999998888', '0 + DDD'),
  ('03199998888', '5531999998888', '0 + DDD, sem o 9'),
  ('0 21 31 99999-8888', '5531999998888', '0 + operadora + DDD'),
  ('0213199998888', '5531999998888', '0 + operadora + DDD, sem o 9'),
  ('0055 31 99999 8888', '5531999998888', '00 + 55 (internacional)'),
  ('005531 9999 8888', '5531999998888', '00 + 55, sem o 9'),
  ('11 98765-4321', '5511987654321', 'outro DDD'),
  ('1187654321', '5511987654321', 'outro DDD, sem o 9'),
  ('55 99999-8888', '5555999998888', 'DDD 55 sem o código do país'),
  ('5599998888', '5555999998888', 'DDD 55, sem o 9'),
  ('+55 55 99999-8888', '5555999998888', 'DDD 55 com o código do país'),
  ('(31) 3333-4444', '553133334444', 'fixo (não ganha o 9)'),
  ('+55 (31) 3333-4444', '553133334444', 'fixo com +55'),
  ('9999-8888', null, 'sem DDD'),
  ('99999-8888', null, 'sem DDD, com o 9'),
  ('01331999998888', '5531999998888', '0 + operadora 13 + DDD'),
  ('', null, 'vazio'),
  ('abc', null, 'sem dígitos'),
  ('3199999888877', null, 'dígitos demais')
  ) as t (entrada, esperado, descricao)
) x;
