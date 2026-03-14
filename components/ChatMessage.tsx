import { cn } from "../lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  language?: string;
}

export default function ChatMessage({ content, role, language }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-card text-card-foreground border rounded-tl-none"
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        {!isUser && language && (
          <span className="absolute -bottom-5 left-0 text-[10px] text-muted-foreground uppercase font-bold">
            {language === "am" ? "Amharic" : "English"}
          </span>
        )}
      </div>
    </div>
  );
}
