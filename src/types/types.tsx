
export interface Details {
  name: string;
}

export interface Car {
  car_id: number;
  model: string;
  color: string;
  year_purchased: number;
  details: Details[];
}

export interface ReqCar {
  model: string;
  color: string;
  year_purchased: number;
  details: Details[];
}


export interface FilterState {
  model: string;
  color: string;
  year: number;
}

export interface FilterParams{
  model?: string;
  color?: string;
  year?: number;
}


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