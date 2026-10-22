-- Teste do /meus-pedidos no banco (fatia 3). Dados fictícios; termina em ROLLBACK.
-- Rodar no branch de dev (cria pedidos fictícios dentro da transação). Cada
-- conferência que falha interrompe com a mensagem; no fim, a lista do que passou.
begin;

create temp table resultado (n serial, conferencia text) on commit drop;

do $$
declare
  v_segredo text := (select decrypted_secret from vault.decrypted_secrets where name = 'acompanhamento_segredo');
  v_central uuid := gen_random_uuid();
  v_pausado uuid := gen_random_uuid();
  v_site uuid;
  r jsonb;
  v_cod text;
  v_sessao text;
  v_lista jsonb;
  i int;
begin
  -- 1. pedidos do mesmo número (fictício) em formatos diferentes, e de outro número
  insert into public.pedidos (nome_comprador, telefone_comprador, itens, valor_total_centavos, metodo_pagamento, status,
    idempotency_key, pago_em, criado_em)
  values ('Cliente Fictício', '31 9999-0001', '[{"produto_id":"x","nome":"Post no feed","preco_centavos":5000,"quantidade":1}]',
    5000, 'pix', 'pago', gen_random_uuid()::text, now() - interval '60 days', now() - interval '60 days');
  insert into public.pedidos (nome_comprador, telefone_comprador, itens, valor_total_centavos, metodo_pagamento, status, idempotency_key)
  values ('Cliente Fictício', '+55 (31) 99999-0001', '[{"produto_id":"y","nome":"Stories","preco_centavos":3000,"quantidade":2}]',
    6000, 'cartao', 'pendente', gen_random_uuid()::text)
  returning id into v_site;
  update public.pedidos set status = 'pago', pago_em = now() where id = v_site;
  insert into public.pedidos (nome_comprador, telefone_comprador, itens, valor_total_centavos, metodo_pagamento, status,
    idempotency_key, pago_em)
  values ('Outro Fictício', '(31) 99999-0002', '[{"produto_id":"z","nome":"Banner","preco_centavos":9000,"quantidade":1}]',
    9000, 'pix', 'pago', gen_random_uuid()::text, now());
  -- recusado do mesmo número: não aparece
  insert into public.pedidos (nome_comprador, telefone_comprador, itens, valor_total_centavos, metodo_pagamento, status, idempotency_key)
  values ('Cliente Fictício', '5531999990001', '[{"produto_id":"w","nome":"Recusado","preco_centavos":100,"quantidade":1}]',
    100, 'cartao', 'recusado', gen_random_uuid()::text);

  if (select count(distinct telefone_hash) from public.pedidos where nome_comprador = 'Cliente Fictício') <> 1 then
    raise exception 'FALHOU: formatos diferentes do mesmo número deram hashes diferentes';
  end if;
  insert into resultado (conferencia) values ('3 formatos do mesmo número no checkout -> 1 hash só');

  -- 2. venda da Central com o WhatsApp de acompanhamento em outro formato (sem o 9, com 0)
  r := public.acompanhamento_receber(v_segredo, jsonb_build_array(
    jsonb_build_object('chave', 'central:' || v_central, 'versao', 1, 'ativo', true, 'cancelado', false, 'em_aberto', true,
      'numero', 4242, 'data', current_date, 'empresa', 'Padaria Fictícia', 'telefone', '031 9999-0001',
      'itens', jsonb_build_array(jsonb_build_object('produto', 'Reels', 'quantidade', 1, 'a_agendar', 0,
        'entregas', jsonb_build_array(jsonb_build_object('tipo', 'Reels', 'quantidade', 1, 'situacao', 'aguardando_aprovacao',
          'previsto_para', null, 'com_horario', false, 'material_recebido_em', null, 'gravacao_para', null,
          'gravacao_com_horario', false, 'publicado_em', null, 'publicacoes', '[]'::jsonb, 'aprovacao_link', null))))),
    jsonb_build_object('chave', 'central:' || v_pausado, 'versao', 1, 'ativo', false, 'cancelado', false, 'em_aberto', true,
      'numero', 4243, 'data', current_date, 'empresa', 'Pausada', 'telefone', '5531999990001', 'itens', '[]'::jsonb)));
  if (select telefone_hash from public.acompanhamento_pedidos where chave = 'central:' || v_central)
     is distinct from (select telefone_hash from public.pedidos where id = v_site) then
    raise exception 'FALHOU: WhatsApp da Central (sem o 9, com 0) deu hash diferente do checkout';
  end if;
  insert into resultado (conferencia) values ('WhatsApp da Central "031 9999-0001" -> mesmo hash do checkout');

  -- 3. número sem pedido: não gera código (e a Edge Function responde igual)
  r := public.meus_pedidos_preparar_codigo('31 98888-0009', 'ip-a');
  if r ->> 'status' <> 'sem_envio' or exists (select 1 from public.meus_pedidos_codigos
      where telefone_hash = public.acompanhamento_hash_telefone('5531988880009')) then
    raise exception 'FALHOU: número sem pedido gerou código: %', r;
  end if;
  insert into resultado (conferencia) values ('número sem pedido: sem_envio, nenhum código gerado');
  r := public.meus_pedidos_preparar_codigo('9999-0001', 'ip-a');
  if r ->> 'status' <> 'invalido' then raise exception 'FALHOU: número sem DDD aceito: %', r; end if;
  insert into resultado (conferencia) values ('número sem DDD: inválido');

  -- 4. código errado 5 vezes anula; o certo deixa de valer
  r := public.meus_pedidos_preparar_codigo('(31) 9999-0001', 'ip-a');
  if r ->> 'status' <> 'enviar' or r ->> 'telefone' <> '5531999990001' or r ->> 'codigo' !~ '^\d{6}$' then
    raise exception 'FALHOU: preparar com pedido: %', r;
  end if;
  v_cod := r ->> 'codigo';
  if (select codigo_hash from public.meus_pedidos_codigos where id = (r ->> 'id')::bigint) like '%' || v_cod || '%' then
    raise exception 'FALHOU: código guardado em claro';
  end if;
  insert into resultado (conferencia) values ('com pedido: código de 6 dígitos para 5531999990001, guardado só como hash');
  for i in 1..4 loop
    r := public.meus_pedidos_validar_codigo('5531999990001', case when v_cod = '000000' then '111111' else '000000' end);
    if r ->> 'motivo' <> 'incorreto' or (r ->> 'tentativas_restantes')::int <> 5 - i then
      raise exception 'FALHOU: tentativa errada %: %', i, r;
    end if;
  end loop;
  r := public.meus_pedidos_validar_codigo('5531999990001', case when v_cod = '000000' then '111111' else '000000' end);
  if r ->> 'motivo' <> 'tentativas' then raise exception 'FALHOU: 5ª tentativa errada: %', r; end if;
  r := public.meus_pedidos_validar_codigo('5531999990001', v_cod);
  if r ->> 'motivo' <> 'invalido' then raise exception 'FALHOU: código certo valeu depois de 5 erros: %', r; end if;
  insert into resultado (conferencia) values ('5 códigos errados anulam o código; o certo deixa de valer');

  -- 5. código novo anula o anterior; vencido não vale
  r := public.meus_pedidos_preparar_codigo('31999990001', 'ip-a');
  v_cod := r ->> 'codigo';
  update public.meus_pedidos_codigos set expira_em = now() - interval '1 second' where id = (r ->> 'id')::bigint;
  r := public.meus_pedidos_validar_codigo('31999990001', v_cod);
  if r ->> 'motivo' <> 'invalido' then raise exception 'FALHOU: código vencido valeu: %', r; end if;
  insert into resultado (conferencia) values ('código vencido (10 min) não vale');

  -- 6. limite por número: 3 em 15 min (2 de cima + este) -> o 4º é recusado com a espera
  r := public.meus_pedidos_preparar_codigo('5531999990001', 'ip-b');
  if r ->> 'status' <> 'enviar' then raise exception 'FALHOU: 3º pedido em 15 min: %', r; end if;
  r := public.meus_pedidos_preparar_codigo('5531999990001', 'ip-b');
  if r ->> 'status' <> 'limite' or (r ->> 'minutos')::int not between 1 and 15 then
    raise exception 'FALHOU: 4º pedido em 15 min: %', r;
  end if;
  insert into resultado (conferencia) values ('4º pedido de código em 15 min: limite (' || (r ->> 'minutos') || ' min)');

  -- 7. com o limite liberado: código novo anula o anterior; o certo abre a sessão
  update public.meus_pedidos_envios set em = em - interval '20 minutes';
  r := public.meus_pedidos_preparar_codigo('5531999990001', 'ip-b');
  v_cod := r ->> 'codigo';
  i := (r ->> 'id')::int;
  r := public.meus_pedidos_preparar_codigo('5531999990001', 'ip-b');
  if (select anulado_em from public.meus_pedidos_codigos where id = i) is null
     or (v_cod <> r ->> 'codigo' and public.meus_pedidos_validar_codigo('5531999990001', v_cod) ->> 'motivo' <> 'incorreto') then
    raise exception 'FALHOU: código anterior continuou valendo';
  end if;
  insert into resultado (conferencia) values ('código novo anula o anterior');
  v_cod := r ->> 'codigo';
  r := public.meus_pedidos_validar_codigo('+55 31 9999-0001', v_cod);
  if not (r ->> 'ok')::boolean or r ->> 'sessao' !~ '^[A-Za-z0-9_-]{43}$' or r ->> 'telefone_final' <> '0001' then
    raise exception 'FALHOU: código certo: %', r;
  end if;
  v_sessao := r ->> 'sessao';
  if (select expira_em from public.meus_pedidos_sessoes where telefone_hash = public.acompanhamento_hash_telefone('5531999990001'))
     not between now() + interval '29 days 23 hours' and now() + interval '30 days 1 minute' then
    raise exception 'FALHOU: sessão sem 30 dias';
  end if;
  if public.meus_pedidos_validar_codigo('5531999990001', v_cod) ->> 'motivo' <> 'invalido' then
    raise exception 'FALHOU: código usado valeu de novo';
  end if;
  insert into resultado (conferencia) values ('código certo (digitado com +55 e sem o 9) abre sessão de 30 dias; não vale 2 vezes');

  -- 8. lista: os 3 pedidos do número (antigo, site, Central), sem o pausado, sem o
  -- recusado e sem o do outro número; nada de valores
  v_lista := public.meus_pedidos_listar(v_sessao);
  if not (v_lista ->> 'ok')::boolean or jsonb_array_length(v_lista -> 'pedidos') <> 3 then
    raise exception 'FALHOU: lista: %', v_lista;
  end if;
  if not exists (select 1 from jsonb_array_elements(v_lista -> 'pedidos') p where (p ->> 'antigo')::boolean and p #>> '{itens,0,produto}' = 'Post no feed')
     or not exists (select 1 from jsonb_array_elements(v_lista -> 'pedidos') p where (p ->> 'aguardando_registro')::boolean and p #>> '{itens,0,produto}' = 'Stories')
     or not exists (select 1 from jsonb_array_elements(v_lista -> 'pedidos') p where p ->> 'empresa' = 'Padaria Fictícia')
     or exists (select 1 from jsonb_array_elements(v_lista -> 'pedidos') p where p ->> 'empresa' = 'Pausada' or p #>> '{itens,0,produto}' in ('Banner', 'Recusado')) then
    raise exception 'FALHOU: conteúdo da lista: %', v_lista;
  end if;
  if v_lista::text ~* ('centavos|valor|preco|telefone_hash|"chave"|' || v_site::text) then
    raise exception 'FALHOU: lista expõe valor, hash, chave ou id do pedido';
  end if;
  insert into resultado (conferencia) values ('lista: antigo + site + Central do número; sem pausado, recusado ou outro número; sem valores nem ids');

  -- 9. sessão inválida / encerrada
  if (public.meus_pedidos_listar('x') ->> 'ok')::boolean or (public.meus_pedidos_listar(repeat('a', 43)) ->> 'ok')::boolean then
    raise exception 'FALHOU: sessão inventada abriu a lista';
  end if;
  perform public.meus_pedidos_sair(v_sessao);
  if (public.meus_pedidos_listar(v_sessao) ->> 'ok')::boolean then raise exception 'FALHOU: sessão encerrada abriu a lista'; end if;
  insert into resultado (conferencia) values ('sessão inventada ou encerrada ("Sair") não abre a lista');

  -- 10. limite por IP: 10 por hora (números diferentes, sem pedido)
  for i in 1..10 loop
    perform public.meus_pedidos_preparar_codigo('31 98888-' || lpad(i::text, 4, '0'), 'ip-c');
  end loop;
  r := public.meus_pedidos_preparar_codigo('31 98888-0099', 'ip-c');
  if r ->> 'status' <> 'limite' then raise exception 'FALHOU: 11º pedido do mesmo IP: %', r; end if;
  insert into resultado (conferencia) values ('11º pedido de código do mesmo IP em 1 hora: limite');

  -- 11. teto do dia (200 códigos): número com pedido não recebe, resposta igual a "sem pedido"
  insert into public.meus_pedidos_envios (telefone_hash, origem_hash, gerou_codigo)
  select md5(g::text) || md5(g::text), 'ip-teto', true from generate_series(1, 200) g;
  update public.meus_pedidos_envios set em = em - interval '20 minutes' where telefone_hash = public.acompanhamento_hash_telefone('5531999990002');
  r := public.meus_pedidos_preparar_codigo('(31) 99999-0002', 'ip-d');
  if r ->> 'status' <> 'sem_envio' then raise exception 'FALHOU: teto do dia: %', r; end if;
  insert into resultado (conferencia) values ('teto de 200 códigos no dia: número com pedido fica sem_envio');

  -- 11b. limite por número: 10 por dia (fora da janela de 15 min)
  update public.meus_pedidos_envios set em = now() - interval '2 hours'
  where telefone_hash = public.acompanhamento_hash_telefone('5531999990001');
  insert into public.meus_pedidos_envios (telefone_hash, origem_hash, gerou_codigo, em)
  select public.acompanhamento_hash_telefone('5531999990001'), 'ip-e', true, now() - interval '3 hours'
  from generate_series(1, 10 - (select count(*) from public.meus_pedidos_envios
    where telefone_hash = public.acompanhamento_hash_telefone('5531999990001'))::int);
  r := public.meus_pedidos_preparar_codigo('5531999990001', 'ip-e');
  if r ->> 'status' <> 'limite' or (r ->> 'minutos')::int <= 15 then raise exception 'FALHOU: 11º pedido no dia: %', r; end if;
  insert into resultado (conferencia) values ('11º pedido de código do número em 24 h: limite (' || (r ->> 'minutos') || ' min)');

  -- 12. permissões
  if has_function_privilege('anon', 'public.meus_pedidos_preparar_codigo(text, text)', 'execute')
     or has_function_privilege('authenticated', 'public.meus_pedidos_preparar_codigo(text, text)', 'execute')
     or has_function_privilege('anon', 'public.meus_pedidos_codigo_nao_enviado(bigint)', 'execute')
     or has_function_privilege('anon', 'public.meus_pedidos_sessao(text)', 'execute')
     or has_function_privilege('anon', 'public.meus_pedidos_hmac(text)', 'execute')
     or has_function_privilege('anon', 'public.meus_pedidos_tem_pedidos(text)', 'execute')
     or has_function_privilege('anon', 'public.meus_pedidos_limpar()', 'execute')
     or has_function_privilege('anon', 'public.acompanhamento_normalizar_telefone(text)', 'execute')
     or has_function_privilege('anon', 'public.acompanhamento_hash_telefone(text)', 'execute')
     or not has_function_privilege('anon', 'public.meus_pedidos_validar_codigo(text, text)', 'execute')
     or not has_function_privilege('anon', 'public.meus_pedidos_listar(text)', 'execute')
     or not has_function_privilege('anon', 'public.meus_pedidos_sair(text)', 'execute') then
    raise exception 'FALHOU: permissões das funções';
  end if;
  if has_table_privilege('anon', 'public.meus_pedidos_codigos', 'select') or has_table_privilege('anon', 'public.meus_pedidos_sessoes', 'select')
     or has_table_privilege('anon', 'public.meus_pedidos_envios', 'select') or has_table_privilege('authenticated', 'public.meus_pedidos_sessoes', 'select') then
    raise exception 'FALHOU: permissões das tabelas';
  end if;
  insert into resultado (conferencia) values ('visitante só executa validar/listar/sair; nenhuma tabela nova legível');
end;
$$;

select n, conferencia from resultado order by n;
rollback;
