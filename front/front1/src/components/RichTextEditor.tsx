import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import 'prosemirror-view/style/prosemirror.css'
import "./css/RichTextEditor.css"
interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  maxLength?: number
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Escribe aquí...',
  required = false,
  maxLength = 1000
}) => {
  const [charCount, setCharCount] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
        underline: false, // Deshabilitar underline del StarterKit
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const plainText = editor.getText()
      setCharCount(plainText.length)
      
      if (onChange) {
        // Usar HTML directamente en lugar del formato JSON complejo
        const html = editor.getHTML()
        onChange(html)
      }
    },
  })

  // Actualizar el editor cuando cambie el valor externo
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  // Actualizar contador de caracteres
  useEffect(() => {
    if (editor) {
      const plainText = editor.getText()
      setCharCount(plainText.length)
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const onBoldClick = () => {
    editor.chain().focus().toggleBold().run()
  }

  const onItalicClick = () => {
    editor.chain().focus().toggleItalic().run()
  }

  const onUnderlineClick = () => {
    editor.chain().focus().toggleUnderline().run()
  }

  const onBulletListClick = () => {
    editor.chain().focus().toggleBulletList().run()
  }

  const onNumberedListClick = () => {
    editor.chain().focus().toggleOrderedList().run()
  }

  const onTitleClick = () => {
    editor.chain().focus().toggleHeading({ level: 1 }).run()
  }

  const onSubtitleClick = () => {
    editor.chain().focus().toggleHeading({ level: 2 }).run()
  }

  const onParagraphClick = () => {
    editor.chain().focus().setParagraph().run()
  }

  const onAlignLeft = () => {
    editor.chain().focus().setTextAlign('left').run()
  }

  const onAlignCenter = () => {
    editor.chain().focus().setTextAlign('center').run()
  }

  const onAlignRight = () => {
    editor.chain().focus().setTextAlign('right').run()
  }

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={onBoldClick}
          title="Negrita"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={onItalicClick}
          title="Cursiva"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
          onClick={onUnderlineClick}
          title="Subrayado"
        >
          <u>U</u>
        </button>
        <div className="toolbar-separator"></div>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={onBulletListClick}
          title="Lista con viñetas"
        >
          • Lista
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={onNumberedListClick}
          title="Lista numerada"
        >
          1. Lista
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-section">
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={onTitleClick}
          title="Título"
        >
          T1
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={onSubtitleClick}
          title="Subtítulo"
        >
          T2
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive('paragraph') ? 'active' : ''}`}
          onClick={onParagraphClick}
          title="Párrafo"
        >
          P
        </button>
      </div>

      <div className="toolbar-separator"></div>

      <div className="toolbar-section">
        <button
          type="button"
          className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
          onClick={onAlignLeft}
          title="Alinear izquierda"
        >
          ←
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
          onClick={onAlignCenter}
          title="Centrar"
        >
          ↔
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
          onClick={onAlignRight}
          title="Alinear derecha"
        >
          →
        </button>
      </div>
      
      <div className="editor-container">
        <EditorContent 
          editor={editor} 
        />
      </div>
      
      <div className="editor-footer">
        <span className="char-count">
          {charCount}/{maxLength} caracteres
        </span>
        {required && charCount === 0 && (
          <span className="required-indicator">* Campo requerido</span>
        )}
      </div>
    </div>
  )
}

export default RichTextEditor 