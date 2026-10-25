import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/lib/trpc/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NuqsAdapter>
          <TRPCReactProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="p-4">{children}</SidebarInset>
            </SidebarProvider>
          </TRPCReactProvider>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
