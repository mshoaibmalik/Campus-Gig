import { createFileRoute } from "@tanstack/react-router";
import { AppShell, AuthGate } from "@/components/AppShell";

export const Route = createFileRoute("/_app")({
  component: () => (
    <AuthGate>
      <AppShell />
    </AuthGate>
  ),
});
