import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/lib/trpc/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NuqsAdapter>
          <TRPCReactProvider>
            <OfflineBanner />
            {children}
          </TRPCReactProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
