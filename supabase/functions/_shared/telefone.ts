// Telefone num formato só: 55 + DDD + número (celular de 8 dígitos ganha o 9).
// Mesma regra de public.acompanhamento_normalizar_telefone no banco (migration
// 20261022120000) -- se mudar aqui, mudar lá, e os dois testes de casos
// (supabase/testes/meus_pedidos_telefone.sql e telefone.test.ts) junto.
export function normalizarTelefone(telefone: string | null | undefined): string | null {
  let d = String(telefone ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) {
    // 00 + código do país (discagem internacional)
    d = d.slice(2);
  } else if (d.startsWith("0")) {
    // 0 + DDD + número, ou 0 + operadora (2 dígitos) + DDD + número
    d = d.slice(1);
    if ((d.length === 12 || d.length === 13) && !d.startsWith("55")) d = d.slice(2);
  }
  if (/^55\d{10,11}$/.test(d)) d = d.slice(2);
  if (!/^[1-9][1-9]\d{8,9}$/.test(d)) return null;
  if (d.length === 10 && "6789".includes(d[2])) d = d.slice(0, 2) + "9" + d.slice(2);
  return "55" + d;
}
