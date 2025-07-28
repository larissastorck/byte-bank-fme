import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WidgetPreferences = {
  savingsGoal: boolean;
  spendingAlert: boolean;
};

const defaultPreferences: WidgetPreferences = {
  savingsGoal: true,
  spendingAlert: true,
};

const getInitialPreferences = (): WidgetPreferences => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("widgetPreferences");
    if (saved) {
      try {
        return JSON.parse(saved) as WidgetPreferences;
      } catch {
        return defaultPreferences;
      }
    }
  }
  return defaultPreferences;
};

const initialState: WidgetPreferences = getInitialPreferences();

export const widgetPreferencesSlice = createSlice({
  name: "widgetPreferences",
  initialState,
  reducers: {
    togglePreference: (
      state,
      action: PayloadAction<keyof WidgetPreferences>
    ) => {
      state[action.payload] = !state[action.payload];
      localStorage.setItem("widgetPreferences", JSON.stringify(state));
    },
    setPreferences: (state, action: PayloadAction<WidgetPreferences>) => {
      localStorage.setItem("widgetPreferences", JSON.stringify(action.payload));
      return action.payload;
    },
  },
});

export const { togglePreference, setPreferences } =
  widgetPreferencesSlice.actions;
export default widgetPreferencesSlice.reducer;
