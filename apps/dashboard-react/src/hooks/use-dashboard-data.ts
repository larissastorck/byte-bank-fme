import { useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchTransactions } from '../store/slices/transactionsSlice';
import { fetchBalance } from '../store/slices/balanceSlice';

/**
 * Hook responsável por carregar os dados iniciais do dashboard
 * (transações e saldo) caso ainda não tenham sido buscados.
 */
export const useDashboardData = (): void => {
  const dispatch = useDispatch<AppDispatch>();

  // ────────────────────────────────────────────────────────────────
  // ✅ shallowEqual compara cada propriedade individualmente,
  //    impedindo que o retorno mude de referência a cada render.
  // ────────────────────────────────────────────────────────────────
  const { transactionsStatus, balanceStatus } = useSelector(
    (state: RootState) => ({
      transactionsStatus: state.transactions.status,
      balanceStatus: state.balance.status,
    }),
    shallowEqual, // <= evita o warning: "returned a different result…"
  );

  useEffect(() => {
    if (transactionsStatus === 'idle') {
      void dispatch(fetchTransactions(1)); // primeira página
    }

    if (balanceStatus === 'idle') {
      void dispatch(fetchBalance());
    }
  }, [transactionsStatus, balanceStatus, dispatch]);
};
