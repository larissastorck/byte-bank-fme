import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "../store/slices/transactionsSlice";
import balanceReducer from "../store/slices/balanceSlice";
import widgetPreferencesReducer from "../store/slices/widgetPreferencesSlice";
export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    balance: balanceReducer,
    widgetPreferences: widgetPreferencesReducer,
  },
});
export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
