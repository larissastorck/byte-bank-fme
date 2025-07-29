import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { NewTransactionData, Transaction } from "../../interfaces/dashboard";
import { parseBRL } from "../../../../utils/currency-formatte/currency-formatte";
import { fetchBalance } from "./balanceSlice";

// ===============================================================
// 1. TIPOS AUXILIARES E THUNKS
// ===============================================================

export interface SavePayload {
  transactions: (Transaction & { novosAnexos?: File[] })[];
}

export const fetchTransactions = createAsyncThunk<Transaction[], void, { rejectValue: string }>(
  "transactions/fetchTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://6888d5f9adf0e59551bb9b6c.mockapi.io/transacoes`);
      if (!response.ok) return rejectWithValue("Falha ao buscar transações.");

      const rawData: Transaction[] = await response.json();

      // Garante que todos tenham anexos como array
      const data = rawData.map((tx) => ({
        ...tx,
        anexos: Array.isArray(tx.anexos) ? tx.anexos : [],
      }));

      return data;
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
      const res = await fetch("https://6888d5f9adf0e59551bb9b6c.mockapi.io/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return rejectWithValue("Falha ao adicionar transação");
      }

      const newTransaction: Transaction = await res.json();
      return newTransaction;

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      return rejectWithValue(message);
    }
  }
);

export const saveTransactions = createAsyncThunk<void, SavePayload, { rejectValue: string }>(
  "transactions/saveMultiple",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all(
        payload.transactions.map(async (tx) => {
          await fetch(`https://6888d5f9adf0e59551bb9b6c.mockapi.io/transacoes/${tx._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tipo: tx.tipo, valor: tx.valor, anexos: tx.anexos }),
          });
        })
      );
      await dispatch(fetchTransactions()).unwrap();
    } catch (err: unknown) {
      return rejectWithValue("Falha ao salvar as transações." + (err instanceof Error ? `: ${err.message}` : ""));
    }
  }
);

export const deleteTransactions = createAsyncThunk<number[], number[], { rejectValue: string }>(
  "transactions/deleteMultiple",
  async (transactionIds, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all(
        transactionIds.map(async (id) => {
          await fetch(`https://6888d5f9adf0e59551bb9b6c.mockapi.io/transacoes/${id}`, { method: "DELETE" });
        })
      );
      await dispatch(fetchTransactions()).unwrap();
      return transactionIds;
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
  status: "idle" | "loading" | "succeeded" | "failed";
  creationStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TransactionsState = {
  items: [],
  status: "idle",
  creationStatus: "idle",
  error: null,
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.items = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.status = "loading"; })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Erro desconhecido";
      })
      .addCase(createNewTransaction.pending, (state) => { state.creationStatus = "loading"; })
      .addCase(createNewTransaction.fulfilled, (state, action) => {
        state.creationStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createNewTransaction.rejected, (state, action) => {
        state.creationStatus = "failed";
        state.error = action.payload ?? "Erro desconhecido";
      })
      .addCase(saveTransactions.pending, (state) => { state.status = "loading"; })
      .addCase(deleteTransactions.pending, (state) => { state.status = "loading"; })
      .addCase(deleteTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        const deletedIds = action.payload;
        state.items = state.items.filter(item => !deletedIds.includes(item._id));
      })
      .addCase(deleteTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;
