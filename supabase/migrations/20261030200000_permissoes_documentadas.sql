-- Permissões (GRANTs) do schema public documentadas (pedido do Leo em 30/10/2026).
--
-- Por quê: na produção as permissões de tabelas, sequências e funções para
-- anon, authenticated e service_role existem, mas boa parte não está em
-- nenhuma migration. Um branch de dev criado só das migrations nascia sem
-- elas (a chave anon não lia nem `noticias`, e o gatilho de pedido pago
-- falhava por falta de EXECUTE em novo_token_acompanhamento). Achado no
-- teste do item 1 da fase 5 do redesign.
--
-- O que faz: declara o estado EXATO da produção em 30/10/2026, objeto por
-- objeto e papel por papel (anon, authenticated, service_role e PUBLIC):
-- GRANT do que o papel tem e REVOKE do que não tem. Na produção nada muda
-- (todas as entradas já existem com o mesmo concedente, postgres, e revogar
-- o que não existe não faz nada) -- conferido comparando as ACLs de todos os
-- 69 objetos antes e depois, numa transação desfeita com ROLLBACK, e de novo
-- depois de aplicar. Num branch novo, deixa as permissões iguais às da
-- produção.
--
-- Idempotente: pode rodar quantas vezes for. Objeto que não existir (por
-- exemplo, uma tabela de backup apagada no futuro) é pulado.
--
-- Não mexe em: dono dos objetos, RLS e policies, permissões padrão
-- (ALTER DEFAULT PRIVILEGES), outros schemas, nem objetos fora destas listas.
-- Objeto novo continua precisando dos próprios GRANTs na migration que o cria
-- (regra "função nova nasce fechada", CLAUDE.md).
--
-- Volta: manutencao/20261030_permissoes_documentadas_rollback.sql (não há o
-- que desfazer na produção; o arquivo traz a fotografia das ACLs para conferir).

do $$
declare
  -- tabelas: todas as permissões de tabela do Postgres 17
  privs_tabela constant text[] := array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'];
  privs_sequencia constant text[] := array['USAGE','SELECT','UPDATE'];
  papeis constant text[] := array['anon','authenticated','service_role','PUBLIC'];

  -- tabelas lidas/escritas pelo site via API (RLS por linha): anon,
  -- authenticated e service_role com todas as permissões (padrão do Supabase)
  tabelas_api constant text[] := array[
    'admins','links_bio_cliques','noticias','noticias_categorias','noticias_relacionadas',
    'noticias_subcategorias_guia','pedidos','produtos','rate_limit_pagamento'];
  -- tabelas internas: só service_role
  tabelas_internas constant text[] := array[
    'acompanhamento_acessos','acompanhamento_links','acompanhamento_pedidos','deploy_fila',
    'deploy_fila_itens','deploy_fila_log','meus_pedidos_codigos','meus_pedidos_envios',
    'meus_pedidos_sessoes','noticias_bkp_20261029','pedidos_central_fila','produtos_bkp_20261023'];
  -- sequências: USAGE, SELECT e UPDATE para anon, authenticated e service_role
  sequencias constant text[] := array[
    'acompanhamento_acessos_id_seq','deploy_fila_itens_id_seq','deploy_fila_log_id_seq',
    'links_bio_cliques_id_seq','meus_pedidos_codigos_id_seq','meus_pedidos_envios_id_seq',
    'pedidos_central_fila_id_seq'];
  -- funções: assinatura -> papéis com EXECUTE (os demais ficam sem)
  funcoes constant jsonb := '{
    "acompanhamento_conferir(p jsonb)": ["service_role"],
    "acompanhamento_do_pedido_site(p pedidos)": ["service_role"],
    "acompanhamento_hash_telefone(p_telefone text)": ["service_role"],
    "acompanhamento_limpar_acessos()": ["service_role"],
    "acompanhamento_normalizar_telefone(p_telefone text)": ["service_role"],
    "acompanhamento_por_link(p_token text)": ["anon","authenticated","service_role"],
    "acompanhamento_receber(p_segredo text, p_pedidos jsonb)": ["anon","service_role"],
    "checar_bloqueio_pagamento(p_chave text)": ["service_role"],
    "contar_cliques_links_bio(p_desde timestamp with time zone)": ["anon","authenticated","service_role","PUBLIC"],
    "deploy_fila_confere_segredo(p_segredo text)": ["service_role"],
    "deploy_fila_confirmar(p_reivindicado_em timestamp with time zone)": ["service_role"],
    "deploy_fila_falhou(p_erro text)": ["service_role"],
    "deploy_fila_item_estrutura()": ["service_role"],
    "deploy_fila_item_noticia()": ["service_role"],
    "deploy_fila_item_produto()": ["service_role"],
    "deploy_fila_item_relacionada()": ["service_role"],
    "deploy_fila_itens_para_disparo(p_ate timestamp with time zone)": ["service_role"],
    "deploy_fila_processar()": ["service_role"],
    "deploy_fila_pronto()": ["service_role"],
    "deploy_fila_receber_guia(p_segredo text, p_itens jsonb)": ["anon","authenticated","service_role"],
    "deploy_fila_reivindicar()": ["service_role"],
    "deploy_fila_solicitar(p_motivo text)": ["service_role"],
    "expirar_pedidos_pendentes()": ["service_role"],
    "is_admin()": ["authenticated","service_role"],
    "meus_pedidos_codigo_nao_enviado(p_id bigint)": ["service_role"],
    "meus_pedidos_hmac(p_valor text)": ["service_role"],
    "meus_pedidos_limpar()": ["service_role"],
    "meus_pedidos_listar(p_sessao text)": ["anon","authenticated","service_role"],
    "meus_pedidos_preparar_codigo(p_telefone text, p_origem text)": ["service_role"],
    "meus_pedidos_sair(p_sessao text)": ["anon","authenticated","service_role"],
    "meus_pedidos_sessao(p_sessao text)": ["service_role"],
    "meus_pedidos_tem_pedidos(p_hash text)": ["service_role"],
    "meus_pedidos_validar_codigo(p_telefone text, p_codigo text)": ["anon","authenticated","service_role"],
    "novo_token_acompanhamento()": ["service_role"],
    "pedido_pago_token()": ["service_role"],
    "pedido_para_central()": ["service_role"],
    "pedido_telefone_hash()": ["service_role"],
    "pedidos_central_evento(f pedidos_central_fila)": ["service_role"],
    "pedidos_central_falhou(p_ids bigint[], p_erro text)": ["service_role"],
    "pedidos_central_processar()": ["service_role"],
    "registrar_tentativa_pagamento(p_chave text, p_sucesso boolean)": ["service_role"]
  }';

  nome text;
  papel text;
  alvo text;
  assinatura text;
  com_execute jsonb;
begin
  -- tabelas
  foreach nome in array tabelas_api || tabelas_internas loop
    continue when to_regclass(format('public.%I', nome)) is null;
    foreach papel in array papeis loop
      alvo := case papel when 'PUBLIC' then 'PUBLIC' else quote_ident(papel) end;
      if papel <> 'PUBLIC' and (nome = any(tabelas_api) or papel = 'service_role') then
        execute format('grant %s on table public.%I to %s', array_to_string(privs_tabela, ', '), nome, alvo);
      else
        execute format('revoke %s on table public.%I from %s', array_to_string(privs_tabela, ', '), nome, alvo);
      end if;
    end loop;
  end loop;

  -- sequências
  foreach nome in array sequencias loop
    continue when to_regclass(format('public.%I', nome)) is null;
    foreach papel in array papeis loop
      alvo := case papel when 'PUBLIC' then 'PUBLIC' else quote_ident(papel) end;
      if papel <> 'PUBLIC' then
        execute format('grant %s on sequence public.%I to %s', array_to_string(privs_sequencia, ', '), nome, alvo);
      else
        execute format('revoke %s on sequence public.%I from %s', array_to_string(privs_sequencia, ', '), nome, alvo);
      end if;
    end loop;
  end loop;

  -- funções
  for assinatura, com_execute in select * from jsonb_each(funcoes) loop
    continue when not exists (
      select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and format('%s(%s)', p.proname, pg_get_function_identity_arguments(p.oid)) = assinatura);
    foreach papel in array papeis loop
      alvo := case papel when 'PUBLIC' then 'PUBLIC' else quote_ident(papel) end;
      if com_execute ? papel then
        execute format('grant execute on function public.%s to %s', assinatura, alvo);
      else
        execute format('revoke execute on function public.%s from %s', assinatura, alvo);
      end if;
    end loop;
  end loop;
end
$$;
