import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  type RemoteAudioTrack,
  type LocalAudioTrack,
  createLocalAudioTrack,
} from "livekit-client";
import { Orb, type OrbState } from "./Orb";
import { useConnection } from "@/lib/connection-context";
import { useAuth } from "@/lib/auth-context";

interface TokenResponse {
  url: string;
  token: string;
}

type Transcript = { id: string; role: "user" | "assistant"; text: string; final: boolean };

const STATE_LABELS: Record<OrbState, string> = {
  idle: "Tap to speak",
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Responding",
};

export function VoiceConsole() {
  const [state, setState] = useState<OrbState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [muted, setMuted] = useState(false);
  const { setStatus } = useConnection();
  const { user } = useAuth();

  const roomRef = useRef<Room | null>(null);
  const localTrackRef = useRef<LocalAudioTrack | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const isLive = state !== "idle" && state !== "connecting";

  const meter = useCallback((source: MediaStreamTrack) => {
    const ctx = new AudioContext();
    const stream = new MediaStream([source]);
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      setAudioLevel(Math.min(1, rms * 4));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const stop = useCallback(async () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);

    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current = null;
    }
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setState("idle");
    setStatus("disconnected");
  }, [setStatus]);

  const start = useCallback(async () => {
    setError(null);
    setTranscripts([]);
    setState("connecting");
    setStatus("connecting");

    try {
      const res = await fetch(`/api/token?user=${encodeURIComponent(user?.google_id || "user")}`, { method: "POST" });
      if (!res.ok) throw new Error(`Token endpoint returned ${res.status}`);
      const { url, token } = (await res.json()) as TokenResponse;
      if (!url || !token) throw new Error("Invalid token response");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.Disconnected, () => {
        setState("idle");
        setStatus("disconnected");
      });

      room.on(RoomEvent.TrackSubscribed, (track) => {
        console.log("Received TrackSubscribed event!", track.kind);
        if (track.kind === Track.Kind.Audio) {
          console.log("Track is Audio! Attaching to DOM...");
          const audioEl = (track as RemoteAudioTrack).attach();
          audioEl.style.display = "none";
          document.body.appendChild(audioEl);
          
          // Force play and catch autoplay errors
          audioEl.play().catch(e => {
            console.error("Autoplay blocked! Attempting LiveKit startAudio()...", e);
            room.startAudio().catch(err => console.error("startAudio failed too:", err));
          });
          
          // Remote audio track subscribed = full pipeline is live
          setStatus("connected");
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const localId = room.localParticipant.identity;
        const remoteSpeaking = speakers.some((s) => s.identity !== localId);
        const localSpeaking = speakers.some((s) => s.identity === localId);
        if (remoteSpeaking) setState("speaking");
        else if (localSpeaking) setState("listening");
        else setState((s) => (s === "speaking" ? "thinking" : s));
      });

      room.on(RoomEvent.DataReceived, (payload) => {
        try {
          const msg = JSON.parse(new TextDecoder().decode(payload));
          if (msg?.type === "transcript" && msg.text) {
            setTranscripts((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && !last.final && last.role === msg.role) {
                last.text = msg.text;
                last.final = !!msg.final;
                return next;
              }
              return [...next, { id: crypto.randomUUID(), role: msg.role, text: msg.text, final: !!msg.final }];
            });
          }
        } catch {
          /* ignore non-JSON data */
        }
      });

      await room.connect(url, token);
      const track = await createLocalAudioTrack({ echoCancellation: true, noiseSuppression: true });
      localTrackRef.current = track;
      await room.localParticipant.publishTrack(track);
      meter(track.mediaStreamTrack);

      setState("listening");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
      setState("idle");
      setStatus("disconnected");
    }
  }, [meter, setStatus]);

  const toggleMute = useCallback(async () => {
    const track = localTrackRef.current;
    if (!track) return;
    if (muted) {
      await track.unmute();
    } else {
      await track.mute();
    }
    setMuted(!muted);
  }, [muted]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return (
    <div className="flex w-full flex-col items-center gap-12">
      <Orb state={state} audioLevel={audioLevel} />

      <div className="flex flex-col items-center gap-1 fade-up">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {STATE_LABELS[state]}
        </p>
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={isLive || state === "connecting" ? stop : start}
          disabled={state === "connecting"}
          className="group relative inline-flex items-center justify-center rounded-full bg-foreground px-8 py-3.5 text-sm font-medium text-background transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {state === "connecting" ? "Connecting…" : isLive ? "End session" : "Begin"}
        </button>

        {isLive && (
          <button
            onClick={toggleMute}
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-accent"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            {muted ? "Unmute" : "Mute"}
          </button>
        )}
      </div>

      {transcripts.length > 0 && (
        <div className="mt-4 w-full max-w-xl space-y-3 fade-up">
          {transcripts.slice(-6).map((t) => (
            <div
              key={t.id}
              className={`rounded-3xl px-5 py-3 text-sm leading-relaxed ${
                t.role === "user"
                  ? "ml-auto max-w-[80%] bg-secondary text-secondary-foreground"
                  : "mr-auto max-w-[80%] bg-card text-card-foreground"
              }`}
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
