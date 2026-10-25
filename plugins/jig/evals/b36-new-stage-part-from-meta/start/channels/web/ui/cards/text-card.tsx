import type { AppMessagePart } from "../app-message";

/** A text part of a message. */
function TextPart({ part }: { part: AppMessagePart }) {
  return part.type === "text" ? <p className="text-sm">{part.text}</p> : null;
}

export const textCard = { Component: TextPart };
