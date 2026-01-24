'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowRightIcon } from '@/components/icons/MinimalIcons';

export default function NewArticlePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    week_number: 1,
    difficulty_level: 2,
    article_type: 'divulgacion',
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'difficulty_level' || name === 'week_number'
        ? parseInt(value) 
        : value,
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Solo se permiten archivos PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('El archivo PDF no debe superar 10MB');
        return;
      }
      setPdfFile(file);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!pdfFile) {
      setError('Debes subir un archivo PDF');
      return;
    }

    try {
      setLoading(true);

      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado. Por favor inicia sesión nuevamente.');
      }

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('pdf', pdfFile);
      uploadData.append('title', formData.title);
      uploadData.append('week_number', formData.week_number.toString());
      uploadData.append('difficulty_level', formData.difficulty_level.toString());
      uploadData.append('article_type', formData.article_type);
      
      // Default values for fields that will be extracted from PDF or aren't needed
      uploadData.append('subtitle', '');
      uploadData.append('summary', 'Resumen será generado automáticamente');
      uploadData.append('estimated_reading_minutes', '15');
      uploadData.append('cognitive_axes', JSON.stringify([]));

      console.log('Uploading to backend with token...');
      
      // Use fetch to handle FormData properly with Supabase token
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('🔍 API_URL being used:', API_URL);
      console.log('🔍 NEXT_PUBLIC_API_URL from env:', process.env.NEXT_PUBLIC_API_URL);
      const response = await fetch(`${API_URL}/api/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: uploadData,
      });

      console.log('Response status:', response.status);
      
      // Try to parse response
      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('El servidor no respondió correctamente');
      }

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Error al crear artículo');
      }

      const articleId = responseData.data?.id;

      setSuccessMessage('Artículo creado exitosamente. El PDF se está procesando...');
      
      // Redirect after short delay
      setTimeout(() => {
        router.push(`/mentor/articles/${articleId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error creating article:', err);
      
      // More detailed error message
      if (err.message.includes('fetch')) {
        setError('No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo en el puerto 3001.');
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Error de red: El backend no está respondiendo. Ejecuta "npm run dev" en la carpeta backend.');
      } else if (err.message.includes('autenticado')) {
        setError(err.message);
      } else {
        setError(err.message || 'Error al crear artículo');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 bg-[#FAFAF8] dark:bg-[#0F1419]">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="!text-[#6B7280] dark:!text-[#9CA3AF] hover:!text-[#1F3A5F] dark:hover:!text-[#5B8FB9] flex items-center mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h1 className="text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9]">
          Subir Artículo de la Semana
        </h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-2">
          Sube el artículo científico en PDF para todos los estudiantes
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1f26] rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] p-8 space-y-6">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-[#DC2626] dark:border-red-800 rounded-lg p-4">
            <p className="text-[#DC2626] dark:text-red-400 font-medium mb-2">Error:</p>
            <p className="text-[#DC2626] dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Título *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Título del artículo para identificarlo"
            required
            className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
          />
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Archivo PDF * (máx. 10MB)
          </label>
          <div className="mt-2">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-[#E5E7EB] dark:border-[#1F2937] border-dashed rounded-lg cursor-pointer bg-[#FAFAF8] dark:bg-[#0F1419] hover:bg-[#F3F4F6] dark:hover:bg-[#1a1f26] transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {pdfFile ? (
                  <>
                    <svg className="w-12 h-12 mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base text-[#4B5563] dark:text-[#D1D5DB] font-medium mb-1">
                      {pdfFile.name}
                    </p>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setPdfFile(null);
                      }}
                      className="mt-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      Cambiar archivo
                    </button>
                  </>
                ) : (
                  <>
                    <svg className="w-12 h-12 mb-4 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-base text-[#1F3A5F] dark:text-[#5B8FB9]">
                      <span className="font-semibold">Clic para subir</span> o arrastra el archivo
                    </p>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Solo archivos PDF (máx. 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-2">
            El contenido del PDF será procesado automáticamente para el tutor AI
          </p>
        </div>

        {/* Grid for metadata fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Week Number */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Semana *
            </label>
            <input
              type="number"
              name="week_number"
              min="1"
              max="52"
              value={formData.week_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            />
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Número de semana del curso
            </p>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Nivel de Dificultad *
            </label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            >
              <option value={1}>1 - Básico</option>
              <option value={2}>2 - Intermedio</option>
              <option value={3}>3 - Avanzado</option>
              <option value={4}>4 - Experto</option>
            </select>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Nivel de complejidad
            </p>
          </div>

          {/* Article Type */}
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
              Tipo de Artículo *
            </label>
            <select
              name="article_type"
              value={formData.article_type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] focus:border-transparent outline-none transition-all bg-white dark:bg-[#1a1f26] text-[#1F2937] dark:text-[#F3F4F6]"
            >
              <option value="divulgacion">Divulgación</option>
              <option value="tecnico">Técnico</option>
              <option value="caso_real">Caso Real</option>
            </select>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              Categoría del artículo
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[#E5E7EB] dark:border-[#1F2937]">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 border border-[#E5E7EB] dark:border-[#1F2937] !text-[#6B7280] dark:!text-[#9CA3AF] font-medium rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#1a1f26] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !pdfFile}
            className="inline-flex items-center px-6 py-3 !bg-[#2F6F6D] !text-white font-medium rounded-lg hover:!bg-[#1F3A5F] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                Subir Artículo
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}