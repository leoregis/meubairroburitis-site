// Casos da normalização do telefone (supabase/functions/_shared/telefone.ts).
// Os mesmos casos rodam no banco em meus_pedidos_telefone.sql.
// Rodar: node --experimental-strip-types supabase/testes/telefone.test.ts
import { readFileSync } from "node:fs";
import { normalizarTelefone } from "../functions/_shared/telefone.ts";

const casos: [string, string | null, string][] = JSON.parse(
  readFileSync(new URL("./telefone-casos.json", import.meta.url), "utf8"),
);
let falhas = 0;
for (const [entrada, esperado, descricao] of casos) {
  const obtido = normalizarTelefone(entrada);
  if (obtido !== esperado) {
    falhas++;
    console.log(`FALHOU  ${descricao}: "${entrada}" -> ${obtido} (esperado ${esperado})`);
  }
}
console.log(`${casos.length - falhas}/${casos.length} casos OK`);
if (falhas) process.exit(1);
