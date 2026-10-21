-- 21/out (aprovado pelo Leo): função nova nasce sem EXECUTE pra visitante
-- (anon) e usuário logado (authenticated). Antes, toda função criada pelo
-- postgres já nascia executável por PUBLIC (padrão do Postgres) e por anon e
-- authenticated (default privileges do Supabase no schema public) -- foi
-- assim que checar_bloqueio_pagamento & cia. ficaram abertas (ver
-- 20261021200000_funcoes_sem_acesso_anon.sql).
--
-- Só muda o padrão de funções NOVAS. As existentes ficam como estão.
-- postgres e service_role continuam recebendo EXECUTE automaticamente.
-- Função que precise ser chamada por anon ou authenticated (RPC do site, do
-- app ou usada em policy) libera na própria migration com
-- "grant execute on function ... to anon" (ou authenticated). Ver CLAUDE.md.
--
-- Rollback: supabase/manutencao/20261021_funcoes_novas_sem_acesso_padrao_rollback.sql

alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;
