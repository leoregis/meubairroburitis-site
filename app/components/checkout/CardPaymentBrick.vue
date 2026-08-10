<script setup lang="ts">
const props = defineProps<{ valorCentavos: number }>()
const emit = defineEmits<{
  submit: [
    dados: {
      token: string
      payment_method_id: string
      installments: number
      issuer_id?: string
      device_id?: string
      identification?: { type: string; number: string }
    },
  ]
  pronto: []
  erro: [erro: unknown]
}>()

const containerId = 'card-payment-brick-container'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let controlador: any = null

onMounted(async () => {
  const { $mercadopago, $mpDeviceId } = useNuxtApp()
  try {
    const mp = await ($mercadopago as () => Promise<{ bricks: () => { create: (...args: unknown[]) => Promise<unknown> } }>)()
    const bricksBuilder = mp.bricks()

    controlador = await bricksBuilder.create('cardPayment', containerId, {
      initialization: { amount: props.valorCentavos / 100 },
      callbacks: {
        onReady: () => emit('pronto'),
        onSubmit: (formData: {
          token: string
          payment_method_id: string
          installments: number
          issuer_id?: string
          payer?: { identification?: { type: string; number: string } }
        }) => {
          return new Promise<void>((resolve) => {
            emit('submit', {
              token: formData.token,
              payment_method_id: formData.payment_method_id,
              installments: formData.installments,
              issuer_id: formData.issuer_id,
              device_id: ($mpDeviceId as () => string | undefined)(),
              // 🔍 Qualidade da Integração MP -- o Brick já pede o CPF do
              // titular no próprio formulário ("Documento do titular"),
              // sem config extra; só faltava repassar pro backend.
              identification: formData.payer?.identification,
            })
            resolve()
          })
        },
        onError: (erro: unknown) => emit('erro', erro),
      },
    })
  } catch (erro) {
    emit('erro', erro)
  }
})

onBeforeUnmount(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(controlador as any)?.unmount?.()
})
</script>

<template>
  <div :id="containerId" />
</template>
