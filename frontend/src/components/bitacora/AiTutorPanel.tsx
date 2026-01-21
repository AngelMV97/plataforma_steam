'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

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
      alert('Error al enviar mensaje. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-[calc(100vh-200px)] sticky top-24">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tutor AI</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Aquí para guiarte
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Cargando conversación...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-3 block">💬</span>
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
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.tutor_message}</p>
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{new Date(message.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.cognitive_dimension && message.role === 'tutor' && (
                      <span className="ml-2 px-2 py-0.5 bg-white/20 rounded">
                        {message.cognitive_dimension}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
              placeholder="Pregunta al tutor..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            💡 Sección actual: <span className="font-medium">{currentSection}</span>
          </p>
        </div>
      )}
    </div>
  );
}