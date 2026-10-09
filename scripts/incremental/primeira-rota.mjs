#!/usr/bin/env node
// Pasta (relativa a .output/public, com barra no fim) da primeira rota
// regerada -- usada pra conferir o buildId no HTML gerado.
// Uso: node scripts/incremental/primeira-rota.mjs <rotas.json>
import { readFileSync } from 'node:fs'

const r = JSON.parse(readFileSync(process.argv[2], 'utf8')).regerar[0]
console.log(r === '/' ? '' : `${r.slice(1)}/`)
