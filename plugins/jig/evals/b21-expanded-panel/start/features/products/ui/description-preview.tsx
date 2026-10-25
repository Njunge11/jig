import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** The preview column: the description as the product page shows it. */
export function DescriptionPreview({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{description || "No description yet"}</p>
      </CardContent>
    </Card>
  );
}
