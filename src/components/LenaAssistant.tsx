import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

// Wake word: just "lena" with a word boundary catches every variant:
// "hey lena", "ok lena", "lena go to...", "lena!" etc.
const WAKE_REGEX = /\blena\b/i;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type LenaStatus = 'idle' | 'listening' | 'wake-detected' | 'processing' | 'speaking';

// ─────────────────────────────────────────────
// LenaAssistant
// ─────────────────────────────────────────────
export const LenaAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── UI state ──
  const [status,        setStatus]        = useState<LenaStatus>('idle');
  const [transcript,    setTranscript]    = useState('');
  const [lenaResponse,  setLenaResponse]  = useState('');
  const [error,         setError]         = useState<string | null>(null);
  const [isSoundActive, setIsSoundActive] = useState(false);   // mic is picking up sound
  const [micLevel,      setMicLevel]      = useState(0);       // 0–1 amplitude

  // ── Refs ──
  const recognitionRef      = useRef<any>(null);
  const voiceRef            = useRef<SpeechSynthesisVoice | null>(null);
  const utteranceRef        = useRef<SpeechSynthesisUtterance | null>(null);
  const statusRef           = useRef<LenaStatus>('idle');
  const isActivatedRef      = useRef(false);
  const awaitingCommandRef  = useRef(false);
  const awaitingTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pipelineTimersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resumeIntervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSoundActiveRef    = useRef(false);

  // AudioContext refs for real mic-level visualization
  const audioCtxRef         = useRef<AudioContext | null>(null);
  const analyserRef         = useRef<AnalyserNode | null>(null);
  const micStreamRef        = useRef<MediaStream | null>(null);
  const animFrameRef        = useRef<number>(0);

  // Keep navigate + pathname accessible from stable closures
  const navigateRef = useRef(navigate);
  const pathnameRef = useRef(location.pathname);
  useEffect(() => { navigateRef.current = navigate;          }, [navigate]);
  useEffect(() => { pathnameRef.current = location.pathname; }, [location.pathname]);

  const setStatusBoth = useCallback((s: LenaStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ════════════════════════════════════════════
  // VOICE LOADING  (female-first priority)
  // ════════════════════════════════════════════
  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const PRIORITY = [
        'Google UK English Female',
        'Microsoft Aria Online (Natural) - English (United States)',
        'Microsoft Aria - English (United States)',
        'Microsoft Zira - English (United States)',
        'Samantha', 'Victoria', 'Karen', 'Moira', 'Fiona',
        'Google US English',
      ];

      let v: SpeechSynthesisVoice | undefined;
      for (const name of PRIORITY) {
        v = voices.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
        if (v) break;
      }
      if (!v) v = voices.find(x => x.lang.startsWith('en') && /female|woman/i.test(x.name));
      if (!v) v = voices.find(x => x.lang === 'en-US' || x.lang === 'en-GB');
      if (!v) v = voices.find(x => x.lang.startsWith('en'));

      voiceRef.current = v ?? null;
      console.log('[Lena] Voice:', voiceRef.current?.name ?? 'default');
    };
    window.speechSynthesis.onvoiceschanged = load;
    load();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // ════════════════════════════════════════════
  // MIC LEVEL VISUALIZER  (Web Audio API)
  // Reads the actual microphone amplitude 60×/s
  // so the bars react in real time to the user's voice.
  // ════════════════════════════════════════════
  const startMicVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const ctx      = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      ctx.createMediaStreamSource(stream).connect(analyser);

      audioCtxRef.current  = ctx;
      analyserRef.current  = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        // Average over first 20 bins (voice range)
        const avg = data.slice(0, 20).reduce((a, b) => a + b, 0) / 20;
        setMicLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      console.warn('[Lena] Visualizer error:', err);
    }
  }, []);

  const stopMicVisualizer = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current = null;
    analyserRef.current = null;
    micStreamRef.current = null;
    setMicLevel(0);
  }, []);

  // ════════════════════════════════════════════
  // SPEAK  (always female voice, Chrome 15-s fix)
  // ════════════════════════════════════════════
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || !text.trim()) return;

    window.speechSynthesis.cancel();
    if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.pitch  = 1.15;
    utterance.rate   = 1.0;
    utterance.volume = 1.0;

    setStatusBoth('speaking');
    setLenaResponse(text);

    // Chrome 15-s TTS bug workaround
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
    utterance.onerror = (e) => { if (e.error !== 'interrupted') console.warn('[Lena] TTS:', e.error); onDone(); };

    window.speechSynthesis.speak(utterance);
  }, [setStatusBoth]);

  // ════════════════════════════════════════════
  // STOP EVERYTHING
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
      const pageElements = Array.from(document.querySelectorAll('button, a, [role="button"]'))
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

RULES:
1. "response" is ALWAYS mandatory — what Lena speaks aloud. 1–2 warm sentences.
2. For navigation: type="NAVIGATE", payload=route path.
3. For button clicks: type="CLICK", payload=exact button label.
4. For page summary: type="SUMMARIZE".
5. For greetings/chat: type="CHAT".
6. Every action MUST have a spoken verbal confirmation in "response".

Return strict JSON only:
{
  "type": "NAVIGATE" | "CLICK" | "SUMMARIZE" | "CHAT",
  "payload": "route or button or null",
  "response": "Lena speaks this (MANDATORY)"
}`;

      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:           GROQ_MODEL,
          temperature:     0.3,
          messages:        [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }],
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) throw new Error(`Groq API ${res.status}`);

      const data   = await res.json();
      const action = JSON.parse(data.choices[0].message.content);

      speak(action.response || 'Done.');

      setTimeout(() => {
        switch (action.type) {
          case 'NAVIGATE':
            if (action.payload) navigateRef.current(action.payload);
            break;
          case 'CLICK': {
            if (!action.payload) break;
            const target = Array.from(document.querySelectorAll('button, a, [role="button"]'))
              .find(el => el.textContent?.toLowerCase().includes(action.payload.toLowerCase())) as HTMLElement | undefined;
            if (target) target.click();
            else setTimeout(() => speak(`I couldn't find a button labelled "${action.payload}". Please try again.`), 600);
            break;
          }
          case 'SUMMARIZE': {
            const content = (document.querySelector('main') as HTMLElement | null)?.innerText ?? document.body.innerText;
            getSummaryFromGroq(content.slice(0, 5_000)).then(speak);
            break;
          }
        }
      }, 250);

    } catch (err) {
      console.error('[Lena] Command error:', err);
      speak('I encountered an error. Please try again.');
    }
  }, [speak, setStatusBoth]);

  const getSummaryFromGroq = async (content: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:    GROQ_MODEL,
          messages: [
            { role: 'system', content: 'You are Lena. Summarise this page in 2–3 sentences for voice.' },
            { role: 'user',   content },
          ],
        }),
      });
      const data = await res.json();
      return data.choices[0].message.content as string;
    } catch { return 'I was unable to summarise the page at this time.'; }
  };

  // Callback refs — keep recognition closure up-to-date
  const processCommandRef = useRef(processCommand);
  const stopEverythingRef = useRef(stopEverything);
  const speakRef          = useRef(speak);
  useEffect(() => { processCommandRef.current = processCommand; }, [processCommand]);
  useEffect(() => { stopEverythingRef.current = stopEverything; }, [stopEverything]);
  useEffect(() => { speakRef.current          = speak;          }, [speak]);

  // ════════════════════════════════════════════
  // EXPLICIT ACTIVATION  (called by the Activate button)
  // 1. Requests mic via getUserMedia → triggers browser permission dialog
  // 2. Starts the Web Audio visualizer
  // 3. Starts SpeechRecognition
  // 4. Greets the user
  // ════════════════════════════════════════════
  const handleActivate = useCallback(async () => {
    if (isActivatedRef.current) return;

    try {
      // This line triggers the browser "Allow microphone?" dialog
      await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      setError('Microphone access denied. Click the lock icon in the address bar and allow microphone, then refresh.');
      return;
    }

    isActivatedRef.current = true;
    setStatusBoth('listening');
    setLenaResponse("Hello! I'm Lena. How can I help?");

    // Start real mic-level visualizer
    startMicVisualizer();

    // Start recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (_) {}
    }

    // Greet
    setTimeout(() => {
      speakRef.current(
        "Hello! I'm Lena, your LENA Platform voice assistant. I'm always listening — just say Lena followed by your command."
      );
    }, 400);
  }, [setStatusBoth, startMicVisualizer]);


  // ════════════════════════════════════════════
  // SPEECH RECOGNITION SETUP  (runs once, empty deps)
  // ════════════════════════════════════════════
  useEffect(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
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

    // ─── Sound / speech activity events ──────
    // These drive the mic-active indicator
    recognition.onsoundstart  = () => { isSoundActiveRef.current = true;  setIsSoundActive(true);  };
    recognition.onsoundend    = () => { isSoundActiveRef.current = false; setIsSoundActive(false); };
    recognition.onspeechstart = () => { isSoundActiveRef.current = true;  setIsSoundActive(true);  };
    recognition.onspeechend   = () => { isSoundActiveRef.current = false; setIsSoundActive(false); };
    recognition.onaudiostart  = () => console.log('[Lena] 🎙 Audio capture started');
    recognition.onaudioend    = () => console.log('[Lena] 🎙 Audio capture ended');

    // ─── onresult ────────────────────────────
    recognition.onresult = (event: any) => {
      let finalT  = '';
      let interimT = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const t = event.results[i][0].transcript as string;
        if (event.results[i].isFinal) finalT   += t;
        else                          interimT  += t;
      }

      const anyLower = (finalT || interimT).toLowerCase().trim();

      // ① STOP — always fires even while speaking
      if (anyLower.includes('stop')) { stopEverythingRef.current(); return; }

      // ② Gate while speaking or processing
      if (statusRef.current === 'speaking' || statusRef.current === 'processing') return;

      // ③ PRE-ARM on interim — detect "lena" as early as possible
      if (
        !awaitingCommandRef.current &&
        statusRef.current === 'listening' &&
        WAKE_REGEX.test(anyLower) &&
        !finalT.trim()
      ) {
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
            speakRef.current("I'm here. Just say your command whenever you're ready.");
          }
        }, 7_000);
      }

      // ④ Only act on FINAL transcripts from here
      if (!finalT.trim()) return;
      const lower = finalT.toLowerCase().trim();

      // ⑤ Final transcript contains "lena" — extract trailing command
      if (WAKE_REGEX.test(lower)) {
        // Strip "lena" and any preceding wake prefixes + punctuation
        const commandPart = lower
          .replace(/\b(?:hey|hi|ok|okay|hello|oi)\s+lena\b/gi, '')
          .replace(/\blena\b/gi, '')
          .replace(/^[\s,.\-!?]+/, '')
          .trim();

        if (commandPart.length > 2) {
          // "Hey Lena go to finance" → process "go to finance"
          awaitingCommandRef.current = false;
          if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
          processCommandRef.current(commandPart);
        } else {
          // Just "Lena" alone → arm and wait
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
              speakRef.current("I'm here. Just say your command whenever you're ready.");
            }
          }, 7_000);
        }
        return;
      }

      // ⑥ Awaiting command (after wake word was detected separately)
      if (awaitingCommandRef.current) {
        awaitingCommandRef.current = false;
        if (awaitingTimerRef.current) clearTimeout(awaitingTimerRef.current);
        statusRef.current = 'listening';
        setStatus('listening');
        processCommandRef.current(finalT.trim());
        return;
      }

      // ⑦ Direct command — accept anything with 3+ words OR recognisable terms
      //    (No wake word needed; Groq handles interpretation)
      const words = lower.trim().split(/\s+/);
      const hasCommandKeyword = /\b(go|open|navigate|click|show|take|help|summarize|summarise|initialize|start|finance|supply|manufacturing|commercial|settings|assistant|dashboard|hr|logout)\b/i.test(lower);
      if (words.length >= 3 || hasCommandKeyword) {
        processCommandRef.current(finalT.trim());
      }
    };

    // ─── onerror ─────────────────────────────
    recognition.onerror = (event: any) => {
      const { error } = event as { error: string };
      if (error === 'aborted' || error === 'no-speech') return;
      if (error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone in your browser and refresh.');
        isActivatedRef.current = false;
        statusRef.current = 'idle';
        setStatus('idle');
        return;
      }
      console.warn('[Lena] Recognition error:', error);
    };

    // ─── onend — indestructible restart ──────
    recognition.onend = () => {
      if (!isActivatedRef.current) return;
      const delay = awaitingCommandRef.current ? 50 : 200;
      setTimeout(() => {
        if (isActivatedRef.current) {
          try { recognition.start(); } catch (_) {}
        }
      }, delay);
    };

    return () => {
      isActivatedRef.current = false;
      try { recognition.stop(); } catch (_) {}
      stopMicVisualizer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ════════════════════════════════════════════
  // PIPELINE NARRATION
  // ════════════════════════════════════════════
  useEffect(() => {
    const SCRIPT = [
      { delay:     0, text: 'Initializing LENA Agent Pipeline. All systems are online.' },
      { delay:   800, text: 'Telemetry Agent activated. Tank levels gathered and analysed.' },
      { delay:  6000, text: 'Demand and Allocation Agent engaged. Forecasting supply needs.' },
      { delay: 11000, text: 'Pricing Optimisation Agent online. Calculating the best fuel rates.' },
      { delay: 18000, text: 'Plant and Logistics Allocation Agent deployed. Assigning plant, tanker, and driver resources.' },
      { delay: 23000, text: 'Route Optimisation Agent launched. Finding the fastest delivery path.' },
      { delay: 31000, text: 'Risk Agent standing by. Evaluating financial exposure and compliance risks.' },
      { delay: 37000, text: 'LENA Orchestrator taking control. Consolidating all agent outputs.' },
      { delay: 42500, text: 'Pipeline complete. All agents executed successfully. Results are ready for your review.' },
    ];
    const onStart = () => {
      pipelineTimersRef.current.forEach(clearTimeout);
      pipelineTimersRef.current = [];
      SCRIPT.forEach(({ delay, text }) => {
        pipelineTimersRef.current.push(setTimeout(() => speakRef.current(text), delay));
      });
    };
    window.addEventListener('lena-pipeline-start', onStart);
    return () => {
      window.removeEventListener('lena-pipeline-start', onStart);
      pipelineTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ════════════════════════════════════════════
  // UI HELPERS
  // ════════════════════════════════════════════
  const STATUS_LABEL: Record<LenaStatus, string> = {
    idle:           'Inactive',
    listening:      'Listening...',
    'wake-detected':'Awaiting command...',
    processing:     'Processing...',
    speaking:       'Speaking...',
  };

  // Mic bar heights driven by actual mic amplitude (micLevel 0–1)
  // Falls back to gentle idle animation when no sound
  const BAR_COUNT = 5;
  const micBars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const base = 15 + i * 5;
    const peak = isSoundActive ? Math.min(100, base + micLevel * 80 + Math.sin(i * 1.3) * 20) : base + 5;
    return Math.round(peak);
  });

  const canStop = status === 'processing' || status === 'speaking';

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] bg-destructive/90 text-destructive-foreground p-3 rounded-lg shadow-xl text-sm flex items-center gap-2 max-w-xs">
        <MicOff className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">{error}</span>
        <button onClick={() => setError(null)} className="ml-1 hover:opacity-70 flex-shrink-0">
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
        className="fixed bottom-6 right-6 z-[9999] w-80"
      >
        <div className="bg-background/90 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-2">
              {/* Animated status dot */}
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  status === 'idle'           ? 'bg-gray-400' :
                  status === 'listening'      ? 'bg-green-500' :
                  status === 'wake-detected'  ? 'bg-yellow-400' :
                  status === 'processing'     ? 'bg-blue-400' :
                                               'bg-primary'
                }`}
                animate={{ scale: ['idle','listening','wake-detected','speaking'].includes(status) ? [1, 1.3, 1] : 1 }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
              <span className="font-semibold text-sm tracking-tight">LENA Assistant</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{STATUS_LABEL[status]}</span>
              {canStop && (
                <button onClick={stopEverything} title="Stop" className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-4 space-y-3">

            {/* IDLE: big activate button */}
            {status === 'idle' ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-xs text-muted-foreground text-center">
                  Click below to activate Lena and allow microphone access.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleActivate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-lg shadow-primary/30"
                >
                  <Mic className="w-4 h-4" />
                  Activate Lena
                </motion.button>
              </div>

            ) : (
              <>
                {/* Transcript bubble */}
                {transcript && (
                  <div className="bg-muted/60 px-3 py-2 rounded-lg">
                    <span className="block mb-0.5 text-muted-foreground/60 uppercase tracking-widest text-[9px] font-bold">You</span>
                    <span className="text-xs text-foreground/80">{transcript}</span>
                  </div>
                )}

                {/* Lena response bubble */}
                <div className="bg-primary/10 px-3 py-2.5 rounded-lg border border-primary/10 min-h-[52px]">
                  <span className="block mb-0.5 text-primary/60 uppercase tracking-widest text-[9px] font-bold">Lena</span>
                  {status === 'processing' ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
                      <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                      Processing your command...
                    </div>
                  ) : (
                    <span className="text-sm leading-snug">{lenaResponse || 'Listening for your command...'}</span>
                  )}
                </div>

                {/* ── Mic visualizer ── */}
                <div className="flex items-center gap-3 px-1">
                  {/* Real-time audio bars */}
                  <div className="flex items-end gap-[3px] h-6 flex-shrink-0">
                    {micBars.map((h, i) => (
                      <motion.div
                        key={i}
                        className={`w-1 rounded-full ${isSoundActive ? 'bg-green-500' : 'bg-primary/30'}`}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.08, ease: 'linear' }}
                        style={{ minHeight: 3 }}
                      />
                    ))}
                  </div>

                  {/* Status hint — always-on messaging */}
                  {status === 'listening' && (
                    <p className={`text-[10px] font-medium ${isSoundActive ? 'text-green-500' : 'text-muted-foreground/40'}`}>
                      {isSoundActive ? 'Hearing you...' : 'Say "Lena, go to Finance"'}
                    </p>
                  )}
                  {status === 'wake-detected' && (
                    <p className="text-[10px] text-yellow-500/80 font-semibold animate-pulse">
                      Listening for your command...
                    </p>
                  )}
                  {status === 'speaking' && (
                    <p className="text-[10px] text-primary/60 font-medium">
                      Speaking...
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Activity bar ── */}
          <div className="h-0.5 bg-primary/5 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-primary/60"
              style={{ originX: 0 }}
              animate={{
                scaleX:  status === 'idle'           ? 0
                        : status === 'listening'      ? (isSoundActive ? 0.6 : 0.2)
                        : status === 'wake-detected'  ? 0.7
                        : [0.2, 1, 0.4, 1],
                opacity: status === 'idle'            ? 0
                        : status === 'listening'       ? (isSoundActive ? 0.8 : 0.3)
                        : [0.4, 1, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            />
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
