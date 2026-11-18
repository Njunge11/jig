"use client";
import "./globals.css";
import { RouteError } from "@/components/ui/route-error";

export default function GlobalError(props: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body>
        <RouteError {...props} />
      </body>
    </html>
  );
}
