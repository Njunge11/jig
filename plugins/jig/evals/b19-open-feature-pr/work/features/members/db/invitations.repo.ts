/** Owns the invitation rows. */
import { and, desc, eq } from "drizzle-orm";
import { invitationsTable } from "@/db/schema";
import type { Db } from "@/db/types";

export function makeInvitationsRepo(db: Db) {
  function pending(storeId: string) {
    return db
      .select({ id: invitationsTable.id, email: invitationsTable.email })
      .from(invitationsTable)
      .where(and(eq(invitationsTable.storeId, storeId), eq(invitationsTable.status, "pending")))
      .orderBy(desc(invitationsTable.createdAt));
  }

  // One statement: a new token for the store's invitation, only while it is pending.
  async function resend(invitationId: string, storeId: string, token: string) {
    const [row] = await db
      .update(invitationsTable)
      .set({ token })
      .where(
        and(
          eq(invitationsTable.id, invitationId),
          eq(invitationsTable.storeId, storeId),
          eq(invitationsTable.status, "pending"),
        ),
      )
      .returning({ id: invitationsTable.id, email: invitationsTable.email, token: invitationsTable.token });
    return row;
  }

  return { pending, resend };
}

export type InvitationsRepo = ReturnType<typeof makeInvitationsRepo>;
