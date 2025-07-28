import React, { useState, KeyboardEvent } from "react";
import { VisibilityIcon, VisibilityOffIcon } from "../../ui";
import { formatBRL } from "../../../utils/currency-formatte/currency-formatte";

type CardBalanceProps = {
  user: { name: string };
  balance: { account: string; value: number | null };
};

const CardBalance: React.FC<CardBalanceProps> = ({ user, balance }) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  const handleToggleBalance = () => setShowBalance((prev) => !prev);

  const handleKeyToggle = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleBalance();
    }
  };

  const getCurrentDate = (): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long" };
    const today = new Date();
    const weekday = today
      .toLocaleDateString("pt-BR", options)
      .replace(/^\w/, (c) => c.toUpperCase());
    const formattedDate = today.toLocaleDateString("pt-BR");
    return `${weekday}, ${formattedDate}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 min-h-[402px] flex flex-col">
      {/* Saudação e data */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Olá, {user.name.split(" ")[0]} 😊
        </h1>
        <p className="text-sm text-gray-600">{getCurrentDate()}</p>
      </div>

      {/* Seção de saldo */}
      <div className="mt-6 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <p className="text-lg font-medium text-gray-700">
              Saldo&nbsp;
              <span
                tabIndex={0}
                role="button"
                aria-pressed={showBalance}
                aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
                onClick={handleToggleBalance}
                onKeyDown={handleKeyToggle}
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full p-1"
              >
                {showBalance ? (
                  <VisibilityIcon className="text-gray-600" />
                ) : (
                  <VisibilityOffIcon className="text-gray-600" />
                )}
              </span>
            </p>
          </div>
          <hr className="border-t-2 border-orange-500 w-12 my-2" />
        </div>

        <p className="text-sm text-gray-500 mb-2">{balance.account}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">
          {showBalance
            ? typeof balance.value === "number"
              ? formatBRL(balance.value)
              : "Carregando..."
            : "••••••"}
        </p>
      </div>
    </div>
  );
};

export default CardBalance;