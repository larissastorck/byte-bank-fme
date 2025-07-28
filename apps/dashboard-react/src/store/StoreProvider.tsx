"use client";
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import type { AppStore } from './store'; // Importaremos o tipo mais tarde

export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore>(store);
  return <Provider store={storeRef.current}>{children}</Provider>;
}