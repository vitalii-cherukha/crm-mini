import { type ReactNode } from "react";
import { Users } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Users className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">Mini-CRM</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}
