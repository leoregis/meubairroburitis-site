-- Fase 4 da reestruturação editorial -- CTA contextual pro Guia Buritis,
-- só nos artigos onde faz sentido de verdade (curado manualmente, não
-- calculado por categoria -- mesmo espírito de noticias_relacionadas).
-- Ambas nullable: artigo sem CTA simplesmente não mostra o bloco.
alter table public.noticias
  add column cta_texto text,
  add column cta_href text;
