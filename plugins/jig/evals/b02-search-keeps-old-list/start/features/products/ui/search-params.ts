/** The products list's URL state, shared by the server page and the client list. */
import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

export const productsListParams = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const loadProductsListParams = createLoader(productsListParams);
