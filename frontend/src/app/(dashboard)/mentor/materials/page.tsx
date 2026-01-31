"use client";

import { useState } from "react";
import Link from "next/link";

export default function MentorMaterialsPage() {
  const [folderUrl, setFolderUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    // TODO: Replace with API call
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setFolderUrl("");
      setTopic("");
      setSessionDate("");
      setNotes("");
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0F1419]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F3A5F] dark:text-[#5B8FB9] mb-2">
          Registrar Materiales de Sesión
        </h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-6">
          Sube el enlace a la carpeta de Drive con los materiales, guía y grabación de la sesión.
        </p>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1f26] rounded-lg shadow p-6 space-y-6 border border-[#E5E7EB] dark:border-[#1F2937]">
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Enlace a Carpeta de Materiales</label>
            <input
              type="url"
              value={folderUrl}
              onChange={e => setFolderUrl(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
              placeholder="https://drive.google.com/drive/folders/..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Tema</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
              placeholder="Ejemplo: Integrales definidas"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Fecha de Sesión</label>
            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F3A5F] dark:text-[#5B8FB9] mb-1">Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] dark:border-[#1F2937] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] bg-[#F9FAFB] dark:bg-[#0F1419] text-[#1F3A5F] dark:text-[#5B8FB9]"
              rows={3}
              placeholder="Detalles adicionales sobre la sesión o materiales."
            />
          </div>
          {error && <p className="text-sm text-[#DC2626] dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-[#2F6F6D] dark:text-[#4A9B98]">¡Materiales registrados!</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-[#2F6F6D] text-white font-semibold rounded-lg hover:bg-[#1F3A5F] transition-colors disabled:opacity-60"
          >
            {submitting ? "Registrando..." : "Registrar Materiales"}
          </button>
        </form>
        <div className="mt-8 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <Link href="/mentor" className="underline">Volver al Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
