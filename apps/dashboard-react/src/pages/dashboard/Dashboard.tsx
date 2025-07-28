import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import {
 createNewTransaction, fetchTransactions, saveTransactions,
  deleteTransactions,
  SavePayload,
} from "../../store/slices/transactionsSlice";

import CardBalance from "../../../../components/my-cards/card-balance/card-balance";
import CardListExtract from "../../../../components/my-cards/card-list-extract/card-list-extract";
import CardNewTransaction from "../../../../components/my-cards/card-new-transaction/card-new-transaction";
import SavingsGoalWidget from "../../../../components/widgets/savings-goal-widget";
import SpendingAlertWidget from "../../../../components/widgets/spending-alert-widget";
import FinancialChart from "../../../../components/charts/financialChart";
import WidgetPreferencesButton from "../../../../components/widgets/widget-preferences-button";
import { useWidgetPreferences } from "../../../../hooks/use-widget-preferences";
import { useDashboardData } from "../../../../hooks/use-dashboard-data";
import { DashboardData, NewTransactionData, TxWithFiles } from "../../interfaces/dashboard";
import dashboardData from "../../mocks/dashboard-data.json";
import { } from "../../store/slices/transactionsSlice";
import { fetchBalance } from "../../store/slices/balanceSlice";
const DashboardPage = () => {
  const data: DashboardData = dashboardData;
  const dispatch = useDispatch<AppDispatch>();

  useDashboardData();

  const {
    items: transactions,
    status: transactionsStatus,
    creationStatus,
    hasMore,
    currentPage,
  } = useSelector((state: RootState) => state.transactions);

  const { value: balanceValue } = useSelector(
    (state: RootState) => state.balance
  );

  const { preferences } = useWidgetPreferences();

  const fetchNextPage = useCallback(() => {
    if (transactionsStatus !== "loading" && hasMore) {
      void dispatch(fetchTransactions(currentPage + 1));
    }
  }, [dispatch, transactionsStatus, hasMore, currentPage]);

  const onSubmit = async (data: NewTransactionData) => {
    try {
      await dispatch(createNewTransaction(data)).unwrap();
    } catch (error) {
      console.error("Falha ao criar a transação:", error);
    }
  };

  const handleSaveTransactions = async (txsToSave: TxWithFiles[]) => {
    const payload: SavePayload = { transactions: txsToSave };
    try {
      await dispatch(saveTransactions(payload)).unwrap();
    } catch (error) {
      console.error("Falha ao salvar as transações:", error);
    }
  };

  const handleDeleteTransactions = async (ids: number[]) => {
    try {
      await dispatch(deleteTransactions(ids)).unwrap();
    } catch (error) {
      console.error("Falha ao deletar as transações:", error);
    }
  };

  const handleAtualizaSaldo = useCallback(() => {
    void dispatch(fetchBalance());
  }, [dispatch]);

  return (
    <div className="w-full px-4 py-6 lg:px-12 bg-[var(--byte-bg-dashboard)] flex flex-col">
      <div className="font-sans max-w-screen-xl mx-auto w-full flex flex-col flex-1 min-h-0">
        <div className="flex justify-end mb-4">
          <WidgetPreferencesButton />
        </div>

        <div className="flex flex-col lg:flex-row gap-y-6 lg:gap-x-6 lg:ml-8 flex-1 min-h-0">
          <div className="flex flex-col gap-6 w-full max-w-full lg:w-[calc(55.666%-12px)]">
            <CardBalance
              user={data.user}
              balance={{ ...data.balance, value: balanceValue }}
            />
            <FinancialChart />
            {preferences.spendingAlert && (
              <SpendingAlertWidget limit={2000} transactions={transactions} />
            )}
            {preferences.savingsGoal && (
              <SavingsGoalWidget goal={3000} transactions={transactions} />
            )}
            <CardNewTransaction
              onSubmit={onSubmit}
              isLoading={creationStatus === "loading"}
            />
          </div>

          <div className="max-w-full flex flex-col">
            <div className="flex-1 overflow-y-auto max-h-[800px]">
              <CardListExtract
                transactions={transactions}
                fetchPage={fetchNextPage}
                hasMore={hasMore}
                isPageLoading={transactionsStatus === "loading"}
                onSave={(txs) => {
                  void handleSaveTransactions(txs);
                }}
                onDelete={handleDeleteTransactions}
                atualizaSaldo={handleAtualizaSaldo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;