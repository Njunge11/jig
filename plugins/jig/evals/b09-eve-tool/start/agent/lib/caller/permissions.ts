/** The permissions a caller of the agent's tools can hold. */
export const PERMISSIONS = {
  ORDERS_READ: "orders:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
