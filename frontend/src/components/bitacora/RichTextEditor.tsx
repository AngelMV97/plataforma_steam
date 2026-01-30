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

interface DialogState {
  isOpen: boolean;
  type: 'link' | 'image' | 'math' | null;
  url: string;
  imageFile?: File | null;
  imageWidth?: string;
  imageHeight?: string;
  selectedText?: string;
}

const MATH_SYMBOLS = [
  { symbol: '∑', name: 'Sumatoria', latex: '\\sum' },
  { symbol: '∫', name: 'Integral', latex: '\\int' },
  { symbol: '√', name: 'Raíz cuadrada', latex: '\\sqrt{}' },
  { symbol: '∞', name: 'Infinito', latex: '\\infty' },
  { symbol: 'π', name: 'Pi', latex: '\\pi' },
  { symbol: 'α', name: 'Alfa', latex: '\\alpha' },
  { symbol: 'β', name: 'Beta', latex: '\\beta' },
  { symbol: 'γ', name: 'Gamma', latex: '\\gamma' },
  { symbol: 'Δ', name: 'Delta', latex: '\\Delta' },
  { symbol: 'θ', name: 'Theta', latex: '\\theta' },
  { symbol: 'λ', name: 'Lambda', latex: '\\lambda' },
  { symbol: 'μ', name: 'Mu', latex: '\\mu' },
  { symbol: 'σ', name: 'Sigma', latex: '\\sigma' },
  { symbol: 'Ω', name: 'Omega', latex: '\\Omega' },
  { symbol: '±', name: 'Más/Menos', latex: '\\pm' },
  { symbol: '×', name: 'Multiplicación', latex: '\\times' },
  { symbol: '÷', name: 'División', latex: '\\div' },
  { symbol: '≤', name: 'Menor o igual', latex: '\\leq' },
  { symbol: '≥', name: 'Mayor o igual', latex: '\\geq' },
  { symbol: '≠', name: 'Diferente', latex: '\\neq' },
  { symbol: '≈', name: 'Aproximado', latex: '\\approx' },
  { symbol: '∂', name: 'Derivada parcial', latex: '\\partial' },
  { symbol: '∇', name: 'Nabla', latex: '\\nabla' },
  { symbol: '°', name: 'Grados', latex: '^\\circ' },
  { symbol: 'x²', name: 'Potencia', latex: 'x^{2}' },
  { symbol: 'x₁', name: 'Subíndice', latex: 'x_{1}' },
  { symbol: '⁄', name: 'Fracción', latex: '\\frac{}{}' },
]

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: null,
    url: '',
    imageFile: null,
    imageWidth: '400',
    imageHeight: 'auto'
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

  if (!editor) {
    return null;
  }

  const addImage = () => {
    setDialogState({
      isOpen: true,
      type: 'image',
      url: '',
      imageFile: null,
      imageWidth: '400',
      imageHeight: 'auto'
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

  const openMathDialog = () => {
    setDialogState({
      isOpen: true,
      type: 'math',
      url: ''
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setDialogState({ ...dialogState, url: base64, imageFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDialogConfirm = () => {
    if (editor) {
      if (dialogState.type === 'image' && dialogState.url.trim()) {
        // Insert image with dimensions as HTML
        const width = dialogState.imageWidth !== 'auto' ? dialogState.imageWidth : '';
        const height = dialogState.imageHeight !== 'auto' ? dialogState.imageHeight : '';
        const imgTag = `<img src="${dialogState.url}" ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''} />`;
        editor.chain().focus().insertContent(imgTag).run();
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
      url: '',
      imageFile: null,
      imageWidth: '400',
      imageHeight: 'auto'
    });
  };

  const handleDialogCancel = () => {
    setDialogState({
      isOpen: false,
      type: null,
      url: '',
      imageFile: null,
      imageWidth: '400',
      imageHeight: 'auto'
    });
  };

  const insertMathSymbol = (latex: string) => {
    if (editor) {
      editor.chain().focus().insertContent(`$${latex}$`).run();
    }
    handleDialogCancel();
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
          onClick={openMathDialog}
          className="p-2 rounded transition flex items-center gap-1 text-[#1F2937] dark:text-[#F3F4F6] hover:bg-[#F3F4F6] dark:hover:bg-[#1F2937]"
          title="Insertar símbolo matemático"
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

      {/* Dialog Modals */}
      {dialogState.isOpen && dialogState.type !== 'math' && (
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
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                      Subir desde tu dispositivo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] focus:outline-none dark:bg-[#1F2937] dark:text-[#F3F4F6] text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2F6F6D] file:text-white hover:file:bg-[#1F4A48]"
                    />
                    {dialogState.imageFile && (
                      <p className="text-xs text-[#2F6F6D] dark:text-[#4A9B98] mt-1">✓ {dialogState.imageFile.name}</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E7EB] dark:border-[#1F2937]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white dark:bg-[#111827] text-[#6B7280] dark:text-[#9CA3AF]">o desde URL</span>
                    </div>
                  </div>
                </>
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
                  autoFocus={dialogState.type === 'link'}
                />
              </div>

              {dialogState.type === 'image' && dialogState.url && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                        Ancho (px)
                      </label>
                      <input
                        type="text"
                        value={dialogState.imageWidth}
                        onChange={(e) => setDialogState({ ...dialogState, imageWidth: e.target.value })}
                        placeholder="400 o auto"
                        className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] focus:outline-none dark:bg-[#1F2937] dark:text-[#F3F4F6] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F3F4F6] mb-2">
                        Alto (px)
                      </label>
                      <input
                        type="text"
                        value={dialogState.imageHeight}
                        onChange={(e) => setDialogState({ ...dialogState, imageHeight: e.target.value })}
                        placeholder="auto"
                        className="w-full px-3 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] focus:outline-none dark:bg-[#1F2937] dark:text-[#F3F4F6] text-sm"
                      />
                    </div>
                  </div>
                  {dialogState.url && (
                    <div className="mt-2">
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2">Vista previa:</p>
                      <img 
                        src={dialogState.url} 
                        alt="Preview" 
                        className="max-w-full h-auto rounded border border-[#E5E7EB] dark:border-[#1F2937]"
                        style={{ 
                          maxWidth: dialogState.imageWidth !== 'auto' ? `${dialogState.imageWidth}px` : '100%',
                          maxHeight: '200px'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </>
              )}
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

      {/* Math Symbols Dialog */}
      {dialogState.isOpen && dialogState.type === 'math' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#1F2937] sticky top-0 bg-white dark:bg-[#111827] z-10">
              <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                Símbolos Matemáticos y Físicos
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                Haz clic en un símbolo para insertarlo en tu texto
              </p>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {MATH_SYMBOLS.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => insertMathSymbol(item.latex)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] hover:bg-[#2F6F6D] hover:dark:bg-[#4A9B98] hover:text-white hover:border-[#2F6F6D] dark:hover:border-[#4A9B98] transition group"
                    title={item.name}
                  >
                    <span className="text-2xl mb-1">{item.symbol}</span>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-white">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-[#1F2937] flex justify-end gap-3">
              <button
                onClick={handleDialogCancel}
                className="px-4 py-2 text-[#1F2937] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1F2937] transition text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}