


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
      debtor_id: number;
      date_time: string;
      amount: number;
      status: boolean;
      payments: [
        {
          payment_history_id: number;
          debt_id: number;
          date_time: string;
          amount: number;
        }
      ];
}


export interface FilterState {
  name: string;
}

export interface FilterParams{
  name?: string;
}