-- Uso do acompanhamento e do "Meus pedidos", por semana (segunda a domingo,
-- horário de Brasília). Só leitura: rodar no SQL do projeto do site
-- (peusailkyxqbhgdgmqyk) ou pelo CLI (supabase db query --linked -f ...).
--
-- Base da decisão sobre os avisos automáticos pelo WhatsApp (fatia 5), por
-- volta de 19/11/2026 (decisão do Leo, 24/10/2026).
--
-- Colunas:
--   links_criados          links de acompanhamento criados na semana (pedido pago no
--                          site ou acompanhamento ligado na Central; troca de link conta
--                          como link novo)
--   links_ja_abertos       desses, quantos já foram abertos pelo menos uma vez (até hoje)
--   pedidos_com_abertura   pedidos diferentes cujo link foi aberto na semana
--   aberturas              total de aberturas de link na semana
--   codigos_enviados       códigos do "Meus pedidos" gerados e mandados pelo WhatsApp
--   logins                 entradas no /meus-pedidos (código certo = sessão nova)
--   numeros_diferentes     números diferentes que entraram na semana
--
-- Guarda dos dados (limita até onde a consulta enxerga):
--   * links: sem limite;
--   * aberturas (acompanhamento_acessos): 180 dias;
--   * códigos e pedidos de código (meus_pedidos_envios): 30 dias;
--   * sessões (meus_pedidos_sessoes): até 30 dias depois de vencer ou de "Sair"
--     (na prática, uns 60 dias para trás).
with semanas as (
  select generate_series(
    date_trunc('week', timestamp '2026-10-19'),
    date_trunc('week', now() at time zone 'America/Sao_Paulo'),
    interval '1 week')::date as semana
),
links as (
  select date_trunc('week', criado_em at time zone 'America/Sao_Paulo')::date as semana,
    count(*) as links_criados,
    count(*) filter (where acessos > 0) as links_ja_abertos
  from public.acompanhamento_links group by 1
),
aberturas as (
  select date_trunc('week', em at time zone 'America/Sao_Paulo')::date as semana,
    count(distinct chave) as pedidos_com_abertura,
    count(*) as aberturas
  from public.acompanhamento_acessos group by 1
),
codigos as (
  select date_trunc('week', em at time zone 'America/Sao_Paulo')::date as semana,
    count(*) filter (where gerou_codigo) as codigos_enviados
  from public.meus_pedidos_envios group by 1
),
logins as (
  select date_trunc('week', criada_em at time zone 'America/Sao_Paulo')::date as semana,
    count(*) as logins,
    count(distinct telefone_hash) as numeros_diferentes
  from public.meus_pedidos_sessoes group by 1
)
select to_char(s.semana, 'DD/MM/YYYY') as semana_de,
  coalesce(l.links_criados, 0) as links_criados,
  coalesce(l.links_ja_abertos, 0) as links_ja_abertos,
  coalesce(a.pedidos_com_abertura, 0) as pedidos_com_abertura,
  coalesce(a.aberturas, 0) as aberturas,
  coalesce(c.codigos_enviados, 0) as codigos_enviados,
  coalesce(g.logins, 0) as logins,
  coalesce(g.numeros_diferentes, 0) as numeros_diferentes
from semanas s
left join links l using (semana)
left join aberturas a using (semana)
left join codigos c using (semana)
left join logins g using (semana)
order by s.semana;
