-- 09/10/2026: apaga public.webhook_debug_log (aprovado pelo Leo).
-- Diagnóstico temporário de agosto (20260803011246): o mp_webhook gravava
-- cada etapa da notificação do Mercado Pago. O logDebug saiu do mp_webhook
-- (versão 11, publicada antes desta migration) -- ninguém mais grava nem lê.
-- Backup das 189 linhas (03/08 a 07/10, sem dados pessoais): repositório
-- privado meubairro-app, supabase/backups/site/20261009_webhook_debug_log.json
-- Rollback: manutencao/20261009_apagar_webhook_debug_log_rollback.sql
drop table if exists public.webhook_debug_log;
