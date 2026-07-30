import { loadMercadoPago } from '@mercadopago/sdk-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let instancia: unknown = null

  async function obterInstancia() {
    if (instancia) return instancia
    await loadMercadoPago()
    // @ts-expect-error -- window.MercadoPago vem do script carregado por loadMercadoPago
    instancia = new window.MercadoPago(config.public.mpPublicKey, { locale: 'pt-BR' })
    return instancia
  }

  return {
    provide: { mercadopago: obterInstancia },
  }
})
