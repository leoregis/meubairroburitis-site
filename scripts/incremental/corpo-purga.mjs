#!/usr/bin/env node
// Corpo JSON da purga por URL do Cloudflare ({"files": [...]}) a partir de
// um arquivo com uma URL por linha.
// Uso: node scripts/incremental/corpo-purga.mjs <lote.txt>
import { readFileSync } from 'node:fs'

const files = readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter(Boolean)
console.log(JSON.stringify({ files }))
