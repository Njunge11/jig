import Link from "next/link";
import { Button } from "{{SCOPE}}/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-3 p-6">
      <h2 className="text-lg font-medium">This page does not exist</h2>
      <p className="text-sm text-muted-foreground">Check the address, or go to the home page.</p>
      <Button asChild>
        <Link href="/">Go to the home page</Link>
      </Button>
    </div>
  );
}
