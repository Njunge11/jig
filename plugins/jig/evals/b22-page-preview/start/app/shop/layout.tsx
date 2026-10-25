import "./storefront.css";

/** The public shop: every page under it renders in the shop's theme scope. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="storefront" className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
