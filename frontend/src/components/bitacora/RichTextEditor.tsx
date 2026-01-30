'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useState, useRef } from 'react';
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

interface DialogState {
  isOpen: boolean;
  type: 'link' | 'image' | null;
  url: string;
  selectedText?: string;
}

interface MathDropdownState {
  isOpen: boolean;
}

const MATH_SYMBOLS = [
  { symbol: '∑', name: 'Sumatoria', unicode: '∑' },
  { symbol: '∫', name: 'Integral', unicode: '∫' },
  { symbol: '√', name: 'Raíz cuadrada', unicode: '√' },
  { symbol: '∞', name: 'Infinito', unicode: '∞' },
  { symbol: 'π', name: 'Pi', unicode: 'π' },
  { symbol: 'α', name: 'Alfa', unicode: 'α' },
  { symbol: 'β', name: 'Beta', unicode: 'β' },
  { symbol: 'γ', name: 'Gamma', unicode: 'γ' },
  { symbol: 'Δ', name: 'Delta', unicode: 'Δ' },
  { symbol: 'θ', name: 'Theta', unicode: 'θ' },
  { symbol: 'λ', name: 'Lambda', unicode: 'λ' },
  { symbol: 'μ', name: 'Mu', unicode: 'μ' },
  { symbol: 'σ', name: 'Sigma', unicode: 'σ' },
  { symbol: 'Ω', name: 'Omega', unicode: 'Ω' },
  { symbol: '±', name: 'Más/Menos', unicode: '±' },
  { symbol: '×', name: 'Multiplicación', unicode: '×' },
  { symbol: '÷', name: 'División', unicode: '÷' },
  { symbol: '/', name: 'Fracción', unicode: '/' },
  { symbol: '≤', name: 'Menor o igual', unicode: '≤' },
  { symbol: '≥', name: 'Mayor o igual', unicode: '≥' },
  { symbol: '≠', name: 'Diferente', unicode: '≠' },
  { symbol: '≈', name: 'Aproximado', unicode: '≈' },
  { symbol: '∂', name: 'Derivada parcial', unicode: '∂' },
  { symbol: '∇', name: 'Nabla', unicode: '∇' },
  { symbol: '°', name: 'Grados', unicode: '°' },
  { symbol: '²', name: 'Superíndice ²', unicode: '²' },
  { symbol: '³', name: 'Superíndice ³', unicode: '³' },
  { symbol: '₁', name: 'Subíndice ₁', unicode: '₁' },
  { symbol: '₂', name: 'Subíndice ₂', unicode: '₂' },
]

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: null,
    url: ''
  });

  const [mathDropdown, setMathDropdown] = useState<MathDropdownState>({
    isOpen: false
  });

  const mathDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mathDropdownRef.current && !mathDropdownRef.current.contains(event.target as Node)) {
        setMathDropdown({ isOpen: false });
      }
    };

    if (mathDropdown.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mathDropdown.isOpen]);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        link: false
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-[#2F6F6D] dark:text-[#4A9B98] underline cursor-pointer hover:text-[#1F4A48] dark:hover:text-[#3A8A87]',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded border border-[#E5E7EB] dark:border-[#1F2937] max-w-full h-auto resizable-image cursor-grab hover:cursor-grab',
          draggable: false,
          style: 'display: inline-block; position: relative;'
        }
      })
      // Mathematics extension removed to prevent memory issues
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-4 text-[#1F2937] dark:text-[#F3F4F6] dark:bg-[#111827] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:ml-0'
      }
    }
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  // Add image resize functionality
  useEffect(() => {
    if (!editor) return;
    const editorElement = editor.view?.dom as HTMLElement | undefined;
    if (!editorElement) return;

    const handleMouseDown = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      if (target.tagName !== 'IMG') return;

      const img = target as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      const mouseX = mouseEvent.clientX;
      const mouseY = mouseEvent.clientY;

      // Check if click is in bottom-right corner (20px area)
      const isInBottomRightCorner = 
        mouseX > rect.right - 20 && 
        mouseY > rect.bottom - 20;

      if (!isInBottomRightCorner) return;

      const startX = mouseEvent.clientX;
      const startY = mouseEvent.clientY;
      const startWidth = img.offsetWidth;
      const startHeight = img.offsetHeight;
      const aspectRatio = startHeight / startWidth;

      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const newWidth = Math.max(50, startWidth + deltaX);
        const newHeight = newWidth * aspectRatio;

        img.style.width = newWidth + 'px';
        img.style.height = newHeight + 'px';
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    editorElement.addEventListener('mousedown', handleMouseDown as EventListener);
    return () => editorElement.removeEventListener('mousedown', handleMouseDown as EventListener);
  }, [editor]);

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
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    
    setDialogState({
      isOpen: true,
      type: 'link',
      url: '',
      selectedText
    });
  };

  const handleDialogConfirm = () => {
    if (editor) {
      if (dialogState.type === 'image' && dialogState.url.trim()) {
        // Insert image - students can resize using editor handles after insertion
        editor.chain().focus().setImage({ src: dialogState.url }).run();
      } else if (dialogState.type === 'link') {
        if (dialogState.selectedText && dialogState.url.trim()) {
          editor.chain().focus().setLink({ href: dialogState.url }).run();
        } else if (dialogState.url.trim()) {
          editor.chain().focus().insertContent(`<a href="${dialogState.url}">${dialogState.url}</a>`).run();
        }
      }
    }
    setDialogState({
      isOpen: false,
      type: null,
      url: ''
    });
  };

  const handleDialogCancel = () => {
    setDialogState({
      isOpen: false,
      type: null,
      url: ''
    });
  };

  const insertMathSymbol = (unicode: string) => {
    // Insert symbol directly into editor
    if (editor) {
      editor.chain().focus().insertContent(unicode).run();
    }
    // Keep dropdown open for inserting multiple symbols
  };

  const toggleMathDropdown = () => {
    setMathDropdown({ isOpen: !mathDropdown.isOpen });
  };

  return (
    <>
      <style>{`
        .resizable-image {
          position: relative;
        }
        .resizable-image::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, transparent 50%, #2F6F6D 50%);
          cursor: nwse-resize;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .resizable-image:hover::after {
          opacity: 1;
        }
        @media (prefers-color-scheme: dark) {
          .resizable-image::after {
            background: linear-gradient(135deg, transparent 50%, #4A9B98 50%);
          }
        }
      `}</style>
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
        <div className="relative" ref={mathDropdownRef}>
          <button
            type="button"
            onClick={toggleMathDropdown}
            className={`p-2 rounded transition flex items-center gap-1 ${mathDropdown.isOpen ? 'bg-[#2F6F6D] dark:bg-[#4A9B98] text-white' : 'text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]'}`}
            title="Insertar símbolo matemático"
          >
            ∑
          </button>

          {/* Math Symbols Dropdown */}
          {mathDropdown.isOpen && (
            <div className="absolute top-full mt-1 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg shadow-xl z-50 w-64 max-h-80 overflow-y-auto">
              <div className="p-2">
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] px-2 py-1 mb-1">
                  Símbolos matemáticos
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {MATH_SYMBOLS.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => insertMathSymbol(item.unicode)}
                      className="flex items-center justify-center p-2 rounded hover:bg-[#2F6F6D] hover:dark:bg-[#4A9B98] hover:text-white transition text-xl"
                      title={item.name}
                    >
                      {item.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

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

      {/* Dialog Modals */}
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
              {dialogState.type === 'link' && (
                <div className="mb-3 p-3 bg-[#EEF2FF] dark:bg-[#1F2937] rounded-lg">
                  <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB]">
                    {dialogState.selectedText 
                      ? `Se agregará enlace al texto: "${dialogState.selectedText.substring(0, 50)}${dialogState.selectedText.length > 50 ? '...' : ''}"`
                      : 'Consejo: Selecciona texto primero para convertirlo en enlace'}
                  </p>
                </div>
              )}

              {dialogState.type === 'image' && (
                <div className="mb-3 p-3 bg-[#EEF2FF] dark:bg-[#1F2937] rounded-lg">
                  <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB]">
                    💡 Tip: Después de insertar, arrastra la esquina inferior derecha de la imagen para redimensionarla
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                  {dialogState.type === 'image' ? 'URL de la imagen' : 'URL del enlace'}
                </label>
                <input
                  type="url"
                  value={dialogState.url}
                  onChange={(e) => setDialogState({ ...dialogState, url: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && handleDialogConfirm()}
                  placeholder={dialogState.type === 'image' ? 'https://ejemplo.com/imagen.jpg' : 'https://ejemplo.com'}
                  className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] focus:outline-none dark:bg-[#1F2937] dark:text-[#F3F4F6] text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-[#1F2937] flex justify-end gap-3">
              <button
                onClick={handleDialogCancel}
                className="px-4 py-2 text-[#1F2937] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDialogConfirm}
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
    </>
  );
}