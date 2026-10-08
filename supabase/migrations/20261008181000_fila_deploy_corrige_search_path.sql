-- APLICADA em 08/10/2026. Ao colar a 20261008180000 no SQL Editor, o
-- search_path de deploy_fila_confirmar ficou "p\r\nublic" (quebra de linha
-- no meio da string). A função funcionava (tudo qualificado com public.),
-- mas fica corrigido pro valor certo.
alter function public.deploy_fila_confirmar(timestamptz) set search_path to 'public';
