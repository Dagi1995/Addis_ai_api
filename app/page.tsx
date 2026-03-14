"use client";

import { useState, useRef, useEffect } from "react";
import { Stethoscope, Languages, History, Mic, MicOff, Loader2 } from "lucide-react";
import { useAddisRealtime } from "../hooks/useAddisRealtime";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import ChatMessage from "../components/ChatMessage";
import { AIDoctorAgents, DoctorAgent } from "../constants/agents";
import { MedicalLibrary } from "../lib/medical/library";

interface Message {
  role: "user" | "assistant";
  content: string;
  language?: string;
}

export default function MedicalAssistantPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<DoctorAgent>(AIDoctorAgents[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_ADDIS_API_KEY || "";

  // Stronger directive to prevent "I don't know" responses
  const baseDirective = `አንቺ ብቁ እና አዋቂ የህክምና ረዳት ነሽ። የታካሚዎችን ምልክቶች በጥንቃቄ ተረጂ። 
'አላውቅም' ወይም 'ሆስፒታል ሂድ' በማለት ብቻ አትመለሺ። ይልቁንም ዝርዝር ጥያቄዎችን በመጠየቅ ምልክቶቹን ከታካሚው ጋር አብረሽ ተንትኚ። 
ከዚያም ሊሆኑ የሚችሉ ምክንያቶችን እና የሚመከሩ የመጀመሪያ እርዳታዎችን ወይም መድሃኒቶችን ጥቀሺ።`;

  const systemInstructions = `${baseDirective}\n\nየአሁኑ ሚናሽ፡ ${selectedAgent.agentPrompt}`;

  const { isConnected, isStreaming, startRealtime, stopRealtime, playGreeting, sendTextMessage } = useAddisRealtime({
    apiKey,
    systemInstructions,
    onTranscript: (text) => {
      // Knowledge Bridge: Detect symptoms and inject data
      Object.entries(MedicalLibrary).forEach(([keyword, info]) => {
        if (text.includes(keyword)) {
          console.log(`Knowledge Bridge Match: ${keyword}`);
          const { description_am, follow_up_questions_am, advice_am } = info;
          const injection = `[SYSTEM DATA GATHERING AID: ${description_am} | Proactively ask these questions if not already answered: ${follow_up_questions_am.join(", ")} | Only suggest this advice after gathering data: ${advice_am}]`;
          sendTextMessage(injection);
        }
      });
    },
    onGreetingStart: () => {
      console.log("Greeting starting...");
      const greetingText = `ሰላም! እኔ ${selectedAgent.specialty} ረዳትዎ ነኝ። ዛሬ በምን ልርዳዎ?`;
      setMessages([{
        role: "assistant",
        content: greetingText,
        language: "am"
      }]);
    },
    onMessage: (role, content) => {
      setMessages((prev: Message[]) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role && role === "assistant") {
          return [...prev.slice(0, -1), { ...last, content }];
        }
        return [...prev, { role, content, language: "am" }];
      });
    },
    onError: (err: any) => {
      console.error("Realtime Error:", err);
      setMessages((prev: Message[]) => [...prev, { role: "assistant", content: "ይቅርታ፣ የቴክኒክ ችግር አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ።" }]);
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleStart = async () => {
    setHasStarted(true);
    await startRealtime();
    const greetingText = `ሰላም! እኔ ${selectedAgent.specialty} ረዳትዎ ነኝ። ዛሬ በምን ልርዳዎ?`;
    // Play the audible greeting
    await playGreeting(greetingText);
  };

  const toggleConversation = () => {
    if (isConnected) {
      stopRealtime();
      setHasStarted(false);
    } else {
      handleStart();
    }
  };

  if (!hasStarted) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
             <div className="flex flex-col items-center gap-4">
                <div className="bg-primary p-6 rounded-3xl text-primary-foreground shadow-2xl shadow-primary/20">
                   <Stethoscope className="w-16 h-16" />
                </div>
                <div>
                   <h1 className="text-4xl font-black tracking-tighter">Addis Medical AI</h1>
                   <p className="text-slate-500 font-medium italic">Choose your specialist and start talking</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
            {AIDoctorAgents.map((agent) => (
              <Card 
                key={agent.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2",
                  selectedAgent.id === agent.id ? "border-primary bg-primary/5" : "border-transparent"
                )}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold">
                    {agent.id}
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-tight leading-tight h-8 flex items-center">
                    {agent.specialty.split(" / ")[1] || agent.specialty}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-4 py-4">
            <Button 
              size="lg" 
              className="h-24 w-24 rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-all duration-300 ring-offset-4 ring-offset-slate-50 ring-4 ring-primary/20"
              onClick={handleStart}
            >
              <Mic className="h-10 w-10" />
            </Button>
            <p className="text-xs font-black text-primary uppercase tracking-[0.2em] animate-pulse">
               ለመጀመር ተጫኑ
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground">
               <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">ሺ - {selectedAgent.specialty.split(" / ")[1]}</h1>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">የቀጥታ የድምፅ ግንኙነት</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 bg-white/50 backdrop-blur-sm border-primary/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-wider">የድምፅ ረዳት</span>
          </Badge>
        </header>

        <Card className="flex-1 flex flex-col h-[600px] shadow-2xl border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-xl">
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full px-6 py-8" ref={scrollRef}>
              <div className="space-y-6">
                {messages.length === 0 && !isConnected && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                     <Loader2 className="w-12 h-12 animate-spin mb-4" />
                     <p className="text-sm font-bold uppercase">በመገናኘት ላይ...</p>
                  </div>
                )}
                {messages.map((msg: Message, i: number) => (
                  <ChatMessage
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    language={msg.language}
                  />
                ))}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-primary/10 text-primary rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest animate-pulse border border-primary/20">
                        አየሰማሁ ነው...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <footer className="p-8 border-t bg-white/50 dark:bg-black/60 flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <Button
                size="lg"
                variant={isConnected ? "destructive" : "default"}
                className={cn(
                  "h-24 w-24 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 border-8 border-white dark:border-slate-900",
                  isConnected && "animate-pulse shadow-red-500/20"
                )}
                onClick={toggleConversation}
              >
                {isConnected ? (
                  <MicOff className="h-10 w-10" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </Button>
              <div className="text-center">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground block">
                  {isConnected ? "ለማቆም ይጫኑ" : "እንደገና ለመጀመር ይጫኑ"}
                </span>
              </div>
            </div>
            
            {isConnected && !isStreaming && (
              <div className="flex items-center gap-2 text-primary animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">በመገናኘት ላይ...</span>
              </div>
            )}
          </footer>
        </Card>

        <p className="text-[9px] text-center text-muted-foreground/60 px-10 uppercase tracking-tighter leading-tight">
          ማሳሰቢያ- ይህ አርቴፊሻል ኢንተለጀንስ ለጤና መረጃ ብቻ የሚውል ነው። ለማንኛውም የሕክምና እርዳታ ሐኪምዎን ያማክሩ።
        </p>
      </div>
    </main>
  );
}
