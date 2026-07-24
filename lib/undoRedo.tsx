"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Action = {
  label: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
};

type UndoRedoContextValue = {
  pushAction: (action: Action) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  lastLabel: string | null;
};

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const undoStack = useRef<Action[]>([]);
  const redoStack = useRef<Action[]>([]);
  const [, forceRender] = useState(0);
  const bump = () => forceRender((n) => n + 1);

  const pushAction = useCallback((action: Action) => {
    undoStack.current.push(action);
    redoStack.current = []; // new action invalidates redo history
    bump();
  }, []);

  const undo = useCallback(async () => {
    const action = undoStack.current.pop();
    if (!action) return;
    await action.undo();
    redoStack.current.push(action);
    bump();
  }, []);

  const redo = useCallback(async () => {
    const action = redoStack.current.pop();
    if (!action) return;
    await action.redo();
    undoStack.current.push(action);
    bump();
  }, []);

  return (
    <UndoRedoContext.Provider
      value={{
        pushAction,
        undo,
        redo,
        canUndo: undoStack.current.length > 0,
        canRedo: redoStack.current.length > 0,
        lastLabel: undoStack.current.at(-1)?.label ?? null,
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedo() {
  const ctx = useContext(UndoRedoContext);
  if (!ctx) throw new Error("useUndoRedo must be used within UndoRedoProvider");
  return ctx;
}
