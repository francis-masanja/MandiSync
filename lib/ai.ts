import { OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_API_KEY } from '@/lib/env';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOllama(messages: AIMessage[], options: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
} = {}): Promise<string> {
  const baseUrl = OLLAMA_BASE_URL;
  const model = options.model ?? OLLAMA_MODEL;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key if configured (for Ollama Cloud)
  if (OLLAMA_API_KEY) {
    headers['Authorization'] = `Bearer ${OLLAMA_API_KEY}`;
  }

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens ?? 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.message?.content ?? '';
}

export async function generateBookingAdvice(bookingDetails: string): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'You are an agricultural market advisor helping farmers optimize their mandi bookings. Provide concise, actionable advice.',
    },
    {
      role: 'user',
      content: `Booking details: ${bookingDetails}. What should the farmer consider?`,
    },
  ];
  return callOllama(messages, { temperature: 0.5 });
}

export async function summarizeQueueStatus(queueData: string): Promise<string> {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'Summarize the current mandi queue status for an operator dashboard. Be concise and highlight actionable items.',
    },
    {
      role: 'user',
      content: queueData,
    },
  ];
  return callOllama(messages, { temperature: 0.3 });
}