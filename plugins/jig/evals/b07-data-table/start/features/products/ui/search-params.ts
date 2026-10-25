/** The products list's URL state, shared by the server page and the client list. */
import { createLoader, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";
import { productSorts } from "../db/products.repo";

export const productsListParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(productSorts).withDefault("-createdAt"),
  page: parseAsInteger.withDefault(1),
};

export const loadProductsListParams = createLoader(productsListParams);
