'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { AlertCircleIcon, CheckCircleIcon, BarChartIcon, BookOpenIcon } from '@/components/icons/MinimalIcons';

interface Message {
  id: string;
  role: 'student' | 'tutor';
  tutor_message: string;
  timestamp: string;
  bitacora_section: string;
  cognitive_dimension?: string;
}

interface Props {
  attemptId: string;
  currentSection: string;
  isReadOnly: boolean;
}


export default function AiTutorPanel({ attemptId, currentSection, isReadOnly }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [attemptId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages() {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/api/attempts/${attemptId}/interactions`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await api.post(`/api/attempts/${attemptId}/chat`, {
        message: userMessage,
        bitacora_section: currentSection
      });

      // Add both student and tutor messages
      setMessages(prev => [
        ...prev,
        response.data.studentMessage,
        response.data.tutorResponse
      ]);
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'No se pudo enviar el mensaje. Por favor, verifica tu conexión e intenta nuevamente.');
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="bg-white dark:bg-[#111827] rounded-lg shadow flex flex-col h-[calc(100vh-200px)] sticky top-24">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#1F2937]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#2F6F6D] dark:bg-[#4A9B98] rounded-full flex items-center justify-center">
            <BarChartIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1F2937] dark:text-[#F3F4F6]">Tutor AI</h3>
            <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB]">
              Aquí para guiarte
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-[#FEF3C7] dark:bg-[#78350F] border border-[#FCD34D] dark:border-[#92400E] rounded-lg flex items-start gap-2">
          <AlertCircleIcon className="w-4 h-4 text-[#D97706] dark:text-[#FBBF24] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#D97706] dark:text-[#FBBF24]">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F6F6D] dark:border-[#4A9B98] mx-auto"></div>
              <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mt-2">Cargando conversación...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-[#4B5563] dark:text-[#D1D5DB]">
              <BookOpenIcon className="w-12 h-12 mb-3 mx-auto text-[#2F6F6D] dark:text-[#4A9B98]" />
              <p className="text-sm">No hay mensajes aún.</p>
              <p className="text-xs mt-2">
                ¡Pregunta algo para comenzar!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'student'
                      ? 'bg-[#1F3A5F] dark:bg-[#5B8FB9] text-white'
                      : 'bg-[#F9FAFB] dark:bg-[#111827] text-[#1F2937] dark:text-[#F3F4F6]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.tutor_message}</p>
                  <div className={`flex items-center justify-between mt-2 text-xs ${message.role === 'student' ? 'opacity-70' : 'text-[#4B5563] dark:text-[#D1D5DB]'}`}>
                    <span>{new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.cognitive_dimension && message.role === 'tutor' && (
                      <span className={`ml-2 px-2 py-0.5 rounded bg-[#2F6F6D]/10 dark:bg-[#4A9B98]/10 text-[#2F6F6D] dark:text-[#4A9B98]`}>
                        {message.cognitive_dimension}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F9FAFB] dark:bg-[#111827] rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#2F6F6D] dark:bg-[#4A9B98] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#2F6F6D] dark:bg-[#4A9B98] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#2F6F6D] dark:bg-[#4A9B98] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {!isReadOnly && (
        <div className="px-6 py-4 border-t border-[#E5E7EB] dark:border-[#1F2937]">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
              placeholder="Pregunta al tutor..."
              className="flex-1 px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-[#1F2937] focus:ring-2 focus:ring-[#2F6F6D] dark:focus:ring-[#4A9B98] focus:outline-none dark:bg-[#111827] dark:text-[#F3F4F6] text-sm text-[#1F2937] placeholder-[#4B5563] dark:placeholder-[#D1D5DB]"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-[#2F6F6D] dark:bg-[#4A9B98] text-white rounded-lg hover:bg-[#1F4A48] dark:hover:bg-[#3A8A87] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] mt-2">
            <CheckCircleIcon className="w-4 h-4 inline-block mr-1 text-[#2F6F6D] dark:text-[#4A9B98]" />
            Sección actual: <span className="font-medium">{currentSection}</span>
          </p>
        </div>
      )}
    </div>
  );
}