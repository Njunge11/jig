/** The store policy: which store a user may act on with a permission. */
import type { Permission } from "./permissions";

export type Authz = {
  // The store the user may act on with the permission, or null.
  storeFor(userId: string, storeId: string, permission: Permission): Promise<string | null>;
};

// The fixture has no roles table: every user of a store holds every permission in it.
async function storeFor(_userId: string, storeId: string, _permission: Permission) {
  return storeId;
}

export const authz: Authz = { storeFor };
