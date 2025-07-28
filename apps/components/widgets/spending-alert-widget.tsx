import React from "react";
import { SpendingAlertProps } from "../../interfaces/dashboard";

function calculateTotalExpenses(transactions: SpendingAlertProps["transactions"]): number {
  return transactions
    .filter(tx => tx.tipo === "saida")
    .reduce((total, tx) => total + tx.valor, 0);
}

export default function SpendingAlertWidget({
  limit,
  transactions,
}: SpendingAlertProps) {
  const gastos = calculateTotalExpenses(transactions);
  const alert = gastos > limit;

  return (
    <section
      aria-labelledby="spending-alert-heading"
      className="p-4 rounded-2xl shadow-md bg-white text-gray-900 border-2"
      style={{ borderColor: "var(--byte-color-dash)" }}
    >
      <h3 id="spending-alert-heading" className="text-lg font-semibold">
        Alerta de Gastos
      </h3>

      <p className="mt-2">
        Limite mensal:
        <span aria-label={`Limite de R$ ${limit}`}> R$ {limit}</span>
      </p>

      <p className="mt-1">
        Total gasto:
        <span aria-label={`Total gasto R$ ${gastos}`}> R$ {gastos}</span>
      </p>

      {alert ? (
        <div
          className="text-red-600 font-bold mt-2 flex items-center"
          role="alert"
          aria-live="assertive"
        >
          <span role="img" aria-label="Alerta" className="mr-1">⚠</span>
          Você ultrapassou o limite!
        </div>
      ) : (
        <p className="text-green-600 font-semibold mt-2" aria-live="polite">
          Gastos dentro do limite
        </p>
      )}
    </section>
  );
}