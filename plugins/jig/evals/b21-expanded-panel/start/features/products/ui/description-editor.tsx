import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

/** The panel where the user writes the product's description. */
export function DescriptionEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Description</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          aria-label="Description"
          className="min-h-64"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
