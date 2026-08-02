const visivel = ref(false)
const mensagem = ref('')
let temporizador: ReturnType<typeof setTimeout> | null = null

export function useToastCarrinho() {
  function mostrar(nomeProduto: string) {
    mensagem.value = `${nomeProduto} adicionado ao carrinho`
    visivel.value = true

    if (temporizador) clearTimeout(temporizador)
    temporizador = setTimeout(() => {
      visivel.value = false
    }, 4000)
  }

  function esconder() {
    if (temporizador) clearTimeout(temporizador)
    visivel.value = false
  }

  return { visivel, mensagem, mostrar, esconder }
}
