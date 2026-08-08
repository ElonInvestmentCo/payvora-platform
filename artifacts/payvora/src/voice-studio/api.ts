export type VoiceSummary = {
  id: string;
  name: string;
  referenceText?: string;
  createdAt: string;
};

export type TagDefinition = {
  name: string;
  type: string;
  aliases: string[];
  description: string;
  strategy: string;
  spoken: boolean;
  separateAudioEvent: boolean;
  postProcess: boolean;
};

export async function getVoiceTags(): Promise<TagDefinition[]> {
  const response = await fetch('/api/voice/tags');
  if (!response.ok) throw new Error('Unable to load voice tags.');
  return ((await response.json()) as { tags: TagDefinition[] }).tags;
}

export async function parseVoiceText(text: string) {
  const response = await fetch('/api/voice/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const payload = await response.json() as { message?: string; events?: unknown[] };
  if (!response.ok) throw new Error(payload.message ?? 'Tag validation failed.');
  return payload;
}

export async function listVoices(): Promise<VoiceSummary[]> {
  const response = await fetch('/api/voices');
  if (!response.ok) throw new Error('Unable to load saved voices.');
  return ((await response.json()) as { voices: VoiceSummary[] }).voices;
}

export async function uploadVoice(file: File, name: string, referenceText?: string): Promise<VoiceSummary> {
  const response = await fetch('/api/voices', {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-voice-name': name,
      ...(referenceText ? { 'x-reference-text': referenceText } : {}),
    },
    body: file,
  });
  const payload = await response.json() as VoiceSummary & { message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'Voice upload failed.');
  return payload;
}

export async function generateVoice(voiceId: string, text: string, settings?: Record<string, unknown>) {
  const response = await fetch(`/api/voices/${encodeURIComponent(voiceId)}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, settings }),
  });
  const payload = await response.json() as { generationId?: string; message?: string };
  if (!response.ok || !payload.generationId) throw new Error(payload.message ?? 'Generation request failed.');
  return payload.generationId;
}

export async function getGeneration(id: string) {
  const response = await fetch(`/api/generation/${encodeURIComponent(id)}`);
  const payload = await response.json() as { status: string; progress: number; audioAvailable: boolean; error?: string; message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'Unable to read generation status.');
  return payload;
}

export function generationAudioUrl(id: string) {
  return `/api/generation/${encodeURIComponent(id)}/audio`;
}