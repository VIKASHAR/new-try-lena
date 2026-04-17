import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MicOff, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants & Types ---
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface Action {
  type: 'NAVIGATE' | 'CLICK' | 'SUMMARIZE' | 'CHAT' | 'GREET';
  payload?: string;
  response?: string;
}

// --- Component ---
export const LenaAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lenaResponse, setLenaResponse] = useState("");
  const hasGreeted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisVoice | null>(null);
  const isListeningRef = useRef(false);
  const isProcessingRef = useRef(false);
  const pipelineTimersRef = useRef<any[]>([]);

  // --- Voice Setup ---
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a nice female voice - Expanded list for better cross-browser compatibility
      const femaleVoice = voices.find(v => {
        const name = v.name;
        return (
          name.includes('Female') ||
          name.includes('Google US English') ||
          name.includes('Samantha') ||
          name.includes('Victoria') ||
          name.includes('Aria') ||
          name.includes('Zira') ||
          name.includes('Siri') ||
          name.includes('Karen') ||
          name.includes('Catherine') ||
          name.includes('Hazel')
        ) && v.lang.startsWith('en');
      }) || voices.find(v => v.lang.startsWith('en'));

      synthesisRef.current = femaleVoice || null;
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (synthesisRef.current) {
      utterance.voice = synthesisRef.current;
    }
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
    setLenaResponse(text);
  }, []);

  // --- Command Processing ---
  const processCommand = async (text: string) => {
    isProcessingRef.current = true;
    setIsProcessing(true);
    setTranscript(text);

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      setError("Groq API key missing in .env");
      speak("I'm sorry, my AI processing is currently disabled because the API key is missing.");
      setIsProcessing(false);
      return;
    }

    try {
      const pageElements = Array.from(document.querySelectorAll('button, a, [role="button"]'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length < 50)
        .join(", ");

      const systemPrompt = `
        You are "Lena", a voice assistant for the LENA Platform.
        Current URL: ${window.location.href}
        Current Path: ${location.pathname}
        
        Visible interactive elements (Buttons/Links): ${pageElements || "None detected"}
        
        Available routes:
        - /supply-chain
        - /manufacturing
        - /commercial
        - /finance
        - /hr
        - /it
        - /assistant
        - /settings
        - /vision-panel
        - /nurostack
        - /nuromodels
        - /nuroforge
        
        Your task is to parse the user's voice command and return a JSON object.
        
        CRITICAL RULES:
        1. ALWAYS provide a "response" field with a friendly vocal confirmation. Lena MUST speak for every command.
        2. If the user says "initialize", "start", "proceed", or "begin", and there is a relevant button (e.g., "Initialize Platform"), set type to "CLICK" and payload to the exact button name.
        3. Do NOT jump to navigation if a corresponding button exists on the current page.
        
        Commands:
        - Navigation: "Go to finance", "Open settings"
        - Interaction: "Click the login button", "press start" (type: CLICK)
        - Summarization: "Summarize this page", "what is this about?" (type: SUMMARIZE)
        - General chat/help: "Who are you?", "Help me" (type: CHAT)

        Return JSON ONLY:
        {
          "type": "NAVIGATE" | "CLICK" | "SUMMARIZE" | "CHAT" | "CLARIFY",
          "payload": "the path or exact button label or null",
          "response": "What you will say back to the user (MANDATORY)"
        }
      `;

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      const action: Action = JSON.parse(data.choices[0].message.content);

      handleAction(action);
    } catch (err) {
      console.error("Groq Error:", err);
      speak("I encountered an error while processing your request.");
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleAction = async (action: Action) => {
    if (action.response) speak(action.response);

    switch (action.type) {
      case 'NAVIGATE':
        if (action.payload) navigate(action.payload);
        break;
      case 'CLICK':
        if (action.payload) {
          const buttons = Array.from(document.querySelectorAll('button, a'));
          const target = buttons.find(b =>
            b.textContent?.toLowerCase().includes(action.payload!.toLowerCase())
          ) as HTMLElement;
          if (target) {
            target.click();
          } else {
            speak(`I couldn't find a button labeled ${action.payload}`);
          }
        }
        break;
      case 'SUMMARIZE':
        const pageContent = document.querySelector('main')?.innerText || document.body.innerText;
        const summary = await getSummaryFromGroq(pageContent.substring(0, 5000));
        speak(summary);
        break;
      default:
        break;
    }
  };

  const getSummaryFromGroq = async (content: string) => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You are Lena. Summarize the following page content concisely in 2-3 sentences for voice delivery." },
            { role: "user", content: content }
          ]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      return "I was unable to summarize the page content at this time.";
    }
  };

  // --- Speech Recognition ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported in this browser");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const lowerTranscript = (finalTranscript || interimTranscript).toLowerCase();

        // 1. Instant STOP command
        if (lowerTranscript.includes("stop")) {
          window.speechSynthesis.cancel();
          setIsProcessing(false);
          setLenaResponse("");
          setTranscript("");
          // Stop and restart recognition to clear its current buffer
          try { recognition.stop(); } catch(e) {}
          return;
        }

        if (isProcessingRef.current) return; // Prevent new commands while processing

        // 2. Local SUMMARIZE trigger for quick response
        if (lowerTranscript.includes("summarize")) {
          isProcessingRef.current = true;
          setIsProcessing(true);
          try { recognition.stop(); } catch(e) {}
          setTranscript(finalTranscript || interimTranscript);
          handleAction({ type: 'SUMMARIZE', response: "Summarizing the page for you." }).finally(() => {
             isProcessingRef.current = false;
             setIsProcessing(false);
          });
          return;
        }

        // 3. Process final transcript for everything else
        if (finalTranscript) {
          const lowerFinal = finalTranscript.toLowerCase();
          // Filter background noise in crowded places: only process if keywords strongly indicate a command
          if (lowerFinal.match(/(lena|go to|click|open|navigate|what|who|why|how|start|initialize|proceed|thank|yes)/)) {
            try { recognition.stop(); } catch(e) {} // Force restart buffer
            processCommand(finalTranscript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        // Silently handle 'aborted' as it's often a harmless browser behavior
        if (event.error === 'aborted') return;

        console.error("Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setError("Microphone access denied.");
          isListeningRef.current = false;
          setIsListening(false);
        }
        
        // Ensure recognition fully stops on error so onend restarts it
        try { recognition.stop(); } catch(e) {}
      };

      recognition.onend = () => {
        // Indestructible Restart: Always try to stay alive if active
        if (isListeningRef.current) {
          setTimeout(() => {
            try {
              recognition.start();
            } catch (e) {
              // Ignore if already started
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
    }

    const startAssistant = () => {
      const rec = recognitionRef.current;
      if (!rec || isListeningRef.current) return;

      try {
        rec.start();
        setIsListening(true);
        isListeningRef.current = true;
        hasGreeted.current = true;
      } catch (err) {
        // Silently catch start errors
      }
    };

    // First interaction handler
    const handleFirstInteraction = () => {
      startAssistant();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      // We don't stop the recognition here to keep it alive across light renders
    };
  }, [navigate, speak, isListening]);

  // --- Pipeline Voice Narration ---
  useEffect(() => {
    // Agent durations (ms): Telemetry=6000, Demand=5000, Pricing=7000,
    // Plant=5000, Route=8000, Risk=6000, Orchestrator=5000
    const SCRIPT = [
      { delay: 0, text: "Initializing LENA Agent Pipeline. All systems online." },
      { delay: 800, text: "Telemetry Agent activated — Gathered tank levels and analyzed." },
      { delay: 6000, text: "Demand and Allocation Agent engaged — forecasting supply needs." },
      { delay: 11000, text: "Pricing Optimisation Agent online — calculating best fuel rates." },
      { delay: 18000, text: "Plant and Logistics Allocation Agent deployed — assigning efficient plant, tanker and driver sources." },
      { delay: 23000, text: "Route Optimisation Agent launched — finding fastest delivery path." },
      { delay: 31000, text: "Risk Agent standing by — evaluating financial exposure." },
      { delay: 37000, text: "LENA Orchestrator taking control — consolidating all agent outputs." },
      { delay: 42500, text: "Pipeline complete. All agents executed successfully." },
    ];

    const handlePipelineStart = () => {
      // Clear any existing timers
      pipelineTimersRef.current.forEach(clearTimeout);
      pipelineTimersRef.current = [];

      // Schedule the narration
      SCRIPT.forEach(({ delay, text }) => {
        const t = setTimeout(() => speak(text), delay);
        pipelineTimersRef.current.push(t);
      });
    };

    window.addEventListener('lena-pipeline-start', handlePipelineStart);
    return () => {
      window.removeEventListener('lena-pipeline-start', handlePipelineStart);
      pipelineTimersRef.current.forEach(clearTimeout);
    };
  }, [speak]);

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-destructive/90 text-destructive-foreground p-3 rounded-lg shadow-xl z-50 text-sm flex items-center gap-2">
        <MicOff className="w-4 h-4" />
        {error}
        <button onClick={() => setError(null)}><X className="w-3 h-3" /></button>
      </div>
    );
  }

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-[100] w-80"
        >
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-primary/10 p-4 flex items-center justify-between border-b border-primary/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="font-semibold text-sm tracking-tight">LENA Assistant</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {transcript && (
                <div className="flex gap-2">
                  <div className="bg-muted p-2 rounded-lg rounded-tl-none text-xs text-muted-foreground flex-1">
                    <span className="font-bold block mb-1 opacity-50 uppercase tracking-tighter">You</span>
                    {transcript}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <div className="bg-primary/20 p-3 rounded-lg rounded-tr-none text-sm border border-primary/10 flex-1">
                  <span className="font-bold block mb-1 text-primary opacity-60 uppercase tracking-tighter">Lena</span>
                  {isProcessing ? (
                    <div className="flex items-center gap-2 text-muted-foreground italic text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing command...
                    </div>
                  ) : (
                    lenaResponse || "Listening for your command..."
                  )}
                </div>
              </div>
            </div>

            {/* Visualizer Footer */}
            <div className="h-1 bg-primary/5 relative">
              <motion.div
                className="absolute inset-0 bg-primary/40"
                animate={{
                  scaleX: isProcessing ? [0, 1, 0.5, 1] : 1,
                  opacity: isProcessing ? [0.5, 1, 0.5] : 0.3
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </div>
          </div>
        </motion.div>
    </AnimatePresence>
  );
};