<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

const modelo = defineModel<string>({ required: true })

const editor = useEditor({
  content: modelo.value,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false, autolink: true }),
    Image,
  ],
  onUpdate: ({ editor: ed }) => {
    modelo.value = ed.getHTML()
  },
})

watch(modelo, (novoValor) => {
  if (editor.value && novoValor !== editor.value.getHTML()) {
    editor.value.commands.setContent(novoValor, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function alternarNegrito() {
  editor.value?.chain().focus().toggleBold().run()
}
function alternarItalico() {
  editor.value?.chain().focus().toggleItalic().run()
}
function alternarTitulo(nivel: 2 | 3) {
  editor.value?.chain().focus().toggleHeading({ level: nivel }).run()
}
function alternarListaMarcadores() {
  editor.value?.chain().focus().toggleBulletList().run()
}
function alternarListaNumerada() {
  editor.value?.chain().focus().toggleOrderedList().run()
}
function alternarCitacao() {
  editor.value?.chain().focus().toggleBlockquote().run()
}
function inserirLink() {
  const url = window.prompt('URL do link:')
  if (!url) return
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// "Colar HTML" -- paste nativo do Tiptap so interpreta HTML de verdade
// quando o clipboard tem um payload text/html real (ex: copiar de uma
// pagina renderizada). Colar a STRING bruta de markup (ex: de um editor
// de texto/codigo) cai como texto literal, com as tags visiveis -- por
// isso esse botao abre um textarea a parte: o que for colado ali sempre
// chega como string (sem MIME html), entao a gente mesmo manda o Tiptap
// tratar como HTML (insertContent faz parse de string como HTML por
// padrao), depois de sanitizar.
//
// O mesmo botão também serve pra EDITAR o HTML de uma matéria que já tem
// conteúdo: o textarea abre com o HTML atual do editor (getHTML(), já
// normalizado pelo Tiptap e incluindo edições ainda não salvas -- é
// exatamente o que vai pro banco ao salvar) e, ao aplicar, substitui o
// documento inteiro em vez de inserir no cursor.
const mostrarModalHtml = ref(false)
const htmlColado = ref('')
const editandoHtmlExistente = ref(false)

// getHTML() sai numa linha só -- quebra depois de cada bloco pra dar pra
// ler/editar. Os espaços entre blocos são descartados pelo parser do
// Tiptap ao aplicar, então isso não muda o conteúdo.
function formatarHtmlParaEdicao(html: string) {
  return html.replace(/(<\/(?:p|h[1-6]|li|ul|ol|blockquote)>|<hr>|<img[^>]*>)/g, '$1\n').trim()
}

function abrirModalHtml() {
  const ed = editor.value
  editandoHtmlExistente.value = !!ed && !ed.isEmpty
  htmlColado.value = editandoHtmlExistente.value && ed ? formatarHtmlParaEdicao(ed.getHTML()) : ''
  mostrarModalHtml.value = true
}

function confirmarHtmlColado() {
  const sanitizado = sanitizeHtml(htmlColado.value)
  if (editandoHtmlExistente.value) {
    editor.value?.chain().focus().setContent(sanitizado, { emitUpdate: true }).run()
  } else {
    editor.value?.chain().focus().insertContent(sanitizado).run()
  }
  mostrarModalHtml.value = false
  htmlColado.value = ''
}
</script>

<template>
  <div class="rounded-lg border border-stone-300">
    <div v-if="editor" class="flex flex-wrap gap-1 border-b border-stone-200 p-2">
      <button
        type="button"
        class="rounded px-2 py-1 text-sm font-bold"
        :class="editor.isActive('bold') ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="alternarNegrito"
      >
        B
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm italic"
        :class="editor.isActive('italic') ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="alternarItalico"
      >
        I
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm font-semibold"
        :class="editor.isActive('heading', { level: 2 }) ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="alternarTitulo(2)"
      >
        H2
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm font-semibold"
        :class="editor.isActive('heading', { level: 3 }) ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="alternarTitulo(3)"
      >
        H3
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm"
        :class="editor.isActive('bulletList') ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="alternarListaMarcadores"
      >
        • Lista
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm"
        :class="editor.isActive('orderedList') ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="alternarListaNumerada"
      >
        1. Lista
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm"
        :class="editor.isActive('blockquote') ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="alternarCitacao"
      >
        “ Citação
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm"
        :class="editor.isActive('link') ? 'bg-stone-200' : 'hover:bg-stone-100'"
        @click="inserirLink"
      >
        🔗 Link
      </button>
      <button
        type="button"
        class="rounded px-2 py-1 text-sm hover:bg-stone-100"
        @click="abrirModalHtml"
      >
        &lt;/&gt; Editar HTML
      </button>
    </div>

    <EditorContent :editor="editor" class="noticia-editor-conteudo min-h-[240px] px-3 py-2" />

    <div v-if="mostrarModalHtml" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-3xl rounded-lg bg-white p-5 shadow-xl">
        <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">
          {{ editandoHtmlExistente ? 'Editar HTML da matéria' : 'Colar HTML bruto' }}
        </h3>
        <p v-if="editandoHtmlExistente" class="mb-3 text-xs text-stone-500">
          Este é o HTML atual da matéria, incluindo alterações ainda não salvas. Ao aplicar, ele
          substitui todo o conteúdo do editor (é sanitizado antes). Depois, clique em salvar a matéria
          normalmente.
        </p>
        <p v-else class="mb-3 text-xs text-stone-500">
          Cole aqui o HTML pronto (ex: com &lt;h3&gt;, &lt;strong&gt;, &lt;a&gt;...). Ao inserir, o
          conteúdo é sanitizado e vira formatação real no editor, não texto com as tags visíveis.
        </p>
        <textarea
          v-model="htmlColado"
          :rows="editandoHtmlExistente ? 20 : 12"
          spellcheck="false"
          aria-label="Código HTML da matéria"
          class="max-h-[65vh] w-full rounded-lg border border-stone-300 p-3 font-mono text-[13px] leading-relaxed focus:border-orange-500 focus:outline-none"
          placeholder="<h3>Título</h3><p><strong>Negrito</strong> e um <a href=&quot;https://...&quot;>link</a></p>"
        />
        <div class="mt-3 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            @click="mostrarModalHtml = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            :disabled="!htmlColado.trim()"
            @click="confirmarHtmlColado"
          >
            {{ editandoHtmlExistente ? 'Aplicar' : 'Inserir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.noticia-editor-conteudo .tiptap {
  outline: none;
}

.noticia-editor-conteudo h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0.75rem 0 0.25rem;
}

.noticia-editor-conteudo h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0.65rem 0 0.25rem;
}

.noticia-editor-conteudo p {
  margin: 0.5rem 0;
}

.noticia-editor-conteudo ul,
.noticia-editor-conteudo ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

.noticia-editor-conteudo ul {
  list-style: disc;
}

.noticia-editor-conteudo ol {
  list-style: decimal;
}

.noticia-editor-conteudo blockquote {
  border-left: 3px solid #d6d3d1;
  padding-left: 0.75rem;
  color: #57534e;
  font-style: italic;
  margin: 0.5rem 0;
}

.noticia-editor-conteudo a {
  color: #c2410c;
  text-decoration: underline;
}
</style>
