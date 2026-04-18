import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MicOff, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

// Matches any variant of the wake word (case-insensitive, anywhere in transcript)
const WAKE_REGEX = /\b(?:hey|hi|ok|okay|hello|oi)\s+lena\b/i;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type LenaStatus = 'idle' | 'listening' | 'wake-detected' | 'processing' | 'speaking';

// ─────────────────────────────────────────────
// LenaAssistant Component
// ─────────────────────────────────────────────
export const LenaAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── UI state ──
  const [status,       setStatus]       = useState<LenaStatus>('idle');
  const [transcript,   setTranscript]   = useState('');
  const [lenaResponse, setLenaResponse] = useState('Click anywhere to activate Lena...');
  const [error,        setError]        = useState<string | null>(null);

  // ── All mutable values shared across closures live in refs ──
  const recognitionRef     = useRef<any>(null);
  const voiceRef           = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef       = useRef<SpeechSynthesisUtterance | null>(null);
  const statusRef          = useRef<LenaStatus>('idle');
  const isActivatedRef     = useRef(false);
  const awaitingCommandRef = useRef(false);   // true after "Hey Lena" detected
  const awaitingTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pipelineTimersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resumeIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep navigate + pathname fresh without re-creating recognition
  const navigateRef  = useRef(navigate);
  const pathnameRef  = useRef(location.pathname);
  useEffect(() => { navigateRef.current = navigate;          }, [navigate]);
  useEffect(() => { pathnameRef.current = location.pathname; }, [location.pathname]);

  // ── Sync helper ──
  const setStatusBoth = useCallback((s: LenaStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ════════════════════════════════════════════
  // VOICE LOADING
  // Priority list tuned for Chrome / Edge on Windows & Mac
  // ════════════════════════════════════════════
  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const PRIORITY = [
        'Google UK English Female',
        'Microsoft Aria Online (Natural) - English (United States)',
        'Microsoft Aria - English (United States)',
        'Microsoft Zira - English (United States)',
        'Samantha',   // macOS
        'Victoria',   // macOS
        'Karen',      // macOS (Australian)
        'Moira',      // macOS (Irish)
        'Fiona',      // macOS (Scottish)
        'Google US English',
      ];

      let selected: SpeechSynthesisVoice | undefined;
      for (const name of PRIORITY) {
        selected = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
        if (selected) break;
      }
      if (!selected) selected = voices.find(v => v.lang.startsWith('en') && /female|woman/i.test(v.name));
      if (!selected) selected = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB');
      if (!selected) selected = voices.find(v => v.lang.startsWith('en'));

      voiceRef.current = selected ?? null;
      console.log('[Lena] Voice:', voiceRef.current?.name ?? 'browser default');
    };

    window.speechSynthesis.onvoiceschanged = loadVoice;
    loadVoice();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // ════════════════════════════════════════════
  // SPEAK
  // Recognition keeps running while speaking — the status gate
  // blocks command processing; Chrome's built-in echo cancellation
  // (AEC) handles the mic. This avoids any recognition gap.
  // Chrome 15-second TTS bug is fixed with a resume interval.
  // ════════════════════════════════════════════
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    window.speechSynthesis.cancel();
    if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // keep reference to prevent Chrome GC bug

    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.pitch  = 1.15;  // slightly higher = more feminine
    utterance.rate   = 1.0;
    utterance.volume = 1.0;

    setStatusBoth('speaking');
    setLenaResponse(text);

    // Chrome silently stops TTS after ~15 s on some versions
    resumeIntervalRef.current = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    }, 8_000);

    const onDone = () => {
      if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
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
  // Does NOT speak (avoids "stop" echo loop).
  // Cancels TTS + all pending timers, returns to listening.
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
5. For greetings/general questions: type="CHAT".
6. Every action MUST have a spoken verbal confirmation in "response".
7. Never leave "response" empty or null.

Return strict JSON only — no markdown, no extra text:
{
  "type": "NAVIGATE" | "CLICK" | "SUMMARIZE" | "CHAT",
  "payload": "route path or button label or null",
  "response": "What Lena will say (MANDATORY)"
}`;

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization:  `Bearer ${apiKey}`,
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

      // ① Speak the confirmation (always)
      speak(action.response || 'Done.');

      // ② Execute the action after a brief pause
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
              setTimeout(() => speak(`I couldn't find a button labelled "${action.payload}". Could you try again?`), 600);
            }
            break;
          }

          case 'SUMMARIZE': {
            const content = (document.querySelector('main') as HTMLElement | null)?.innerText
              ?? document.body.innerText;
            getSummaryFromGroq(content.slice(0, 5_000)).then(speak);
            break;
          }

          default:
            break;
        }
      }, 250);

    } catch (err) {
      console.error('[Lena] Command error:', err);
      speak('I encountered an error while processing your request. Please try again.');
    }
  }, [speak, setStatusBoth]);

  // ─── Groq page summarisation ─────────────────
  const getSummaryFromGroq = async (content: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:    GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are Lena, a professional female assistant. Summarise this page in 2–3 clear sentences for voice delivery. Be concise.' },
            { role: 'user',   content },
          ],
        }),
      });
      const data = await res.json();
      return data.choices[0].message.content as string;
    } catch {
      return 'I was unable to summarise the page content at this time.';
    }
  };

  // ─── Keep callback refs fresh for the stable recognition closure ──
  const processCommandRef = useRef(processCommand);
  const stopEverythingRef = useRef(stopEverything);
  const speakRef          = useRef(speak);
  useEffect(() => { processCommandRef.current = processCommand; }, [processCommand]);
  useEffect(() => { stopEverythingRef.current = stopEverything; }, [stopEverything]);
  useEffect(() => { speakRef.current          = speak;          }, [speak]);

  // ════════════════════════════════════════════
  // SPEECH RECOGNITION  (runs exactly ONCE, empty deps)
  //
  // Key design choices:
  //
  // 1. continuous=true — recognition never manually stopped from onresult.
  //    Stopping inside onresult caused a ~200 ms gap that swallowed
  //    the command spoken right after "Hey Lena".
  //
  // 2. Wake-word pre-armed on INTERIM results.
  //    Chrome fires interim events while the user is still speaking.
  //    By setting awaitingCommandRef=true on the first interim that
  //    contains "hey lena", we are ready before the final result arrives.
  //    When "hey lena" becomes final and there is NO command attached,
  //    the next final transcript (the actual command) is captured
  //    immediately with awaitingCommandRef=true still set.
  //
  // 3. onend restart delay is 50 ms when awaitingCommand is true
  //    (vs 200 ms normally) to minimise the gap if Chrome briefly
  //    ends continuous mode after silence.
  //
  // 4. "stop" is checked BEFORE every other gate so it always fires,
  //    even while Lena is speaking.
  // ════════════════════════════════════════════
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setError('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SR() as any;
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';
    recognition.maxAlternatives = 1;
    recognitionRef.current      = recognition;

    // ─── onresult ────────────────────────────
    recognition.onresult = (event: any) => {
      let finalT   = '';
      let interimT = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const t = event.results[i][0].transcript as string;
        if (event.results[i].isFinal) finalT   += t;
        else                          interimT  += t;
      }

      const anyText     = (finalT || interimT).trim();
      const anyLower    = anyText.toLowerCase();

      // ① STOP — always active (even while speaking)
      if (anyLower.includes('stop')) {
        stopEverythingRef.current();
        return;
      }

      // ② Gate: ignore non-stop input while speaking or processing
      if (statusRef.current === 'speaking' || statusRef.current === 'processing') return;

      // ③ PRE-ARM wake word from INTERIM results
      //    As soon as we see "hey lena" in the partial transcript,
      //    flag awaitingCommand — so we don't miss the command that follows.
      if (
        !awaitingCommandRef.current &&
        statusRef.current !== 'wake-detected' &&
        WAKE_REGEX.test(anyLower) &&
        !finalT.trim()            // only act on interim here
      ) {
        awaitingCommandRef.current = true;
        statusRef.current = 'wake-detected';
        setStatus('wake-detected');
        setLenaResponse("Yes? I'm listening...");
        // (Re-)set the timeout in case the final result takes a moment)
        if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
        awaitingTimerRef.current = setTimeout(() => {
          if (awaitingCommandRef.current) {
            awaitingCommandRef.current = false;
            statusRef.current = 'listening';
            setStatus('listening');
            speakRef.current("I'm here whenever you're ready. Just say your command.");
          }
        }, 7_000);
      }

      // ④ From here, only act on FINAL transcripts
      if (!finalT.trim()) return;
      const lower = finalT.toLowerCase().trim();

      // ⑤ Wake word in FINAL result — extract any trailing command
      if (WAKE_REGEX.test(lower)) {
        // Strip the wake word phrase (and surrounding punctuation/spaces)
        const commandPart = lower
          .replace(WAKE_REGEX, '')
          .replace(/^[,.\s!?]+/, '')
          .trim();

        if (commandPart.length > 2) {
          // "Hey Lena, go to finance" — process inline
          awaitingCommandRef.current = false;
          if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
          processCommandRef.current(commandPart);
        } else {
          // Just "Hey Lena" — arm already set in step ③ or set here
          awaitingCommandRef.current = true;
          statusRef.current = 'wake-detected';
          setStatus('wake-detected');
          setLenaResponse("Yes? I'm listening...");
          if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
          awaitingTimerRef.current = setTimeout(() => {
            if (awaitingCommandRef.current) {
              awaitingCommandRef.current = false;
              statusRef.current = 'listening';
              setStatus('listening');
              speakRef.current("I'm here whenever you're ready. Just say your command.");
            }
          }, 7_000);
        }
        return;
      }

      // ⑥ Awaiting command (after "Hey Lena" was detected separately)
      if (awaitingCommandRef.current) {
        awaitingCommandRef.current = false;
        if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
        statusRef.current = 'listening';
        setStatus('listening');
        processCommandRef.current(finalT.trim());
        return;
      }

      // ⑦ Direct command (no wake word needed — filtered by keywords to reduce noise)
      const isDirectCommand = /\b(go to|navigate|open|click|press|show|take me|what|who|how|help|summarize|summarise|initialize|start|proceed|settings|finance|supply|manufacturing|commercial|assistant|dashboard|hr|logout|log out)\b/i.test(lower);
      if (isDirectCommand) {
        processCommandRef.current(finalT.trim());
      }
    };

    // ─── onerror ─────────────────────────────
    recognition.onerror = (event: any) => {
      const { error } = event as { error: string };
      if (error === 'aborted' || error === 'no-speech') return; // harmless
      if (error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone and refresh.');
        isActivatedRef.current = false;
        statusRef.current = 'idle';
        setStatus('idle');
        return;
      }
      console.warn('[Lena] Recognition error:', error);
    };

    // ─── onend — indestructible restart ──────
    // Uses a SHORTER delay when we are waiting for a command after
    // "Hey Lena", to minimise any gap caused by Chrome briefly
    // ending continuous recognition on silence.
    recognition.onend = () => {
      if (!isActivatedRef.current) return;
      const delay = awaitingCommandRef.current ? 50 : 200;
      setTimeout(() => {
        if (isActivatedRef.current) {
          try { recognition.start(); } catch (_) {}
        }
      }, delay);
    };

    // ─── Activation (first user interaction) ─
    const activate = () => {
      if (isActivatedRef.current) return;
      isActivatedRef.current = true;
      statusRef.current = 'listening';
      setStatus('listening');
      setLenaResponse("Hello! I'm Lena. How can I help you today?");
      try { recognition.start(); } catch (_) {}

      // Greet after recognition has stabilised
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
  }, []); // ← intentionally empty: all live callbacks accessed via refs

  // ════════════════════════════════════════════
  // PIPELINE VOICE NARRATION
  // ════════════════════════════════════════════
  useEffect(() => {
    const SCRIPT = [
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
        pipelineTimersRef.current.push(setTimeout(() => speakRef.current(text), delay));
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
  // z-[9999] ensures Lena is always on top regardless of which
  // layout (SystemLayout / Layout / LandingPage) is active.
  // ════════════════════════════════════════════
  const STATUS_CONFIG: Record<LenaStatus, { dot: string; label: string }> = {
    'idle':          { dot: 'bg-gray-400',                  label: 'Inactive'           },
    'listening':     { dot: 'bg-green-500 animate-pulse',   label: 'Listening...'       },
    'wake-detected': { dot: 'bg-yellow-400 animate-bounce', label: 'Awaiting command...' },
    'processing':    { dot: 'bg-blue-400',                  label: 'Processing...'      },
    'speaking':      { dot: 'bg-primary animate-pulse',     label: 'Speaking...'        },
  };

  const canStop = status === 'processing' || status === 'speaking';

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] bg-destructive/90 text-destructive-foreground p-3 rounded-lg shadow-xl text-sm flex items-center gap-2">
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
        // z-[9999] overrides all layouts including SystemLayout's SidebarProvider
        className="fixed bottom-6 right-6 z-[9999] w-80"
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
              {canStop && (
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

                {/* Wake-word tip — only shown briefly when status is listening */}
                {status === 'listening' && (
                  <p className="text-[10px] text-muted-foreground/40 text-center">
                    Say <span className="font-semibold text-primary/40">"Hey Lena"</span> or speak a command directly
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Animated activity bar ── */}
          <div className="h-1 bg-primary/5 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-primary/50"
              style={{ originX: 0 }}
              animate={{
                scaleX:  status === 'idle'           ? 0
                        : status === 'listening'      ? 0.25
                        : status === 'wake-detected'  ? 0.6
                        : [0.2, 1, 0.5, 1],
                opacity: status === 'idle'            ? 0
                        : status === 'listening'       ? 0.35
                        : status === 'wake-detected'   ? 0.7
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
