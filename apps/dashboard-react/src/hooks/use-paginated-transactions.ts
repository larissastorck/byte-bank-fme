
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Transaction } from "../../../interfaces/dashboard"; // ajuste conforme sua pasta

const PAGE_SIZE = 10;

interface ApiResponse {
  transacoes: Transaction[];
  total: number;
}

export function usePaginatedTransactions() {
  /* páginas já carregadas */
  const [pages, setPages] = useState<Transaction[][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* controle interno -------------------------------------------------- */
  const loadingRef = useRef(false);
  const totalRef = useRef<number | null>(null);
  const nextPage = useRef(1);

  /* --------------------- BUSCA DE PÁGINA ---------------------------- */
  const fetchPage = useCallback(async (): Promise<void> => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/transacao?page=${nextPage.current}&limit=${PAGE_SIZE}`
      );

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const { transacoes, total } = (await res.json()) as ApiResponse;

      totalRef.current = total;

      /* adiciona somente transações ainda não vistas */
      setPages((prev) => {
        const knownIds = new Set(prev.flat().map((t) => t._id));
        const onlyNew = transacoes.filter((t) => !knownIds.has(t._id));
        return [...prev, onlyNew];
      });

      nextPage.current += 1;
    } catch (err) {
      console.error("Erro ao buscar página de transações:", err);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  /* --------------------- UTILIDADES --------------------------------- */
  const prepend = useCallback((tx: Transaction): void => {
    setPages((prev) => [[tx], ...prev]);
    if (totalRef.current !== null) totalRef.current += 1;
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    setPages([]);
    totalRef.current = null;
    nextPage.current = 1;
    await fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  const transactions = useMemo(() => pages.flat(), [pages]);

  const hasMore =
    totalRef.current === null ? true : transactions.length < totalRef.current;

  return {
    transactions,
    fetchPage,
    prepend,
    refresh,
    hasMore,
    isLoading,
  };
}
