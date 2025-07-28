import React from 'react';
import {
  Box,
  Button,
  FormControl,
  Input,
  InputAdornment,
  MenuItem,
  Select,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { transactionValidations } from '../../../utils/forms-validations/formValidations';
import { maskCurrency } from '../../../utils/currency-formatte/currency-formatte';
import { CardNewTransactionProps, NewTransactionData } from '../../../interfaces/dashboard';
const srOnly = 'absolute -m-px w-px h-px overflow-hidden clip-[rect(0,0,0,0)]';

const cardNewTransactionStyles = {
  cardTransacao: 'w-full min-h-[520px] bg-white rounded-lg shadow-md p-6',
  transacaoTitle: 'text-xl font-bold text-gray-800 mb-4',
  transacaoFormControl: 'mb-4',
  transacaoLabel: 'text-sm font-medium text-gray-700 mb-1',
  transacaoButton: 'w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200',
};

export default function CardNewTransaction({
  onSubmit,
  isLoading,
}: CardNewTransactionProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewTransactionData>();

  const submitHandler = handleSubmit((data) => {
    void onSubmit(data);
  });

  return (
    <Box
      role="form"
      aria-labelledby="nova-transacao-titulo"
      className={cardNewTransactionStyles.cardTransacao}
    >
      <h3 id="nova-transacao-titulo" className={cardNewTransactionStyles.transacaoTitle}>
        Nova transação
      </h3>

      <form onSubmit={submitHandler}>
        {/* ---------- SELECT Tipo ---------- */}
        <FormControl fullWidth className={cardNewTransactionStyles.transacaoFormControl}>
          <label htmlFor="tipo-select" className={srOnly}>
            Tipo de transação
          </label>
          <Select
            id="tipo-select"
            fullWidth
            displayEmpty
            defaultValue=""
            variant="outlined"
            error={!!errors.tipo}
            inputProps={{
              'aria-label': 'Tipo de transação',
              'aria-required': 'true',
              'aria-invalid': !!errors.tipo,
              'aria-describedby': errors.tipo ? 'erro-tipo' : undefined,
            }}
            {...register('tipo', transactionValidations.tipo)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              border: '1px solid',
              borderColor: errors.tipo ? '#ef4444' : '#e5e7eb',
              borderRadius: 2,
              width: '100%',
              '&.Mui-focused': {
                borderColor: errors.tipo ? '#ef4444' : '#22c55e',
                boxShadow: `0 0 0 2px ${errors.tipo ? '#fecaca' : '#6ee7b7'}`,
              },
            }}
          >
            <MenuItem value="" disabled>
              Selecione o tipo de transação
            </MenuItem>
            <MenuItem value="cambio">Câmbio (Entrada)</MenuItem>
            <MenuItem value="deposito">Depósito (Saída)</MenuItem>
            <MenuItem value="transferencia">Transferência (Saída)</MenuItem>
          </Select>
          {errors.tipo && (
            <span id="erro-tipo" role="alert" className="text-red-500 text-sm">
              {errors.tipo.message}
            </span>
          )}
        </FormControl>

        {/* ---------- INPUT Valor ---------- */}
        <p className={cardNewTransactionStyles.transacaoLabel}>Valor</p>
        <FormControl fullWidth className={cardNewTransactionStyles.transacaoFormControl}>
          <label htmlFor="valor-input" className={srOnly}>
            Valor em Reais
          </label>
          <Input
            id="valor-input"
            placeholder="00,00"
            disableUnderline
            startAdornment={
              <InputAdornment position="start">R$</InputAdornment>
            }
            {...register('valor', transactionValidations.valor)}
            onChange={(e) => {
              e.target.value = maskCurrency(e.target.value);
            }}
            inputProps={{
              'aria-label': 'Valor em reais',
              inputMode: 'decimal',
              'aria-required': 'true',
              'aria-invalid': !!errors.valor,
              'aria-describedby': errors.valor ? 'erro-valor' : undefined,
            }}
            sx={{
              border: '1px solid',
              borderColor: errors.valor ? '#ef4444' : '#e5e7eb',
              borderRadius: 2,
              pl: 1.5,
              py: 1,
              my: 3,
              '&:focus-within': {
                borderColor: errors.valor ? '#ef4444' : '#22c55e',
                boxShadow: `0 0 0 2px ${errors.valor ? '#fecaca' : '#6ee7b7'}`,
              },
            }}
          />
          {errors.valor && (
            <span id="erro-valor" role="alert" className="text-red-500 text-sm">
              {errors.valor.message}
            </span>
          )}
        </FormControl>

        {/* ---------- BOTÃO ---------- */}
        <Box className="mt-4">
          <Button
            type="submit"
            aria-busy={isLoading ? 'true' : undefined}
            aria-disabled={isLoading ? 'true' : undefined}
            className={clsx(cardNewTransactionStyles.transacaoButton, {
              'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400':
                isLoading,
            })}
            disabled={isLoading}
          >
            {isLoading ? 'Concluindo…' : 'Concluir Transação'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}