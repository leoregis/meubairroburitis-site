# CLAUDE.md — meubairroburitis-site

## Testes e dados de produção

**Nenhum teste pode deixar registro público em produção.** (Regra do Leo, 07/10/2026.)

- Teste que cria dados (empresa, unidade, prestador, notícia, produto, evento, vaga, achado/perdido, perfil, conta) roda num branch de dev do Supabase, nunca no banco de produção.
- Em produção só vale teste **somente leitura** ou teste que **termina em `ROLLBACK`** na mesma transação (ex.: `central-mbb/scripts/producao/aplicar.mjs --teste-usuario-comum`).
- Se um registro de teste aparecer em produção: desativar (`ativo = false`, ou o equivalente da tabela), com backup do valor anterior e script de rollback em `meubairro-app/supabase/manutencao/`, e 410 na URL pública (`deploy/htaccess-producao` e `meubairro-app/app/public/.htaccess`). Não apagar.
- O deploy do site barra registros de teste publicados: `scripts/checar-registros-teste.mjs` roda depois do build e para o deploy se o sitemap ou algum `<title>` tiver "teste", "apagar", "lorem" ou "dummy". **Escopo: só as páginas vindas do Guia** — `/empresas` e `/prestadores`, com listagens, paginação e categorias. Notícias (`/noticias`) e páginas institucionais ficam de fora: o site é jornalístico e "teste" é palavra legítima em título ("teste do pezinho"); um deploy disparado pelo admin não pode travar por isso. Nome legítimo de empresa/prestador com um desses termos vira exceção, com motivo, em `scripts/checar-registros-teste.excecoes.json`.

## Mudanças no banco de produção pelo Claude

(Regra do Leo, 09/10/2026.) O Claude aplica migrations, roda SQL e publica edge functions na produção (site `peusailkyxqbhgdgmqyk`; Guia `xtmwatregednbuupfdbl`) direto pelo conector do Supabase, sem pedir aprovação. `merge_branch` fica bloqueado.

- **Perguntar no chat antes** de qualquer comando destrutivo: `DROP` (tabela, coluna, view, função, policy, trigger…), `TRUNCATE`, `DELETE` em massa e apagar branch de dev.
- **Toda mudança com backup e rollback**: definição anterior (função, view, policy, grants) ou valores anteriores (tabela `*_bkp_AAAAMMDD`) guardados antes, e script de volta em `supabase/manutencao/`, commitado junto com a migration.
- **Histórico alinhado com o arquivo**: a migration nasce em `supabase/migrations/<versão>_<nome>.sql`; depois de aplicar, `supabase_migrations.schema_migrations` fica com a mesma versão e o mesmo nome do arquivo. O `apply_migration` grava o horário da aplicação: corrigir a versão logo em seguida e conferir.
- **Quando o conector recusar sozinho** (ele trava SQL que julga destrutivo, como `DELETE`/`UPDATE` sem `WHERE`, mesmo dentro de corpo de função, e a confirmação não chega ao Leo): aplicar pelo Supabase CLI, `supabase db query --linked -f <arquivo> --workdir <pasta temporária>`, com `supabase/.temp/project-ref` da pasta apontando para o projeto (conferido antes de rodar). Vai pela API de gerenciamento, sem senha do banco. Migration e registro no histórico na mesma transação.
- Documentos de privacidade e incidentes não entram neste repositório (é público): ficam no `meubairro-app`.
- Testes continuam valendo a regra acima (produção só leitura ou `ROLLBACK`).
