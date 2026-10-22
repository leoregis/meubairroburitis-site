import { normalizarTelefone } from "./telefone.ts";

// validação anti-spam do checkout público -- não é validação de negócio,
// é filtro de bot/lixo (ver auditoria do pedido "dgfysgdjf sdfege" com
// telefone "02625480444", 2026-08-03). Fica isolado aqui pra criar_pagamento
// não crescer e pra dar pra reaproveitar se algum dia surgir outro endpoint
// público de escrita.

export function ehHoneypotPreenchido(empresa: string | undefined | null): boolean {
  return Boolean(empresa && empresa.trim().length > 0);
}

// aceita só telefone BR plausível: 10 ou 11 dígitos (com DDD; o 55 do país
// na frente é aceito e tirado), DDD não pode começar em 0 (nenhum DDD real
// começa assim) e rejeita sequências tipo "00000000000"/"11111111111" que
// bots costumam gerar. O checkout grava o número normalizado
// (normalizarTelefone, _shared/telefone.ts).
export function telefoneValido(telefone: string): boolean {
  const digitos = telefone.replace(/\D/g, "").replace(/^55(\d{10,11})$/, "$1");
  if (digitos.length < 10 || digitos.length > 11) return false;
  if (digitos[0] === "0") return false;
  if (/^(\d)\1+$/.test(digitos)) return false;
  return normalizarTelefone(digitos) !== null;
}

export function nomeValido(nome: string): boolean {
  const limpo = nome.trim();
  if (limpo.length < 2 || limpo.length > 120) return false;
  // exige pelo menos uma vogal -- barato e pega a maioria do "teclado
  // batido" (ex: "dgfysgdjf sdfege" tem só consoante em blocos longos,
  // mas nomes reais sempre têm vogal em intervalos curtos)
  if (!/[aeiouáéíóúâêôãõàAEIOUÁÉÍÓÚÂÊÔÃÕÀ]/.test(limpo)) return false;
  return true;
}
