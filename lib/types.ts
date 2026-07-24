export type ExpenseCategory =
  | "Maistas"
  | "Takeout"
  | "Nuoma"
  | "Transportas"
  | "Telefonas, mini mokesčiai"
  | "Pramogos"
  | "Šmutkės"
  | "Kita";

export const CATEGORIES: ExpenseCategory[] = [
  "Maistas",
  "Takeout",
  "Nuoma",
  "Transportas",
  "Telefonas, mini mokesčiai",
  "Pramogos",
  "Šmutkės",
  "Kita",
];

export type Transaction = {
  id: string;
  user_id: string;
  type: "income" | "expense";
  description: string;
  category: ExpenseCategory | null;
  amount: number;
  txn_date: string; // ISO date
  year: number;
  month: number;
  is_fixed: boolean;
  fixed_expense_id: string | null;
  is_historical_import: boolean;
  created_at: string;
};

export type FixedExpense = {
  id: string;
  user_id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  start_year: number;
  start_month: number;
  end_year: number | null;
  end_month: number | null;
  deleted_instances: string[];
  created_at: string;
};

export type SavingsGoal = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  goal_amount: number;
};

export type Debt = {
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  year: number;
  month: number;
  is_settled: boolean;
  settled_at: string | null;
  created_at: string;
};

export type PlannedPurchase = {
  id: string;
  user_id: string;
  description: string;
  amount: number | null;
  year: number;
  month: number;
  is_purchased: boolean;
  purchased_at: string | null;
  created_at: string;
};
