import { Router, type IRouter, type Request } from "express";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { validateAndNormalizeReference } from "../voice/audio";
import { GenerationManager } from "../voice/manager";
import { listTags } from "../voice/tags/registry";
import { parseTaggedText, TagParseError } from "../voice/tags/parser";
import { F5TtsClient } from "../voice/f5tts/client";
import { LocalVoiceStorage } from "../voice/storage";

const router: IRouter = Router();
const storage = new LocalVoiceStorage();
const manager = new GenerationManager(storage);
const sessionSecret = process.env["SESSION_SECRET"] ?? "development-only-voice-session-secret";

function sessionOwner(req: Request, res: import("express").Response): string {
  const raw = req.headers.cookie?.match(/(?:^|;\s*)payvora_voice_session=([^;]+)/)?.[1];
  if (raw) {
    const [id, signature] = raw.split(".");
    if (id && signature) {
      const expected = createHmac("sha256", sessionSecret).update(id).digest("hex");
      if (signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return id;
    }
  }
  const id = randomUUID();
  const signature = createHmac("sha256", sessionSecret).update(id).digest("hex");
  res.setHeader("Set-Cookie", `payvora_voice_session=${id}.${signature}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000`);
  return id;
}

router.get("/voice/tags", (_req, res) => res.json({ tags: listTags() }));

router.post("/voices", async (req, res) => {
  const ownerId = sessionOwner(req, res);
  const name = String(req.header("x-voice-name") ?? "").trim();
  if (!name || name.length > 80) return void res.status(400).json({ message: "x-voice-name is required and must be 80 characters or fewer." });
  if (!Buffer.isBuffer(req.body)) return void res.status(415).json({ message: "Send reference audio bytes with an audio content type." });
  try {
    const audio = await validateAndNormalizeReference(req.body);
    const voice = await storage.saveVoice({ ownerId, name, audio, referenceText: req.header("x-reference-text")?.trim() || undefined });
    res.status(201).json({ id: voice.id, name: voice.name, referenceText: voice.referenceText, createdAt: voice.createdAt });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Reference audio upload failed." });
  }
});

router.get("/voices", async (req, res) => {
  const ownerId = sessionOwner(req, res);
  const voices = await storage.listVoices(ownerId);
  res.json({ voices: voices.map(({ id, name, referenceText, createdAt }) => ({ id, name, referenceText, createdAt })) });
});

router.delete("/voices/:id", async (req, res) => {
  const ownerId = sessionOwner(req, res);
  try {
    await storage.deleteVoice(ownerId, req.params.id);
    res.status(204).end();
  } catch {
    res.status(404).json({ message: "Voice not found." });
  }
});

router.post("/voices/:id/generate", async (req, res) => {
  const ownerId = sessionOwner(req, res);
  const body = req.body as { text?: unknown; settings?: Record<string, unknown> };
  if (typeof body?.text !== "string") return void res.status(400).json({ message: "text is required." });
  try {
    const job = await manager.create(ownerId, req.params.id, body.text, body.settings);
    res.status(202).json({ generationId: job.id, status: job.status, progress: job.progress });
  } catch (error) {
    const status = error instanceof TagParseError ? 422 : 400;
    res.status(status).json({ message: error instanceof Error ? error.message : "Generation request failed." });
  }
});

router.post("/voices/:id/preview", async (req, res) => {
  const ownerId = sessionOwner(req, res);
  const body = req.body as { text?: unknown };
  if (typeof body?.text !== "string") return void res.status(400).json({ message: "text is required." });
  try {
    const job = await manager.create(ownerId, req.params.id, body.text);
    res.status(202).json({ generationId: job.id, status: job.status, progress: job.progress });
  } catch (error) {
    res.status(422).json({ message: error instanceof Error ? error.message : "Preview request failed." });
  }
});

router.post("/audio/transcribe", async (req, res) => {
  if (!Buffer.isBuffer(req.body)) return void res.status(415).json({ message: "Send audio bytes with an audio content type." });
  try {
    const audio = await validateAndNormalizeReference(req.body);
    const text = await new F5TtsClient().transcribe(audio);
    res.json({ text });
  } catch (error) {
    res.status(503).json({ message: error instanceof Error ? error.message : "Transcription is unavailable." });
  }
});

router.get("/generation/:id", (req, res) => {
  const ownerId = sessionOwner(req, res);
  try {
    const job = manager.get(ownerId, req.params.id);
    res.json({ generationId: job.id, status: job.status, progress: job.progress, audioAvailable: job.audioAvailable, error: job.error });
  } catch {
    res.status(404).json({ message: "Generation not found." });
  }
});

router.get("/generation/:id/audio", async (req, res) => {
  const ownerId = sessionOwner(req, res);
  try {
    const job = manager.get(ownerId, req.params.id);
    if (job.status !== "completed") return void res.status(409).json({ message: "Generation is not complete." });
    const audio = await storage.readGeneration(ownerId, job.id);
    res.type("audio/wav").send(audio);
  } catch {
    res.status(404).json({ message: "Generated audio not found." });
  }
});

router.post("/voice/parse", (req, res) => {
  const body = req.body as { text?: unknown };
  if (typeof body?.text !== "string") return void res.status(400).json({ message: "text is required." });
  try {
    res.json(parseTaggedText(body.text));
  } catch (error) {
    res.status(422).json({ message: error instanceof Error ? error.message : "Tag parsing failed." });
  }
});

export default router;