import { readFileSync } from "node:fs";

import { expect } from "@playwright/test";

import { appUnderTest } from "./apps";

/**
 * The messages of a run. The server starts with no email key and no SMS
 * key, so the console senders print each message to the server log: an
 * email as `email to <address>: <subject>` with its text under it, an SMS
 * as `sms to <phone>: <text>`.
 */

const app = appUnderTest();

/**
 * How many messages to each address this worker has read. The server sends a
 * message after it answers the request, so the newest message in the log can
 * be one the test opened before: a test waits for a message it has not read.
 */
const read = new Map<string, number>();

function messagesTo(kind: "email" | "sms", to: string): string[] {
  const log = readFileSync(app.serverLogPath, "utf8");
  return log
    .split(new RegExp(`^${kind} to `, "m"))
    .slice(1)
    .filter((message) => message.startsWith(`${to}:`))
    .map((message) => message.slice(to.length + 1));
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
  const key = `${kind} ${to}`;
  let match: string | undefined;
  await expect(async () => {
    const messages = messagesTo(kind, to);
    const unread = messages.slice(read.get(key) ?? 0);
    match = unread.at(-1)?.match(pattern)?.[0];
    expect(match, `${what} sent to ${to}`).toBeTruthy();
    read.set(key, messages.length);
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
