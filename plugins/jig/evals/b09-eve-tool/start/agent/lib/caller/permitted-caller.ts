/** Reads the caller the channel's auth walk left on the session and asks the policy one question. */
import type { SessionContext } from "eve/tools";
import type { Authz } from "./authz";
import type { Permission } from "./permissions";

export async function permittedCaller(
  ctx: SessionContext,
  authz: Authz,
  permission: Permission,
): Promise<{ storeId: string } | null> {
  const caller = ctx.session.auth.current;
  const storeId = caller?.attributes.storeId;
  if (!caller || typeof storeId !== "string") return null;
  const permitted = await authz.storeFor(caller.principalId, storeId, permission);
  return permitted ? { storeId: permitted } : null;
}
