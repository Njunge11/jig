#!/bin/bash
set -euo pipefail
mkdir -p apps/admin apps/vendor/src/features/documents/api apps/vendor/src/features/documents/ui apps/store \
  packages/db/src packages/email/src infra
cat > package.json <<'JSON'
{
  "name": "marketplace",
  "private": true,
  "packageManager": "pnpm@10.12.1",
  "scripts": { "dev": "turbo run dev", "build": "turbo run build", "lint": "turbo run lint", "typecheck": "turbo run typecheck" },
  "devDependencies": { "turbo": "^2.5.0", "typescript": "^5.8.0" }
}
JSON
printf 'packages:\n  - "apps/*"\n  - "packages/*"\n' > pnpm-workspace.yaml
port=3000
for app in admin vendor store; do
cat > apps/$app/package.json <<JSON
{
  "name": "@marketplace/$app",
  "private": true,
  "scripts": { "dev": "next dev -p $port", "build": "next build", "start": "next start -p $port" },
  "dependencies": { "next": "^16.0.0", "react": "^19.2.0", "react-dom": "^19.2.0", "@marketplace/db": "workspace:*", "@marketplace/email": "workspace:*" }
}
JSON
port=$((port + 1))
done
cat > packages/db/src/client.ts <<'TS'
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// One Postgres database for every app, behind a session pooler.
const client = postgres(process.env.DATABASE_URL!, { max: 4 });

export const db = drizzle(client);
TS
cat > packages/email/src/send.ts <<'TS'
type Email = { to: string; subject: string; text: string };

export async function sendEmail(email: Email): Promise<void> {
  const key = process.env.EMAIL_API_KEY;
  if (!key) {
    // No key: print the email to the server log.
    console.log(`email to ${email.to}: ${email.subject}\n${email.text}`);
    return;
  }
  await fetch("https://api.email-provider.example/send", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(email),
  });
}
TS
cat > apps/vendor/src/features/documents/api/documents.service.ts <<'TS'
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.BUCKET_REGION });

// The browser posts the file straight to the bucket with these fields.
export async function createDocumentUpload(vendorId: string, fileName: string) {
  return createPresignedPost(s3, {
    Bucket: process.env.DOCUMENTS_BUCKET!,
    Key: `vendors/${vendorId}/${crypto.randomUUID()}-${fileName}`,
    Conditions: [["content-length-range", 1, 10 * 1024 * 1024]],
    Expires: 300,
  });
}
TS
cat > apps/vendor/src/features/documents/ui/upload-document.tsx <<'TSX'
"use client";

type Upload = { url: string; fields: Record<string, string> };

export async function uploadDocument(upload: Upload, file: File): Promise<void> {
  const body = new FormData();
  for (const [name, value] of Object.entries(upload.fields)) body.append(name, value);
  body.append("file", file);
  const response = await fetch(upload.url, { method: "POST", body });
  if (!response.ok) throw new Error("The upload failed");
}
TSX
cat > infra/documents-bucket-cors.json <<'JSON'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "https://vendor.marketplace.example"],
      "AllowedMethods": ["POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
JSON
cat > infra/README.md <<'MD'
# Infra

`documents-bucket-cors.json` is the CORS of the documents bucket. Apply a change with:

    aws s3api put-bucket-cors --bucket "$DOCUMENTS_BUCKET" --cors-configuration file://infra/documents-bucket-cors.json
MD
cat > .env.example <<'ENV'
# One Postgres database, through the session pooler. The pooler gives 15 connections in total.
DATABASE_URL=
AUTH_URL=http://localhost:3001
# With no key, each email prints to the server log.
EMAIL_API_KEY=
DOCUMENTS_BUCKET=
BUCKET_REGION=
ENV
cat > README.md <<'MD'
# Marketplace

Three Next.js apps in one workspace: `admin` (port 3000), `vendor` (port 3001), `store` (port 3002).
`pnpm dev` starts the three dev servers. A vendor signs in with an emailed link.
MD
git init -q
git add -A
git -c user.name=fixture -c user.email=fixture@example.com commit -q -m "chore: the repo"
