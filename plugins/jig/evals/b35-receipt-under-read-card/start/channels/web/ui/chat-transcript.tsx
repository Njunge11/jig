"use client";
import type { AppMessage, AppMessagePart } from "./app-message";
import { cardFor } from "./cards";
import { lastCardOfEachOrder } from "./last-card-of-each-order";
import { StagedPart } from "./staged-part";

function MessagePart({ part, lastCards }: { part: AppMessagePart; lastCards: Set<AppMessagePart> }) {
  const card = cardFor(part);
  if (!card) return null;
  if (card.staged) return <StagedPart card={card} part={part} isLastCard={lastCards.has(part)} />;
  return <card.Component part={part} />;
}

/** The chat's messages, one card per part. */
export function ChatTranscript({ messages }: { messages: AppMessage[] }) {
  const lastCards = lastCardOfEachOrder(messages);
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col gap-2">
          {message.parts.map((part, index) => (
            <MessagePart key={index} part={part} lastCards={lastCards} />
          ))}
        </div>
      ))}
    </div>
  );
}
