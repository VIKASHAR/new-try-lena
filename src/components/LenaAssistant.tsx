import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MicOff, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type LenaStatus = 'idle' | 'listening' | 'wake-detected' | 'processing' | 'speaking';

// ─────────────────────────────────────────────
// LenaAssistant Component
// ─────────────────────────────────────────────
export const LenaAssistant: React.FC = () => {
  const navigate    = useNavigate();
  const location    = useLocation();

  // ── UI state ──
  const [status,       setStatus]       = useState<LenaStatus>('idle');
  const [transcript,   setTranscript]   = useState('');
  const [lenaResponse, setLenaResponse] = useState('Click anywhere to activate Lena...');
  const [error,        setError]        = useState<string | null>(null);

  // ── Refs shared across closures ──
  const recognitionRef       = useRef<any>(null);
  const voiceRef             = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef         = useRef<SpeechSynthesisUtterance | null>(null);
  const statusRef            = useRef<LenaStatus>('idle');
  const isActivatedRef       = useRef(false);
  const awaitingCommandRef   = useRef(false);
  const awaitingTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pipelineTimersRef    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resumeIntervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // Latest navigate / pathname accessible from stable closures
  const navigateRef          = useRef(navigate);
  const pathnameRef          = useRef(location.pathname);
  useEffect(() => { navigateRef.current  = navigate;          }, [navigate]);
  useEffect(() => { pathnameRef.current  = location.pathname; }, [location.pathname]);

  // ── Helper: keep status state & ref in sync ──
  const setStatusBoth = useCallback((s: LenaStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ════════════════════════════════════════════
  // VOICE LOADING  (female-first priority list)
  // ════════════════════════════════════════════
  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Priority order – best female voices for Chrome / Edge on Windows & Mac
      const PRIORITY = [
        'Google UK English Female',
        'Microsoft Aria Online (Natural) - English (United States)',
        'Microsoft Aria - English (United States)',
        'Microsoft Zira - English (United States)',
        'Samantha',   // macOS Safari / Chrome
        'Victoria',   // macOS
        'Karen',      // macOS Australian
        'Moira',      // macOS Irish
        'Fiona',      // macOS Scottish
        'Google US English',
      ];

      let selected: SpeechSynthesisVoice | undefined;
      for (const name of PRIORITY) {
        selected = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (selected) break;
      }
      // Fallback 1: any English voice with "female" / "woman" in its name
      if (!selected) selected = voices.find(v => v.lang.startsWith('en') && /female|woman/i.test(v.name));
      // Fallback 2: any en-US / en-GB voice
      if (!selected) selected = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
      // Fallback 3: any English voice
      if (!selected) selected = voices.find(v => v.lang.startsWith('en'));

      voiceRef.current = selected ?? null;
      console.log('[Lena] Voice selected:', voiceRef.current?.name ?? 'browser default');
    };

    window.speechSynthesis.onvoiceschanged = loadVoice;
    loadVoice();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // ════════════════════════════════════════════
  // SPEAK
  // – Does NOT stop recognition (keeps "stop" always listenable)
  // – Chrome 15-second TTS bug workaround via setInterval
  // ════════════════════════════════════════════
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    // Cancel any in-flight speech
    window.speechSynthesis.cancel();
    if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // prevent GC in Chrome

    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.pitch  = 1.15;  // slightly higher = more feminine
    utterance.rate   = 1.0;
    utterance.volume = 1.0;

    setStatusBoth('speaking');
    setLenaResponse(text);

    // Chrome silently stops TTS after ~15 s – keep it alive
    resumeIntervalRef.current = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 8_000);

    const onDone = () => {
      if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
      // Return to listening only if we're still the current speech
      if (isActivatedRef.current && statusRef.current === 'speaking') {
        setStatusBoth('listening');
      }
    };

    utterance.onend   = onDone;
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') console.warn('[Lena] TTS error:', e.error);
      onDone();
    };

    window.speechSynthesis.speak(utterance);
  }, [setStatusBoth]);

  // ════════════════════════════════════════════
  // STOP EVERYTHING
  // – Cancels TTS, pipeline timers, awaiting state
  // – Stays in listening mode (does NOT speak, avoids "stop" echo loop)
  // ════════════════════════════════════════════
  const stopEverything = useCallback(() => {
    window.speechSynthesis.cancel();
    if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
    if (awaitingTimerRef.current)  clearTimeout(awaitingTimerRef.current);
    awaitingCommandRef.current = false;
    pipelineTimersRef.current.forEach(clearTimeout);
    pipelineTimersRef.current = [];

    if (isActivatedRef.current) {
      setStatusBoth('listening');
      setTranscript('');
      setLenaResponse('Stopped. Ready for your next command.');
    }
  }, [setStatusBoth]);

  // ════════════════════════════════════════════
  // PROCESS COMMAND  (Groq API)
  // ════════════════════════════════════════════
  const processCommand = useCallback(async (text: string) => {
    if (!text.trim() || statusRef.current === 'processing') return;

    setStatusBoth('processing');
    setTranscript(text);
    awaitingCommandRef.current = false;
    if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      speak("I'm sorry, my AI processing is disabled — the API key is missing.");
      return;
    }

    try {
      const pageElements = Array.from(
        document.querySelectorAll('button, a, [role="button"]')
      )
        .map(el => el.textContent?.trim())
        .filter((t): t is string => !!t && t.length < 60)
        .slice(0, 25)
        .join(', ');

      const systemPrompt = `You are "Lena", a professional female voice assistant for the LENA Platform at Linde PLC.
Current page path: ${pathnameRef.current}
Interactive elements visible: ${pageElements || 'None detected'}

Available navigation routes:
/supply-chain, /manufacturing, /commercial, /finance, /hr, /it,
/assistant, /settings, /vision-panel, /nurostack, /nuromodels, /nuroforge

Parse the user's voice command and return a JSON object.

CRITICAL RULES:
1. "response" is ALWAYS mandatory — it is what Lena speaks aloud. Keep it 1–2 warm, professional sentences.
2. For navigation: type="NAVIGATE", payload=the exact route path.
3. For clicking a button: type="CLICK", payload=exact button label.
4. For page summary: type="SUMMARIZE".
5. For greetings / general questions: type="CHAT".
6. Every action MUST have a spoken verbal confirmation in "response".
7. Never leave "response" empty or null.

Return strict JSON only — no markdown, no prose:
{
  "type": "NAVIGATE" | "CLICK" | "SUMMARIZE" | "CHAT",
  "payload": "route path or button label or null",
  "response": "What Lena will say (MANDATORY)"
}`;

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:           GROQ_MODEL,
          temperature:     0.3,
          messages:        [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: text },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) throw new Error(`Groq API ${res.status}`);

      const data   = await res.json();
      const action = JSON.parse(data.choices[0].message.content);

      // ① Speak the confirmation first (always)
      speak(action.response || 'Done.');

      // ② Execute the action after a short pause
      setTimeout(() => {
        switch (action.type) {
          case 'NAVIGATE':
            if (action.payload) navigateRef.current(action.payload);
            break;

          case 'CLICK': {
            if (!action.payload) break;
            const els    = Array.from(document.querySelectorAll('button, a, [role="button"]'));
            const target = els.find(el =>
              el.textContent?.toLowerCase().includes(action.payload.toLowerCase())
            ) as HTMLElement | undefined;
            if (target) {
              target.click();
            } else {
              // Delay error speech so it doesn't overlap current speech
              setTimeout(() => speak(`I couldn't find a button labelled "${action.payload}". Please try again.`), 600);
            }
            break;
          }

          case 'SUMMARIZE': {
            const content = (document.querySelector('main') as HTMLElement | null)?.innerText
              ?? document.body.innerText;
            getSummaryFromGroq(content.slice(0, 5_000)).then(speak);
            break;
          }

          // CHAT — response already spoken
          default:
            break;
        }
      }, 250);

    } catch (err) {
      console.error('[Lena] Command error:', err);
      speak('I encountered an error while processing your request. Please try again.');
    }
  }, [speak, setStatusBoth]);

  // ─── Groq summarisation ───────────────────
  const getSummaryFromGroq = async (content: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model:    GROQ_MODEL,
          messages: [
            {
              role:    'system',
              content: 'You are Lena, a professional female assistant. Summarise this page content in 2–3 clear sentences suitable for voice delivery. Be concise and informative.',
            },
            { role: 'user', content: content },
          ],
        }),
      });
      const data = await res.json();
      return data.choices[0].message.content as string;
    } catch {
      return 'I was unable to summarise the page content at this time.';
    }
  };

  // ─── Keep callback refs fresh for the stable recognition closure ───
  const processCommandRef  = useRef(processCommand);
  const stopEverythingRef  = useRef(stopEverything);
  const speakRef           = useRef(speak);
  useEffect(() => { processCommandRef.current = processCommand; }, [processCommand]);
  useEffect(() => { stopEverythingRef.current = stopEverything; }, [stopEverything]);
  useEffect(() => { speakRef.current          = speak;          }, [speak]);

  // ════════════════════════════════════════════
  // SPEECH RECOGNITION  (runs exactly ONCE)
  //
  // Key design decisions:
  //  • continuous=true — never manually stopped from onresult
  //    (stopping causes a ~200 ms gap that swallows the real command
  //     after "Hey Lena" — this was the original bug)
  //  • "stop" is checked BEFORE any status gate so it always fires
  //  • isSpeaking is gated via statusRef (recognition keeps running
  //    for echo-cancel; Chrome's built-in AEC handles the mic)
  //  • Wake word: set awaitingCommand flag, do NOT stop recognition,
  //    so the following command utterance is captured immediately
  // ════════════════════════════════════════════
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setError('Speech recognition not supported — please use Chrome or Edge.');
      return;
    }

    const recognition = new SR() as any;
    recognition.continuous      = true;   // never auto-stop
    recognition.interimResults  = true;   // get partial results
    recognition.lang            = 'en-US';
    recognition.maxAlternatives = 1;
    recognitionRef.current      = recognition;

    // ── onresult ─────────────────────────────
    recognition.onresult = (event: any) => {
      let finalT  = '';
      let interimT = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const t = event.results[i][0].transcript as string;
        if (event.results[i].isFinal) finalT   += t;
        else                          interimT  += t;
      }

      const combined = (finalT || interimT).toLowerCase().trim();

      // ① STOP — always active, even while Lena is speaking
      if (combined.includes('stop')) {
        stopEverythingRef.current();
        return;
      }

      // ② Gate: ignore everything else while speaking or processing
      if (statusRef.current === 'speaking' || statusRef.current === 'processing') return;

      // ③ Only act on final (confirmed) transcripts from here
      if (!finalT.trim()) return;
      const lower = finalT.toLowerCase().trim();

      // ④ Wake-word detection: "hey/hi/ok/hello/oi lena"
      //    Regex captures any command that follows the wake word in the SAME utterance
      const wakeMatch = lower.match(
        /^(?:hey|hi|ok|okay|hello|oi)\s+lena[,.\s]*(.*)/i
      );
      if (wakeMatch) {
        const cmdPart = wakeMatch[1].trim();
        if (cmdPart.length > 2) {
          // e.g. "Hey Lena, go to finance" — process inline, no restart needed
          processCommandRef.current(cmdPart);
        } else {
          // Just "Hey Lena" alone — set flag and show visual cue
          // Do NOT stop/restart recognition — that caused the gap bug
          awaitingCommandRef.current = true;
          statusRef.current = 'wake-detected';
          setStatus('wake-detected');
          setLenaResponse("Yes? I'm listening...");

          // Timeout: if no command arrives in 5 s, prompt gently
          if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
          awaitingTimerRef.current = setTimeout(() => {
            if (awaitingCommandRef.current) {
              awaitingCommandRef.current = false;
              statusRef.current = 'listening';
              setStatus('listening');
              speakRef.current("I'm here whenever you're ready. Just say your command.");
            }
          }, 5_000);
        }
        return;
      }

      // ⑤ Awaiting command after wake word (user said "Hey Lena" then paused)
      if (awaitingCommandRef.current) {
        awaitingCommandRef.current = false;
        if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
        processCommandRef.current(finalT.trim());
        return;
      }

      // ⑥ Direct command (no wake word required)
      //    Noise filter: only process if a recognisable command keyword is present
      const isCommand = /\b(go to|navigate|open|click|press|show me|take me|what|who|how|help|summarize|summarise|initialize|start|proceed|settings|finance|supply|manufacturing|commercial|assistant|dashboard|hr|logout|log out)\b/i.test(lower);
      if (isCommand) {
        processCommandRef.current(finalT.trim());
      }
    };

    // ── onerror ───────────────────────────────
    recognition.onerror = (event: any) => {
      const { error } = event as { error: string };
      // These are harmless / expected
      if (error === 'aborted' || error === 'no-speech') return;
      if (error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone and refresh.');
        isActivatedRef.current = false;
        statusRef.current = 'idle';
        setStatus('idle');
        return;
      }
      console.warn('[Lena] Recognition error:', error);
    };

    // ── onend — indestructible restart ────────
    // Fires whenever continuous recognition closes (timeout, error, etc.)
    recognition.onend = () => {
      if (isActivatedRef.current) {
        setTimeout(() => {
          if (isActivatedRef.current) {
            try { recognition.start(); } catch (_) {}
          }
        }, 200);
      }
    };

    // ── First-interaction gate (browser autoplay/mic policy) ──
    const activate = () => {
      if (isActivatedRef.current) return;
      isActivatedRef.current = true;
      statusRef.current = 'listening';
      setStatus('listening');
      setLenaResponse("Hello! I'm Lena. How can I help you today?");

      try { recognition.start(); } catch (_) {}

      // Greet after recognition has had time to initialise
      setTimeout(() => {
        speakRef.current(
          "Hello! I'm Lena, your LENA Platform voice assistant. How can I help you today?"
        );
      }, 600);

      window.removeEventListener('click',      activate);
      window.removeEventListener('keydown',    activate);
      window.removeEventListener('touchstart', activate);
    };

    window.addEventListener('click',      activate);
    window.addEventListener('keydown',    activate);
    window.addEventListener('touchstart', activate);

    return () => {
      window.removeEventListener('click',      activate);
      window.removeEventListener('keydown',    activate);
      window.removeEventListener('touchstart', activate);
      isActivatedRef.current = false;
      try { recognition.stop(); } catch (_) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty — all callbacks accessed via refs

  // ════════════════════════════════════════════
  // PIPELINE VOICE NARRATION
  // ════════════════════════════════════════════
  useEffect(() => {
    const SCRIPT: { delay: number; text: string }[] = [
      { delay:     0, text: 'Initializing LENA Agent Pipeline. All systems are online.' },
      { delay:   800, text: 'Telemetry Agent activated. Tank levels gathered and analysed.' },
      { delay:  6000, text: 'Demand and Allocation Agent engaged. Forecasting supply needs across all regions.' },
      { delay: 11000, text: 'Pricing Optimisation Agent online. Calculating the best fuel rates.' },
      { delay: 18000, text: 'Plant and Logistics Allocation Agent deployed. Assigning efficient plant, tanker, and driver resources.' },
      { delay: 23000, text: 'Route Optimisation Agent launched. Finding the fastest and most efficient delivery path.' },
      { delay: 31000, text: 'Risk Agent standing by. Evaluating financial exposure and compliance risks.' },
      { delay: 37000, text: 'LENA Orchestrator taking control. Consolidating all agent outputs.' },
      { delay: 42500, text: 'Pipeline complete. All agents executed successfully. Results are ready for your review.' },
    ];

    const onPipelineStart = () => {
      pipelineTimersRef.current.forEach(clearTimeout);
      pipelineTimersRef.current = [];
      SCRIPT.forEach(({ delay, text }) => {
        pipelineTimersRef.current.push(
          setTimeout(() => speakRef.current(text), delay)
        );
      });
    };

    window.addEventListener('lena-pipeline-start', onPipelineStart);
    return () => {
      window.removeEventListener('lena-pipeline-start', onPipelineStart);
      pipelineTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ════════════════════════════════════════════
  // UI
  // ════════════════════════════════════════════
  const STATUS_CONFIG: Record<LenaStatus, { dot: string; label: string }> = {
    'idle':          { dot: 'bg-gray-400',                  label: 'Inactive' },
    'listening':     { dot: 'bg-green-500 animate-pulse',   label: 'Listening...' },
    'wake-detected': { dot: 'bg-yellow-400 animate-bounce', label: 'Awaiting command...' },
    'processing':    { dot: 'bg-blue-400',                  label: 'Processing...' },
    'speaking':      { dot: 'bg-primary animate-pulse',     label: 'Speaking...' },
  };

  const isActive = status === 'processing' || status === 'speaking';

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-destructive/90 text-destructive-foreground p-3 rounded-lg shadow-xl z-50 text-sm flex items-center gap-2">
        <MicOff className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
        <button onClick={() => setError(null)} className="ml-1 hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1,   y: 0  }}
        exit={{    opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-6 right-6 z-[100] w-80"
      >
        <div className="bg-background/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
              <span className="font-semibold text-sm tracking-tight">LENA Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{STATUS_CONFIG[status].label}</span>
              {isActive && (
                <button
                  onClick={stopEverything}
                  title="Stop Lena"
                  className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {status === 'idle' ? (
              <p className="text-xs text-muted-foreground text-center py-3 animate-pulse">
                Click anywhere to activate Lena
              </p>
            ) : (
              <>
                {transcript && (
                  <div className="bg-muted/60 p-2.5 rounded-lg">
                    <span className="block mb-1 text-muted-foreground/60 uppercase tracking-widest text-[9px] font-bold">
                      You
                    </span>
                    <span className="text-xs text-foreground/80">{transcript}</span>
                  </div>
                )}

                <div className="bg-primary/10 p-3 rounded-lg border border-primary/10">
                  <span className="block mb-1 text-primary/60 uppercase tracking-widest text-[9px] font-bold">
                    Lena
                  </span>
                  {status === 'processing' ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
                      <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                      Processing your command...
                    </div>
                  ) : (
                    <span className="text-sm">{lenaResponse}</span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Animated bar ── */}
          <div className="h-1 bg-primary/5 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-primary/50"
              style={{ originX: 0 }}
              animate={{
                scaleX:  status === 'idle'      ? 0
                        : status === 'listening' ? 0.25
                        : [0.2, 1, 0.5, 1],
                opacity: status === 'idle'      ? 0
                        : status === 'listening' ? 0.4
                        : [0.4, 1, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            />
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
