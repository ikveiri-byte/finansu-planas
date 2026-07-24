import { createClient } from "@/lib/supabase/client";
import type { Debt, ExpenseCategory, FixedExpense, PlannedPurchase, Transaction } from "@/lib/types";

// getSession() reads the already-verified session from local storage/memory —
// no network round-trip — unlike getUser(), which always re-checks with the
// auth server. We already rely on RLS (auth.uid()) for security on every query,
// so we only need the id here to stamp new rows; getSession() is enough and
// meaningfully faster, especially on slower mobile connections.
async function getUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

// ----------------------------------------------------------------------------
// Transactions
// ----------------------------------------------------------------------------
export async function fetchMonthTransactions(year: number, month: number): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("txn_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Transaction[];
}

export async function addIncome(params: {
  description: string;
  amount: number;
  year: number;
  month: number;
  txn_date: string;
}) {
  const supabase = createClient();
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: "income",
      description: params.description,
      category: null,
      amount: params.amount,
      txn_date: params.txn_date,
      year: params.year,
      month: params.month,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Transaction;
}

export async function addExpense(params: {
  description: string;
  category: ExpenseCategory;
  amount: number;
  year: number;
  month: number;
  txn_date: string;
  isFixed: boolean;
  fixedEndYear?: number | null;
  fixedEndMonth?: number | null;
}) {
  const supabase = createClient();
  const userId = await getUserId();

  let fixedExpenseId: string | null = null;

  if (params.isFixed) {
    const { data: fx, error: fxErr } = await supabase
      .from("fixed_expenses")
      .insert({
        user_id: userId,
        description: params.description,
        category: params.category,
        amount: params.amount,
        start_year: params.year,
        start_month: params.month,
        end_year: params.fixedEndYear ?? null,
        end_month: params.fixedEndMonth ?? null,
      })
      .select()
      .single();
    if (fxErr) throw fxErr;
    fixedExpenseId = fx.id;
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: "expense",
      description: params.description,
      category: params.category,
      amount: params.amount,
      txn_date: params.txn_date,
      year: params.year,
      month: params.month,
      is_fixed: params.isFixed,
      fixed_expense_id: fixedExpenseId,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Transaction;
}

export async function updateTransactionAmount(id: string, amount: number) {
  const supabase = createClient();
  const { error } = await supabase.from("transactions").update({ amount }).eq("id", id);
  if (error) throw error;
}

export async function deleteTransaction(txn: Transaction) {
  const supabase = createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", txn.id);
  if (error) throw error;

  // if this was a fixed-expense instance, tombstone this month so it doesn't regenerate
  if (txn.fixed_expense_id) {
    const key = `${txn.year}-${String(txn.month).padStart(2, "0")}`;
    const { data: fx } = await supabase
      .from("fixed_expenses")
      .select("deleted_instances")
      .eq("id", txn.fixed_expense_id)
      .single();
    const updated = Array.from(new Set([...(fx?.deleted_instances ?? []), key]));
    await supabase
      .from("fixed_expenses")
      .update({ deleted_instances: updated })
      .eq("id", txn.fixed_expense_id);
  }
}

export async function restoreTransaction(txn: Transaction) {
  // used by undo — re-insert a previously deleted transaction verbatim
  const supabase = createClient();
  const { id, ...rest } = txn;
  const { error } = await supabase.from("transactions").insert({ id, ...rest });
  if (error) throw error;
  if (txn.fixed_expense_id) {
    const key = `${txn.year}-${String(txn.month).padStart(2, "0")}`;
    const { data: fx } = await supabase
      .from("fixed_expenses")
      .select("deleted_instances")
      .eq("id", txn.fixed_expense_id)
      .single();
    const updated = (fx?.deleted_instances ?? []).filter((k: string) => k !== key);
    await supabase
      .from("fixed_expenses")
      .update({ deleted_instances: updated })
      .eq("id", txn.fixed_expense_id);
  }
}

// ----------------------------------------------------------------------------
// Fixed expenses — make sure the current month has instances materialised
// for every still-active rule (called once when a month is opened)
// ----------------------------------------------------------------------------
export async function ensureFixedExpenseInstances(year: number, month: number) {
  const supabase = createClient();

  const { data: rules, error } = await supabase
    .from("fixed_expenses")
    .select("*")
    .lte("start_year", year); // rough pre-filter, exact check below
  if (error) throw error;
  if (!rules || rules.length === 0) return; // nothing to do — skip the extra round trips entirely

  const userId = await getUserId();
  const key = `${year}-${String(month).padStart(2, "0")}`;

  const applicable = (rules as FixedExpense[]).filter((fx) => {
    const startsBefore = fx.start_year < year || (fx.start_year === year && fx.start_month <= month);
    const endsAfter =
      fx.end_year == null ||
      fx.end_year > year ||
      (fx.end_year === year && (fx.end_month ?? 12) >= month);
    return startsBefore && endsAfter && !fx.deleted_instances?.includes(key);
  });

  // check + insert for every still-active rule in parallel instead of one-by-one
  await Promise.all(
    applicable.map(async (fx) => {
      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("fixed_expense_id", fx.id)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle();
      if (existing) return;

      await supabase.from("transactions").insert({
        user_id: userId,
        type: "expense",
        description: fx.description,
        category: fx.category,
        amount: fx.amount,
        txn_date: `${year}-${String(month).padStart(2, "0")}-01`,
        year,
        month,
        is_fixed: true,
        fixed_expense_id: fx.id,
      });
    })
  );
}

export async function fetchFixedExpenses(): Promise<FixedExpense[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fixed_expenses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as FixedExpense[];
}

export async function updateFixedExpenseRange(
  id: string,
  patch: { start_year?: number; start_month?: number; end_year?: number | null; end_month?: number | null }
) {
  const supabase = createClient();
  const { error } = await supabase.from("fixed_expenses").update(patch).eq("id", id);
  if (error) throw error;
}

export async function stopFixedExpense(id: string, fromYear: number, fromMonth: number) {
  // stop = set an end date the month BEFORE fromYear/fromMonth
  let endYear = fromYear;
  let endMonth = fromMonth - 1;
  if (endMonth === 0) {
    endMonth = 12;
    endYear -= 1;
  }
  await updateFixedExpenseRange(id, { end_year: endYear, end_month: endMonth });
}

// ----------------------------------------------------------------------------
// Savings goal
// ----------------------------------------------------------------------------
export async function fetchSavingsGoal(year: number, month: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSavingsGoal(year: number, month: number, amount: number) {
  const supabase = createClient();
  const userId = await getUserId();
  const { error } = await supabase
    .from("savings_goals")
    .upsert(
      { user_id: userId, year, month, goal_amount: amount },
      { onConflict: "user_id,year,month" }
    );
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Debts
// ----------------------------------------------------------------------------
export async function fetchMonthDebts(year: number, month: number): Promise<Debt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Debt[];
}

export async function addDebt(params: { person_name: string; amount: number; year: number; month: number }) {
  const supabase = createClient();
  const userId = await getUserId();
  const { error } = await supabase.from("debts").insert({ ...params, user_id: userId });
  if (error) throw error;
}

export async function toggleDebtSettled(id: string, settled: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("debts")
    .update({ is_settled: settled, settled_at: settled ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDebt(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("debts").delete().eq("id", id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Planned purchases
// ----------------------------------------------------------------------------
export async function fetchMonthPlannedPurchases(year: number, month: number): Promise<PlannedPurchase[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("planned_purchases")
    .select("*")
    .eq("year", year)
    .eq("month", month)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as PlannedPurchase[];
}

export async function addPlannedPurchase(params: {
  description: string;
  amount: number | null;
  year: number;
  month: number;
}) {
  const supabase = createClient();
  const userId = await getUserId();
  const { error } = await supabase.from("planned_purchases").insert({ ...params, user_id: userId });
  if (error) throw error;
}

export async function togglePurchaseDone(id: string, done: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("planned_purchases")
    .update({ is_purchased: done, purchased_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePlannedPurchase(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("planned_purchases").delete().eq("id", id);
  if (error) throw error;
}

// ----------------------------------------------------------------------------
// Statistics — aggregate over an arbitrary date range
// ----------------------------------------------------------------------------
export async function fetchAllTransactions(): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("txn_date", { ascending: true });
  if (error) throw error;
  return data as Transaction[];
}

export async function fetchTransactionsInRange(fromDate: string, toDate: string): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("txn_date", fromDate)
    .lte("txn_date", toDate)
    .order("txn_date", { ascending: true });
  if (error) throw error;
  return data as Transaction[];
}

export async function fetchSavingsGoalsInRange(fromYear: number, fromMonth: number, toYear: number, toMonth: number) {
  const supabase = createClient();
  const { data, error } = await supabase.from("savings_goals").select("*");
  if (error) throw error;
  return (data ?? []).filter((g) => {
    const idx = g.year * 12 + g.month;
    return idx >= fromYear * 12 + fromMonth && idx <= toYear * 12 + toMonth;
  });
}
