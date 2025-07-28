/* --------------------------------------------------------------------------- */
/* TYPES & INTERFACES                                                          */
/* --------------------------------------------------------------------------- */

export interface Attachment {
  name: string;
  url: string;
}

export interface Entity {
  id: number;
}

export interface ValueField {
  value: number;
}

export interface Labelled {
  label: string;
}

export interface User {
  name: string;
}

export interface Balance extends ValueField {
  account: string;
}

/* ---------- TRANSACTIONS --------------------------------------------------- */
export type TransactionType =
  | "cambio"
  | "deposito"
  | "transferencia"
  | "saque"
  | (string & {});

export interface Transaction {
  _id: number;
  tipo: TransactionType;
  valor: number;
  createdAt: string;
  updatedAt: string;
  anexos?: Attachment[];
}

export interface TxWithFiles extends Transaction {
  novosAnexos?: File[];
}

/* ---------- DASHBOARD ------------------------------------------------------ */
export interface Investment extends Entity, Labelled, ValueField {}

export interface DashboardData {
  user: User;
  balance: Balance;
  transactions: Transaction[];
  investments: Investment[];
}

/* ---------- LISTS ---------------------------------------------------------- */
export interface ListProps<T extends Entity> {
  items: T[];
  onSave?: (items: T[]) => void;
}

export interface TransactionListProps {
  transactions: Transaction[];
  onSave?: (transactions: Transaction[]) => void;
}

/* ---------- COMPONENT-PROP TYPES ------------------------------------------ */
export interface CadInvestmentsProps {
  balance: Balance;
  investments: Investment[];
}

export interface CardBalanceProps {
  user: User;
  balance: Balance;
}

export interface SkeletonProps {
  rows?: number;
}

export interface CardNewTransactionProps {
  onSubmit: (data: NewTransactionData) => Promise<void>;
  isLoading: boolean;
}

/* ---------- AUTH ----------------------------------------------------------- */
export interface EmailField {
  email: string;
}

export type ForgotPasswordData = EmailField;

export interface LoginData extends EmailField {
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export interface UserInfo {
  name: string;
  email: string;
  password: string;
}


export interface BalanceState {
  value: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}


/* ---------- FORM DATA ------------------------------------------------------ */
export interface NewTransactionData {
  tipo: TransactionType;
  valor: string;
  categoria?: string;
  anexos?: FileList;
}

/* ---------- HEADER & DASHBOARD FLAGS -------------------------------------- */
export interface HeaderFlags {
  isHome: boolean;
  isDashboard: boolean;
  isInvestments: boolean;

  showPublicLinks: boolean;
  showInternalLinks: boolean;
  showDashboardBtn: boolean;
}

/* ---------- WIDGET PROPS --------------------------------------------------- */
export interface SavingsGoalProps {
  goal: number;
  transactions: Transaction[];
}

export type TypeFilter = "all" | "deposito" | "saque";

export interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  typeFilter: TypeFilter;
  setTypeFilter: (value: TypeFilter) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export interface SpendingAlertProps {
  limit: number;
  transactions: Transaction[];
}

/* --------------------------------------------------------------------------- */
