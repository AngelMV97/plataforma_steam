"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, ArrowRightIcon } from "@/components/icons/MinimalIcons";

export default function MentorMaterialsPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/mentor/sessions");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Info Banner */}
        <div className="bg-[#E0F2FE] dark:bg-blue-900/20 border-2 border-[#0369A1] dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="w-6 h-6 text-[#0369A1] dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-serif text-xl font-semibold text-[#0369A1] dark:text-blue-300 mb-2">
                Esta página se ha movido
              </h2>
              <p className="text-sm text-[#0c4a6e] dark:text-blue-200 mb-4">
                La funcionalidad de subir materiales ahora está integrada en la página de <strong>Sesiones</strong>, 
                bajo la pestaña "Subir Materiales". Serás redirigido automáticamente en 5 segundos.
              </p>
              <button
                onClick={() => router.push("/mentor/sessions")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2F6F6D] text-white rounded-lg font-medium text-sm hover:bg-[#1F3A5F] transition-colors"
              >
                <ArrowRightIcon className="w-4 h-4" />
                Ir a Sesiones ahora
              </button>
            </div>
          </div>
        </div>

        {/* Old form grayed out */}
        <div className="opacity-40 pointer-events-none">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
            Registrar Materiales de Sesión
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
            Sube el enlace a la carpeta de Drive con los materiales, guía y grabación de la sesión.
          </p>
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 space-y-6 border border-[#E5E7EB] dark:border-[#1F2937]">
            <div>
              <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Enlace a Carpeta de Materiales</label>
              <input
                type="url"
                className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                placeholder="https://drive.google.com/drive/folders/..."
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Tema</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                placeholder="Ejemplo: Integrales definidas"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Fecha de Sesión</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Notas</label>
              <textarea
                className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
                rows={3}
                placeholder="Detalles adicionales sobre la sesión o materiales."
                disabled
              />
            </div>
            <button
              disabled
              className="w-full py-2 px-4 bg-[#2F6F6D] text-white font-semibold rounded-lg opacity-60 cursor-not-allowed"
            >
              Registrar Materiales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
