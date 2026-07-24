import { UndoRedoProvider } from "@/lib/undoRedo";
import { MonthProvider } from "@/lib/monthContext";
import TopHeader from "@/components/TopHeader";
import QuickAddFab from "@/components/QuickAddFab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonthProvider>
      <UndoRedoProvider>
        <div className="min-h-screen bg-paper max-w-[500px] mx-auto" style={{ fontFamily: "var(--font-dm-sans)" }}>
          <TopHeader />
          <div style={{ padding: "14px 14px 100px" }}>{children}</div>
          <QuickAddFab />
        </div>
      </UndoRedoProvider>
    </MonthProvider>
  );
}
