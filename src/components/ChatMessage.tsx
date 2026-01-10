
import { cn } from "@/lib/utils";
import { memo } from "react";
import { Source } from "@/types/chat";
import { MessageContainer } from "./chat-message/MessageContainer";

interface ChatMessageProps {
  message: string;
  isAi: boolean;
  isLatest?: boolean;
  sources?: Source[];
  imageUrl?: string;
}

export const ChatMessage = memo(({ message, isAi, isLatest, sources = [], imageUrl }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-message-fade-in opacity-0",
        isAi ? "justify-start" : "justify-end"
      )}
    >
      <MessageContainer
        message={message}
        isAi={isAi}
        sources={sources}
        imageUrl={imageUrl}
      />
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";
