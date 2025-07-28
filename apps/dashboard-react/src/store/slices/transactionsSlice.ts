import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { NewTransactionData, Transaction } from "../../interfaces/dashboard";
import { parseBRL } from "../../../../utils/currency-formatte/currency-formatte";
import { fetchBalance } from "./balanceSlice";
import { parseDateBR } from "../../../../utils/date-formatte/date-formatte";

// ===============================================================
// 1. TIPOS AUXILIARES E THUNKS
// ===============================================================

// Interface para os dados que o thunk de salvar recebe do componente
export interface SavePayload {
  transactions: (Transaction & { novosAnexos?: File[] })[];
}

interface TransactionsResponse {
  transacoes: Transaction[];
  total: number;
}

interface CreateTransactionResponse {
  transacao: Transaction;
  message: string;
}

const isTransactionsResponse = (raw: unknown): raw is TransactionsResponse =>
  typeof raw === "object" && raw !== null && "transacoes" in raw && Array.isArray((raw as { transacoes: unknown }).transacoes) && "total" in raw && typeof (raw as { total: unknown }).total === "number";

const isCreateTransactionResponse = (raw: unknown): raw is CreateTransactionResponse =>
  typeof raw === "object" && raw !== null && "transacao" in raw && "message" in raw;

export const fetchTransactions = createAsyncThunk<TransactionsResponse, number, { rejectValue: string }>(
  "transactions/fetchTransactions",
  async (page, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/transacao?page=${page}&limit=10`);
      if (!response.ok) return rejectWithValue("Falha ao buscar transações.");
      const raw: unknown = await response.json();
      if (isTransactionsResponse(raw)) return raw;
      return rejectWithValue("Formato inesperado na resposta do servidor.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      return rejectWithValue(message);
    }
  }
);

export const createNewTransaction = createAsyncThunk<Transaction, NewTransactionData, { rejectValue: string }>(
  "transactions/createNew",
  async (transactionData, { dispatch, rejectWithValue }) => {
    try {
      const payload = { ...transactionData, valor: parseBRL(transactionData.valor) };
      const res = await fetch("/api/transacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errRaw: unknown = await res.json();
        const errMsg = typeof errRaw === "object" && errRaw !== null && "message" in errRaw ? String((errRaw as { message: unknown }).message) : "Falha ao adicionar transação";
        return rejectWithValue(errMsg);
      }
      const raw: unknown = await res.json();
      if (isCreateTransactionResponse(raw)) {
        alert(raw.message);
        await dispatch(fetchBalance()).unwrap();
        return raw.transacao;
      }
      return rejectWithValue("Formato inesperado na resposta do servidor.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      return rejectWithValue(message);
    }
  }
);

// ATUALIZADO: O thunk agora recebe um payload com as transações a salvar
export const saveTransactions = createAsyncThunk<void, SavePayload, { rejectValue: string }>(
  "transactions/saveMultiple",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all(
        payload.transactions.map(async (tx) => {
          // A lógica de FormData vs JSON permanece aqui, centralizada.
          if (tx.novosAnexos && tx.novosAnexos.length > 0) {
            const fd = new FormData();
            fd.append("tipo", tx.tipo);
            fd.append("valor", tx.valor.toString());
            fd.append("updatedAt", parseDateBR(tx.updatedAt));
            tx.novosAnexos.forEach((file) => fd.append("anexos", file));
            await fetch(`/api/transacao/${tx._id}`, { method: "PUT", body: fd });
          } else {
            await fetch(`/api/transacao/${tx._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tipo: tx.tipo, valor: tx.valor, anexos: tx.anexos }),
            });
          }
        })
      );
      dispatch(clearTransactions());
      await dispatch(fetchTransactions(1)).unwrap();
      await dispatch(fetchBalance()).unwrap();
    } catch (err: unknown) {
      return rejectWithValue("Falha ao salvar as transações." + (err instanceof Error ? `: ${err.message}` : ""));
    }
  }
);

export const deleteTransactions = createAsyncThunk<void, number[], { rejectValue: string }>(
  "transactions/deleteMultiple",
  async (transactionIds, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all(
        transactionIds.map(async (id) => {
          await fetch(`/api/transacao/${id}`, { method: "DELETE" });
        })
      );
      dispatch(clearTransactions());
      await dispatch(fetchTransactions(1)).unwrap();
      await dispatch(fetchBalance()).unwrap();
    } catch (err: unknown) {
      return rejectWithValue("Falha ao excluir as transações." + (err instanceof Error ? `: ${err.message}` : ""));
    }
  }
);

// ===============================================================
// 2. ESTADO INICIAL E SLICE
// ===============================================================
interface TransactionsState {
  items: Transaction[];
  total: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  creationStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  hasMore: boolean;
}

const initialState: TransactionsState = {
  items: [],
  total: 0,
  status: "idle",
  creationStatus: "idle",
  error: null,
  currentPage: 0,
  hasMore: true,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.items = [];
      state.currentPage = 0;
      state.hasMore = true;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.status = "loading"; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        const newItems = action.payload.transacoes.filter((newItem) => !state.items.some((item) => item._id === newItem._id));
        state.items.push(...newItems);
        state.total = action.payload.total;
        state.currentPage += 1;
        state.hasMore = state.items.length < state.total;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Erro desconhecido";
      })
      .addCase(createNewTransaction.pending, (state) => { state.creationStatus = "loading"; })
      .addCase(createNewTransaction.fulfilled, (state, action) => {
        state.creationStatus = "succeeded";
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createNewTransaction.rejected, (state, action) => {
        state.creationStatus = "failed";
        state.error = action.payload ?? "Erro desconhecido";
      })
      .addCase(saveTransactions.pending, (state) => { state.status = "loading"; })
      .addCase(deleteTransactions.pending, (state) => { state.status = "loading"; });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;