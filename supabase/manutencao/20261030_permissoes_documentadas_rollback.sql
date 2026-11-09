-- Volta da migration 20261030200000_permissoes_documentadas.
--
-- Não há o que desfazer: a migration só repete na produção as permissões que
-- já existiam (conferido em 30/10/2026: as ACLs dos 69 objetos do schema
-- public ficaram idênticas antes e depois, num teste com ROLLBACK e de novo
-- na aplicação). Rodar REVOKEs aqui deixaria a produção DIFERENTE do que era.
--
-- Se um dia a migration for alterada e for preciso voltar ao estado de
-- 30/10/2026, a fotografia abaixo é a referência (formato aclitem:
-- papel=privilégios/concedente; '=' sem papel é PUBLIC). Para comparar com o
-- estado atual, rode a consulta do fim do arquivo (só leitura).
--
-- Fotografia das ACLs em 30/10/2026 (69 objetos):
--   sequence links_bio_cliques_id_seq: anon=rwU/postgres,authenticated=rwU/postgres,postgres=rwU/postgres,service_role=rwU/postgres
--   table links_bio_cliques: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   sequence deploy_fila_log_id_seq: anon=rwU/postgres,authenticated=rwU/postgres,postgres=rwU/postgres,service_role=rwU/postgres
--   table deploy_fila: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table deploy_fila_log: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   sequence deploy_fila_itens_id_seq: anon=rwU/postgres,authenticated=rwU/postgres,postgres=rwU/postgres,service_role=rwU/postgres
--   table deploy_fila_itens: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table produtos_bkp_20261023: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table noticias_bkp_20261029: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table produtos: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table admins: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table rate_limit_pagamento: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table acompanhamento_pedidos: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   sequence acompanhamento_acessos_id_seq: anon=rwU/postgres,authenticated=rwU/postgres,postgres=rwU/postgres,service_role=rwU/postgres
--   table pedidos: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table acompanhamento_links: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table acompanhamento_acessos: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table noticias: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table noticias_categorias: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table noticias_subcategorias_guia: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   sequence pedidos_central_fila_id_seq: anon=rwU/postgres,authenticated=rwU/postgres,postgres=rwU/postgres,service_role=rwU/postgres
--   table pedidos_central_fila: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table noticias_relacionadas: anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   sequence meus_pedidos_codigos_id_seq: anon=rwU/postgres,authenticated=rwU/postgres,postgres=rwU/postgres,service_role=rwU/postgres
--   sequence meus_pedidos_envios_id_seq: anon=rwU/postgres,authenticated=rwU/postgres,postgres=rwU/postgres,service_role=rwU/postgres
--   table meus_pedidos_codigos: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table meus_pedidos_envios: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   table meus_pedidos_sessoes: postgres=arwdDxtm/postgres,service_role=arwdDxtm/postgres
--   function deploy_fila_falhou(p_erro text): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_confere_segredo(p_segredo text): postgres=X/postgres,service_role=X/postgres
--   function checar_bloqueio_pagamento(p_chave text): postgres=X/postgres,service_role=X/postgres
--   function registrar_tentativa_pagamento(p_chave text, p_sucesso boolean): postgres=X/postgres,service_role=X/postgres
--   function is_admin(): authenticated=X/postgres,postgres=X/postgres,service_role=X/postgres
--   function acompanhamento_hash_telefone(p_telefone text): postgres=X/postgres,service_role=X/postgres
--   function contar_cliques_links_bio(p_desde timestamp with time zone): =X/postgres,anon=X/postgres,authenticated=X/postgres,postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_pronto(): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_processar(): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_confirmar(p_reivindicado_em timestamp with time zone): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_reivindicar(): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_solicitar(p_motivo text): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_item_noticia(): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_item_relacionada(): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_item_estrutura(): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_item_produto(): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_itens_para_disparo(p_ate timestamp with time zone): postgres=X/postgres,service_role=X/postgres
--   function deploy_fila_receber_guia(p_segredo text, p_itens jsonb): anon=X/postgres,authenticated=X/postgres,postgres=X/postgres,service_role=X/postgres
--   function expirar_pedidos_pendentes(): postgres=X/postgres,service_role=X/postgres
--   function acompanhamento_normalizar_telefone(p_telefone text): postgres=X/postgres,service_role=X/postgres
--   function acompanhamento_conferir(p jsonb): postgres=X/postgres,service_role=X/postgres
--   function acompanhamento_limpar_acessos(): postgres=X/postgres,service_role=X/postgres
--   function acompanhamento_receber(p_segredo text, p_pedidos jsonb): anon=X/postgres,postgres=X/postgres,service_role=X/postgres
--   function acompanhamento_por_link(p_token text): anon=X/postgres,authenticated=X/postgres,postgres=X/postgres,service_role=X/postgres
--   function novo_token_acompanhamento(): postgres=X/postgres,service_role=X/postgres
--   function pedido_pago_token(): postgres=X/postgres,service_role=X/postgres
--   function acompanhamento_do_pedido_site(p pedidos): postgres=X/postgres,service_role=X/postgres
--   function pedido_para_central(): postgres=X/postgres,service_role=X/postgres
--   function pedidos_central_evento(f pedidos_central_fila): postgres=X/postgres,service_role=X/postgres
--   function pedidos_central_falhou(p_ids bigint[], p_erro text): postgres=X/postgres,service_role=X/postgres
--   function pedidos_central_processar(): postgres=X/postgres,service_role=X/postgres
--   function pedido_telefone_hash(): postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_hmac(p_valor text): postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_tem_pedidos(p_hash text): postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_sessao(p_sessao text): postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_limpar(): postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_codigo_nao_enviado(p_id bigint): postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_sair(p_sessao text): anon=X/postgres,authenticated=X/postgres,postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_preparar_codigo(p_telefone text, p_origem text): postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_validar_codigo(p_telefone text, p_codigo text): anon=X/postgres,authenticated=X/postgres,postgres=X/postgres,service_role=X/postgres
--   function meus_pedidos_listar(p_sessao text): anon=X/postgres,authenticated=X/postgres,postgres=X/postgres,service_role=X/postgres

select tipo, nome, coalesce(acl, '(nula)') acl from (
  select case c.relkind when 'S' then 'sequence' else 'table' end tipo, c.relname::text nome,
         (select string_agg(x::text, ',' order by x::text) from unnest(c.relacl) x) acl
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r','v','m','S','p','f')
  union all
  select 'function', format('%s(%s)', p.proname, pg_get_function_identity_arguments(p.oid)),
         (select string_agg(x::text, ',' order by x::text) from unnest(p.proacl) x)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public') o
order by tipo, nome;
