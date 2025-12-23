


export interface Debtor {
  debtor_id: number;
  full_name: string;
  phone_number: string;
  total_debt: number;
}

export interface ReqDebtor {
  full_name: string;
  phone_number: string;
}

export interface Debt{
  debt_id: number;
  debtor_id: number;
  date_time: string;
  amount: number;
  status: boolean;
  remaining: number;
}

export interface ReqDebt{
  amount: number;
}

export interface DebtsHistory {
  debt_id: number;
  amount: number;
  status: boolean;
  date_time: string;
  total_paid: number;
  remaining: number;
  payments: Array<{
    payment_history_id: number;
    date_time: string;
    amount: number;
  }>;
}


export interface FilterState {
  name: string;
}

export interface FilterParams{
  name?: string;
}

export type ResulType = null | {
  success: boolean;
  message: string;
  total_paid: number;
  remaining_amount: number;
  processed_debts: Array<{
    debt_id: number;
    paid: number;
    status: "fully_paid" | "partially_paid";
  }>;
};