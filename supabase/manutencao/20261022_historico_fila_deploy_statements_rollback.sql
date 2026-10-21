-- Rollback da correção de 22/10/2026 no histórico de migrations do site:
-- a linha 20261008180000 (fila_deploy_com_periodo_de_calma) tinha em
-- `statements` só um comentário (a migration foi aplicada pelo SQL Editor e
-- registrada depois). Branch novo do Supabase reproduz o histórico, então
-- essa migration "rodava" vazia e a 20261008181000 quebrava
-- (MIGRATIONS_FAILED). A correção gravou ali o conteúdo do arquivo
-- supabase/migrations/20261008180000_fila_deploy_com_periodo_de_calma.sql.
-- Isto devolve o valor anterior (backup, md5 14616b2e318201fd17f04b4dbc84f450).
-- Só mexe no registro do histórico; nada do banco é reaplicado.
begin;

update supabase_migrations.schema_migrations
set statements = array['-- registrada em 09/10/2026: aplicada antes pelo SQL Editor (conteudo em supabase/migrations/20261008180000_fila_deploy_com_periodo_de_calma.sql); so o registro, nada reaplicado']
where version = '20261008180000';

commit;
