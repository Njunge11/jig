import { existsSync, readFileSync } from "node:fs";

import { expect } from "@playwright/test";

import { appsOfRun } from "./apps";

/**
 * The messages of a run. The server starts with no email key and no SMS
 * key, so the console senders print each message to the server log: an
 * email as `email to <address>: <subject>` with its text under it, an SMS
 * as `sms to <phone>: <text>`.
 *
 * A run can start more than one app (`appsOfRun`): each app prints to its
 * own log, and the inbox reads each of them.
 */

const logs = appsOfRun().map((app) => app.serverLogPath);

/**
 * How many messages to each address this worker has read, in each log. The
 * server sends a message after it answers the request, so the newest message
 * in the log can be one the test opened before: a test waits for a message
 * it has not read.
 */
const read = new Map<string, number>();

/** The messages to `to` in one log, in the order its server sent them. */
function messagesIn(log: string, kind: "email" | "sms", to: string): string[] {
  const text = existsSync(log) ? readFileSync(log, "utf8") : "";
  return text
    .split(new RegExp(`^${kind} to `, "m"))
    .slice(1)
    .filter((message) => message.startsWith(`${to}:`))
    .map((message) => message.slice(to.length + 1));
}

/** The messages to `to` in each log of the run. */
function messagesTo(kind: "email" | "sms", to: string): string[] {
  return logs.flatMap((log) => messagesIn(log, kind, to));
}

/**
 * The first match of `pattern` in the newest message that this test has not
 * read, once the server has printed it. The log holds the messages of each
 * test of the run: a test reads only the messages to an address it made.
 */
async function found(
  kind: "email" | "sms",
  to: string,
  pattern: RegExp,
  what: string,
): Promise<string> {
  let match: string | undefined;
  await expect(async () => {
    const unread = logs.flatMap((log) => {
      const messages = messagesIn(log, kind, to);
      return messages.slice(read.get(`${log} ${kind} ${to}`) ?? 0);
    });
    match = unread.at(-1)?.match(pattern)?.[0];
    expect(match, `${what} sent to ${to}`).toBeTruthy();
    for (const log of logs) {
      read.set(`${log} ${kind} ${to}`, messagesIn(log, kind, to).length);
    }
  }).toPass({ timeout: 15_000 });
  return match!;
}

/** The link of the newest email to `address` that this test has not opened. */
export function linkEmailedTo(address: string): Promise<string> {
  return found("email", address, /https?:\/\/\S+/, "an email with a link");
}

/** The six-digit code of the newest SMS to `phone` that this test has not used. */
export function codeTextedTo(phone: string): Promise<string> {
  return found("sms", phone, /\b\d{6}\b/, "an SMS with a code");
}

/** The six-digit code of the newest email to `address` that this test has not used. */
export function codeEmailedTo(address: string): Promise<string> {
  return found("email", address, /\b\d{6}\b/, "an email with a code");
}

/** The SMS texts to `phone`, in the order the server sent them. */
export function textsTo(phone: string): string[] {
  return messagesTo("sms", phone);
}

/** The newest email to `address` that this test has not read: its subject, then its text. */
export function emailSentTo(address: string): Promise<string> {
  return found("email", address, /[\s\S]+/, "an email");
}

/**
 * The emails to `address` that hold `text`, in the order the server sent
 * them. A test of an email to a shared address (an owner) passes a text that
 * only it made, such as the name of its person.
 */
export function emailsTo(address: string, text = ""): string[] {
  return messagesTo("email", address).filter((message) =>
    message.includes(text),
  );
}
