import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setPreferences, togglePreference } from "../store/slices/widgetPreferencesSlice";
import { RootState, AppDispatch } from "../store/store";

export function useWidgetPreferences() {
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(
    (state: RootState) => state.widgetPreferences
  );

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggle = (key: keyof typeof preferences) => {
    dispatch(togglePreference(key));
  };

  const set = (newPreferences: typeof preferences) => {
    dispatch(setPreferences(newPreferences));
  };

  return isClient
    ? {
        preferences,
        togglePreference: toggle,
        setPreferences: set,
      }
    : {
        preferences: { savingsGoal: false, spendingAlert: false },
        togglePreference: () => {},
        setPreferences: () => {},
      };
}
