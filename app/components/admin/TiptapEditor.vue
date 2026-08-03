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
    </div>

    <EditorContent :editor="editor" class="noticia-editor-conteudo min-h-[240px] px-3 py-2" />
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
