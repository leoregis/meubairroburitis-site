#!/usr/bin/env node
// Resumo em Markdown das rotas de um deploy incremental (Job Summary).
// Uso: node scripts/incremental/resumo-rotas.mjs <rotas.json>
import { readFileSync } from 'node:fs'

const { regerar = [], remover = [] } = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const linhas = [`Regeradas: ${regerar.length} | removidas: ${remover.length}`, '']
for (const r of regerar) linhas.push(`- ${r}`)
if (remover.length) {
  linhas.push('', 'Removidas:')
  for (const r of remover) linhas.push(`- ${r}`)
}
console.log(linhas.join('\n'))
