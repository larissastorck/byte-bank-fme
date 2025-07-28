import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BalanceState } from "../../interfaces/dashboard";

// Utilitários de tipo
interface BalanceResponse {
  total: number;
}

export const fetchBalance = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("balance/fetchBalance", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/transacao/soma-depositos");

    if (!res.ok) {
      return rejectWithValue("Falha ao buscar o saldo");
    }

    const raw: unknown = await res.json();

    if (
      typeof raw === "object" &&
      raw !== null &&
      "total" in raw &&
      typeof (raw as { total: unknown }).total === "number"
    ) {
      return (raw as BalanceResponse).total;
    }

    return rejectWithValue("Resposta da API em formato inesperado");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro inesperado";
    return rejectWithValue(message);
  }
});

const initialState: BalanceState = {
  value: 0,
  status: "idle",
  error: null,
};

const balanceSlice = createSlice({
  name: "balance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalance.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.value = action.payload;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Erro desconhecido";
      });
  },
});

export default balanceSlice.reducer;
