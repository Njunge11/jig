import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import { render } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { TRPCProvider } from "@/lib/trpc/react";
import type { AppRouter } from "@/lib/trpc/routers/_app";
import { TRPC_URL } from "./msw";

const makeTestClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient = makeTestClient(), searchParams = "" }: { queryClient?: QueryClient; searchParams?: string } = {},
) {
  const trpcClient = createTRPCClient<AppRouter>({ links: [httpLink({ url: TRPC_URL })] });
  return render(
    <NuqsTestingAdapter searchParams={searchParams}>
      <QueryClientProvider client={queryClient}>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          {ui}
        </TRPCProvider>
      </QueryClientProvider>
    </NuqsTestingAdapter>,
  );
}
