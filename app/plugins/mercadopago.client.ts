import { loadMercadoPago } from '@mercadopago/sdk-js'

// 🔍 Qualidade da Integração MP -- script antifraude (device fingerprint),
// gera window.MP_DEVICE_SESSION_ID, enviado no header X-meli-session-id
// da chamada de pagamento (documentação oficial: mercadopago.com.ar/
// developers/en/docs/wallet-connect/payment-flow/capture-payment/device-id).
// device_id é só um sinal A MAIS pro antifraude -- nunca pode travar/
// atrasar o checkout por conta disso, por isso onerror/timeout resolvem
// (não rejeitam) mesmo sem o dado.
let securityCarregado = false

function carregarSecurityMercadoPago(): Promise<void> {
  if (securityCarregado) return Promise.resolve()

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://www.mercadopago.com/v2/security.js'
    script.setAttribute('view', 'checkout')
    script.onload = () => { securityCarregado = true; resolve() }
    script.onerror = () => resolve()
    document.head.appendChild(script)
    setTimeout(resolve, 3000)
  })
}

function obterDeviceId(): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).MP_DEVICE_SESSION_ID
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let instancia: unknown = null

  async function obterInstancia() {
    if (instancia) return instancia
    await loadMercadoPago()
    carregarSecurityMercadoPago()
    // @ts-expect-error -- window.MercadoPago vem do script carregado por loadMercadoPago
    instancia = new window.MercadoPago(config.public.mpPublicKey, { locale: 'pt-BR' })
    return instancia
  }

  return {
    provide: { mercadopago: obterInstancia, mpDeviceId: obterDeviceId },
  }
})
