'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEffect, useState } from 'react';
import {
  AlertCircleIcon,
  DocumentIcon,
  BookOpenIcon,
  BarChartIcon,
  CheckCircleIcon,
  TrashIcon,
  ClockIcon,
  NodeIcon
} from '@/components/icons/MinimalIcons';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface URLDialogState {
  isOpen: boolean;
  type: 'link' | 'image' | null;
  url: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [dialogState, setDialogState] = useState<URLDialogState>({
    isOpen: false,
    type: null,
    url: ''
  });

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        link: { 
          openOnClick: false, 
          HTMLAttributes: { class: 'text-blue-600 underline' } 
        }
      }),
      Image.configure({
        inline: true,
        allowBase64: true
      })
      // Mathematics extension removed to prevent memory issues
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-4 text-[#1F2937] dark:text-[#F3F4F6] dark:bg-[#111827]'
      }
    }
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    setDialogState({
      isOpen: true,
      type: 'image',
      url: ''
    });
  };

  const setLink = () => {
    setDialogState({
      isOpen: true,
      type: 'link',
      url: ''
    });
  };

  const handleURLConfirm = () => {
    if (dialogState.url.trim() && editor) {
      if (dialogState.type === 'image') {
        editor.chain().focus().setImage({ src: dialogState.url }).run();
      } else if (dialogState.type === 'link') {
        editor.chain().focus().setLink({ href: dialogState.url }).run();
      }
    }
    setDialogState({
      isOpen: false,
      type: null,
      url: ''
    });
  };

  const handleURLCancel = () => {
    setDialogState({
      isOpen: false,
      type: null,
      url: ''
    });
  };

  return (
    <div className="border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-[#F9FAFB] dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-[#1F2937] p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition ${
            editor.isActive('bold')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Negrita (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition ${
            editor.isActive('italic')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Cursiva (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded transition ${
            editor.isActive('strike')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Tachado"
        >
          <s>S</s>
        </button>

        <div className="w-px bg-[#E5E7EB] dark:bg-[#1F2937] mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded transition ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Título 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded transition ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Título 3"
        >
          H3
        </button>

        <div className="w-px bg-[#E5E7EB] dark:bg-[#1F2937] mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition ${
            editor.isActive('bulletList')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Lista con viñetas"
        >
          • Lista
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded transition ${
            editor.isActive('orderedList')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Lista numerada"
        >
          1. Lista
        </button>

        <div className="w-px bg-[#E5E7EB] dark:bg-[#1F2937] mx-1"></div>

        {/* Blockquote & Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded transition ${
            editor.isActive('blockquote')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Cita"
        >
          " Cita
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded transition ${
            editor.isActive('codeBlock')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Bloque de código"
        >
          {'</>'}
        </button>

        <div className="w-px bg-[#E5E7EB] dark:bg-[#1F2937] mx-1"></div>

        {/* Link & Image */}
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded transition flex items-center gap-1 ${
            editor.isActive('link')
              ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white'
              : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'
          }`}
          title="Insertar enlace"
        >
          <DocumentIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded transition flex items-center gap-1 text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]"
          title="Insertar imagen"
        >
          <BookOpenIcon className="w-4 h-4" />
        </button>

        {/* MATH BUTTON */}
        <button
          type="button"
          onClick={() => {
            const latex = window.prompt('Escribe la ecuación LaTeX (sin $ delimiters):');
            if (latex) {
              editor.chain().focus().insertContent(`$${latex}$`).run();
            }
          }}
          className="p-2 rounded transition flex items-center gap-1 text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]"
          title="Insertar ecuación (LaTeX)"
        >
          ∑
        </button>

        <div className="w-px bg-[#E5E7EB] dark:bg-[#1F2937] mx-1"></div>

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded transition text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937] disabled:opacity-30"
          title="Deshacer"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded transition text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937] disabled:opacity-30"
          title="Rehacer"
        >
          ↷
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white dark:bg-[#111827]" />

      {placeholder && !content && (
        <div className="absolute top-12 left-4 text-[#9CA3AF] dark:text-[#6B7280] pointer-events-none">
          {placeholder}
        </div>
      )}

      {/* URL Dialog Modal */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#1F2937]">
              <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                {dialogState.type === 'image' ? 'Insertar imagen' : 'Insertar enlace'}
              </h3>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                  {dialogState.type === 'image' ? 'URL de la imagen' : 'URL del enlace'}
                </label>
                <input
                  type="url"
                  value={dialogState.url}
                  onChange={(e) => setDialogState({ ...dialogState, url: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleURLConfirm()}
                  placeholder={dialogState.type === 'image' ? 'https://ejemplo.com/imagen.jpg' : 'https://ejemplo.com'}
                  className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] focus:outline-none dark:bg-[#1F2937] dark:text-[#F3F4F6] text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-[#1F2937] flex justify-end gap-3">
              <button
                onClick={handleURLCancel}
                className="px-4 py-2 text-[#1F2937] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleURLConfirm}
                disabled={!dialogState.url.trim()}
                className="px-4 py-2 bg-[#2F6F6D] dark:bg-[#4A9B98] text-white rounded-lg hover:bg-[#1F4A48] dark:hover:bg-[#3A8A87] disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}