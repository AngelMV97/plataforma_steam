import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8 px-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Academia STEM
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
            Formación en pensamiento matemático y científico para la vida universitaria y profesional
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/login"
            className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg bg-white text-indigo-600 font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Registrarse
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Pensamiento Profundo
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Desarrolla razonamiento científico, no solo memorización
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Tutor Cognitivo IA
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Asistencia personalizada que te ayuda a pensar, no a copiar
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Progreso Cualitativo
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Sin notas, con retroalimentación sobre tu proceso de pensamiento
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}