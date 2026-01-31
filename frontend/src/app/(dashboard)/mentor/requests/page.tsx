"use client";

import Link from "next/link";

export default function MentorRequestsPage() {
  // TODO: Replace with API data
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
          Solicitudes de Sesiones Individuales
        </h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
          Gestiona las solicitudes de sesiones individuales enviadas por los estudiantes.
        </p>
        <div className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 border border-[#E5E7EB] dark:border-[#1F2937]">
          <div className="text-center text-[#6B7280] dark:text-[#9CA3AF] py-8">
            No hay solicitudes pendientes.
          </div>
        </div>
        <div className="mt-8 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <Link href="/mentor" className="underline">Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
