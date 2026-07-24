import { UndoRedoProvider } from "@/lib/undoRedo";
import { MonthProvider } from "@/lib/monthContext";
import TopHeader from "@/components/TopHeader";
import QuickAddFab from "@/components/QuickAddFab";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonthProvider>
      <UndoRedoProvider>
        <div className="min-h-screen bg-appbg max-w-[500px] mx-auto" style={{ fontFamily: "var(--font-dm-sans)" }}>
          <TopHeader />
          <div style={{ padding: "16px 14px 110px" }}>{children}</div>
          <QuickAddFab />
        </div>
      </UndoRedoProvider>
    </MonthProvider>
  );
}
