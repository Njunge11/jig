/** Remembers which notifications were sent, so a retry does not send one twice. */
import { trace } from "@/db/call-trace";
import type { NotificationsRepo } from "../db/notifications.repo";

export function makeNotificationsService(deps: { repo: NotificationsRepo; now: () => Date }) {
  const wasSent = (key: string) => trace("calling repo.exists to check the sent marker", () => deps.repo.exists(key));

  const markSent = (key: string) => trace("calling repo.insert to write the sent marker", () => deps.repo.insert(key, deps.now()));

  return { wasSent, markSent };
}
