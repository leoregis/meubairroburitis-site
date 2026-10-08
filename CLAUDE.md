# CLAUDE.md — meubairroburitis-site

## Testes e dados de produção

**Nenhum teste pode deixar registro público em produção.** (Regra do Leo, 07/10/2026.)

- Teste que cria dados (empresa, unidade, prestador, notícia, produto, evento, vaga, achado/perdido, perfil, conta) roda num branch de dev do Supabase, nunca no banco de produção.
- Em produção só vale teste **somente leitura** ou teste que **termina em `ROLLBACK`** na mesma transação (ex.: `central-mbb/scripts/producao/aplicar.mjs --teste-usuario-comum`).
- Se um registro de teste aparecer em produção: desativar (`ativo = false`, ou o equivalente da tabela), com backup do valor anterior e script de rollback em `meubairro-app/supabase/manutencao/`, e 410 na URL pública (`deploy/htaccess-producao` e `meubairro-app/app/public/.htaccess`). Não apagar.
- O deploy do site barra registros de teste publicados: `scripts/checar-registros-teste.mjs` roda depois do build e para o deploy se o sitemap ou algum `<title>` tiver "teste", "apagar", "lorem" ou "dummy". **Escopo: só as páginas vindas do Guia** — `/empresas` e `/prestadores`, com listagens, paginação e categorias. Notícias (`/noticias`) e páginas institucionais ficam de fora: o site é jornalístico e "teste" é palavra legítima em título ("teste do pezinho"); um deploy disparado pelo admin não pode travar por isso. Nome legítimo de empresa/prestador com um desses termos vira exceção, com motivo, em `scripts/checar-registros-teste.excecoes.json`.
