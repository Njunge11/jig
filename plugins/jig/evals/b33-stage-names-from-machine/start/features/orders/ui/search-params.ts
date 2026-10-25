/** The orders page's URL state, shared by the server page and the client list. */
import { createLoader, parseAsStringLiteral } from "nuqs/server";
import { ORDER_STAGES } from "./order-stages";

export const ordersListParams = {
  stage: parseAsStringLiteral(ORDER_STAGES).withDefault("to_pack"),
};

export const loadOrdersListParams = createLoader(ordersListParams);
