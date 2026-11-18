import { defaultShouldDehydrateQuery, isServer, MutationCache, QueryClient } from "@tanstack/react-query";
import { isExpectedFailure, showMutationFailure } from "./failure";

export function makeQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => showMutationFailure(error, mutation),
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // The server does not retry. The browser does not retry a failure that the server sends on purpose.
        retry: (failureCount, error) => !isServer && failureCount < 3 && !isExpectedFailure(error),
      },
      dehydrate: {
        shouldDehydrateQuery: (q) => defaultShouldDehydrateQuery(q) || q.state.status === "pending",
        shouldRedactErrors: () => false,
      },
    },
  });
}
