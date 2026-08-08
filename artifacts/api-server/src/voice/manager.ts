import { randomUUID } from "node:crypto";
import { concatenateAudio, timeStretchAudio } from "./audio";
import { F5TtsClient } from "./f5tts/client";
import { parseTaggedText, type SpeechEvent } from "./tags/parser";
import { LocalVoiceStorage, type VoiceStorage } from "./storage";

export type GenerationJob = {
  id: string;
  ownerId: string;
  voiceId: string;
  text: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  audioAvailable: boolean;
  error?: string;
  parsed?: ReturnType<typeof parseTaggedText>;
  createdAt: string;
  completedAt?: string;
};

export class GenerationManager {
  private readonly jobs = new Map<string, GenerationJob>();
  private readonly queue: string[] = [];
  private running = false;

  constructor(private readonly storage: VoiceStorage = new LocalVoiceStorage(), private readonly f5tts = new F5TtsClient()) {}

  async create(ownerId: string, voiceId: string, text: string, settings?: Record<string, unknown>): Promise<GenerationJob> {
    const parsed = parseTaggedText(text);
    const voice = await this.storage.getVoice(ownerId, voiceId);
    const id = randomUUID();
    const job: GenerationJob = { id, ownerId, voiceId, text, status: "queued", progress: 0, audioAvailable: false, parsed, createdAt: new Date().toISOString() };
    this.jobs.set(id, job);
    this.queue.push(id);
    void this.runNext(settings);
    void voice;
    return job;
  }

  get(ownerId: string, id: string): GenerationJob {
    const job = this.jobs.get(id);
    if (!job || job.ownerId !== ownerId) throw new Error("Generation not found.");
    return job;
  }

  private async runNext(settings?: Record<string, unknown>): Promise<void> {
    if (this.running) return;
    const id = this.queue.shift();
    if (!id) return;
    this.running = true;
    const job = this.jobs.get(id);
    if (!job) {
      this.running = false;
      return this.runNext(settings);
    }
    try {
      job.status = "processing";
      const voice = await this.storage.getVoice(job.ownerId, job.voiceId);
      const referenceAudio = await this.storage.readAudio(voice);
      const parts: Buffer[] = [];
      const pauses: number[] = [];
      const requestedSettings = settings ?? {};
      const controls = {
        ...(typeof requestedSettings.speed === "number" ? { speed: requestedSettings.speed } : {}),
        ...(typeof requestedSettings.pitch === "number" ? { pitch: requestedSettings.pitch } : {}),
        ...(typeof requestedSettings.energy === "number" ? { energy: requestedSettings.energy } : {}),
        ...(typeof requestedSettings.emotion === "string" ? { emotion: requestedSettings.emotion } : {}),
      };
      const events = job.parsed?.events ?? [];
      for (let index = 0; index < events.length; index += 1) {
        const event = events[index];
        if (event.type === "pause") {
          if (parts.length > 0) {
            pauses[parts.length - 1] = event.seconds;
          }
          continue;
        }
        let audio: Buffer;
        if (event.type === "speech") {
          audio = await this.f5tts.generateSpeech({ text: event.text, referenceAudio, referenceText: voice.referenceText, controls: { ...event.controls, ...controls } });
        } else {
          audio = await this.f5tts.generateVocalEvent({ event: event.event, referenceAudio, referenceText: voice.referenceText, controls: {} });
        }
        parts.push(audio);
        pauses.push(0);
        if (event.type === "speech" && event.controls.speed) {
          parts[parts.length - 1] = await timeStretchAudio(parts[parts.length - 1], event.controls.speed);
        }
        job.progress = Math.round(((index + 1) / events.length) * 90);
      }
      const finalAudio = await concatenateAudio(parts, pauses);
      await this.storage.saveGeneration(job.ownerId, job.id, finalAudio);
      job.status = "completed";
      job.progress = 100;
      job.audioAvailable = true;
      job.completedAt = new Date().toISOString();
    } catch (error) {
      job.status = "failed";
      job.error = error instanceof Error ? error.message : "Voice generation failed.";
    } finally {
      this.running = false;
      void this.runNext(settings);
    }
  }
}