import { UndoRedoProvider } from "@/lib/undoRedo";
import { MonthProvider } from "@/lib/monthContext";
import AppShell from "@/components/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonthProvider>
      <UndoRedoProvider>
        <AppShell>{children}</AppShell>
      </UndoRedoProvider>
    </MonthProvider>
  );
}
