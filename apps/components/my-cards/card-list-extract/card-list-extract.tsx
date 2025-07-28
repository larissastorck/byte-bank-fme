import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  TextField,
  MenuItem,
  Checkbox,
  Typography,
  Select,
  Link,
  Chip,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import './card-list-extract.css'

interface Attachment {
  url: string;
  name: string;
}

interface Transaction {
  _id: number;
  tipo: string;
  valor: number | string;
  createdAt: string;
  updatedAt: string;
  anexos?: Attachment[];
}

interface TxWithFiles extends Transaction {
  novosAnexos?: File[];
}

interface CardListExtractProps {
  transactions: Transaction[];
  fetchPage: () => void;
  hasMore: boolean;
  isPageLoading: boolean;
  onSave?: (transactions: Transaction[]) => void;
  onDelete: (transactionIds: number[]) => Promise<void>;
  atualizaSaldo: () => void;
}

// Utility functions
const formatBRL = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatTipo = (tipo: string): string => {
  const types: Record<string, string> = {
    cambio: "Câmbio",
    deposito: "Depósito",
    transferencia: "Transferência"
  };
  return types[tipo] || tipo;
};

const maskCurrency = (value: string): string => {
  let v = value.replace(/\D/g, '');
  v = (Number(v) / 100).toFixed(2) + '';
  v = v.replace('.', ',');
  v = v.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');
  v = v.replace(/(\d)(\d{3}),/g, '$1.$2,');
  return v;
};

const parseBRL = (value: string): number => {
  const parsed = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(parsed) || 0;
};

const formatDateBR = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const parseDateBR = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

const CardListExtract: React.FC<CardListExtractProps> = ({
  transactions,
  fetchPage,
  hasMore,
  isPageLoading,
  onDelete,
  atualizaSaldo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTransactions, setEditableTransactions] = useState<TxWithFiles[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);
  const firstEditRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "entrada" | "saida">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState(false);

  const isValidDate = (v: string) => v === "" || !Number.isNaN(Date.parse(v));

  useEffect(() => {
    if (transactions) {
      setEditableTransactions(
        transactions.map((tx) => ({
          ...tx,
          valor: typeof tx.valor === "string" ? parseFloat(tx.valor) : tx.valor,
        }))
      );
    }
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const tiposEntrada = ["cambio", "deposito"];
    const tiposSaida = ["transferencia"];
    return editableTransactions.filter((tx) => {
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "entrada" && tiposEntrada.includes(tx.tipo)) ||
        (typeFilter === "saida" && tiposSaida.includes(tx.tipo));
      const txDate = new Date(tx.createdAt);
      const matchesStart = !startDate || txDate >= new Date(`${startDate}T00:00`);
      const matchesEnd = !endDate || txDate <= new Date(`${endDate}T23:59:59`);
      return matchesType && matchesStart && matchesEnd;
    });
  }, [editableTransactions, typeFilter, startDate, endDate]);

  const handleEditClick = () => {
    setEditableTransactions((p) => p.map((tx) => ({ ...tx, updatedAt: formatDateBR(tx.updatedAt) })));
    setIsEditing(true);
    setTimeout(() => firstEditRef.current?.focus());
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditableTransactions(transactions ?? []);
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
    setSelectedTransactions([]);
  };

  const handleCancelDeleteClick = () => {
    setIsDeleting(false);
    setSelectedTransactions([]);
  };

  const handleCheckboxChange = (id: number) =>
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );

  const handleTransactionChange = (index: number, field: keyof Transaction, value: string) => {
    setEditableTransactions((prev) =>
      prev.map((tx, i) => {
        if (i !== index) return tx;
        if (field === "valor") return { ...tx, valor: parseBRL(value) };
        return { ...tx, [field]: value };
      })
    );
  };

  const handleAttachFiles = (transactionId: number, files: File[]) => {
    setEditableTransactions(currentTxs =>
      currentTxs.map(tx =>
        tx._id === transactionId ? { ...tx, novosAnexos: files } : tx
      )
    );
  };

  const handleRemoveAttachment = async (
    transactionId: number,
    attachmentIdentifier: string,
    isNew: boolean
  ) => {
    if (!isNew) {
      try {
        const fileName = attachmentIdentifier.substring(attachmentIdentifier.lastIndexOf('/') + 1);
        const response = await fetch(`/api/anexos/${encodeURIComponent(fileName)}`, {
          method: 'DELETE',
        });

        if (response.status !== 204 && response.status !== 200) {
          const errorData = await response.json() as { message?: string };
          alert(`Erro ao remover anexo: ${errorData.message ?? 'Erro desconhecido'}`);
          return;
        }
      } catch {
        alert('Erro de rede ao tentar remover o anexo.');
        return;
      }
    }

    setEditableTransactions(currentTxs =>
      currentTxs.map(tx => {
        if (tx._id !== transactionId) return tx;
        if (isNew) {
          return { ...tx, novosAnexos: tx.novosAnexos?.filter(f => f.name !== attachmentIdentifier) };
        } else {
          return { ...tx, anexos: tx.anexos?.filter(a => a.url !== attachmentIdentifier) };
        }
      })
    );
  };

  const handleSaveOrDeleteClick = async () => {
    if (isEditing) {
      for (const tx of editableTransactions) {
        if (tx.novosAnexos?.length) {
          const fd = new FormData();
          fd.append("tipo", tx.tipo);
          fd.append("valor", tx.valor.toString());
          fd.append("updatedAt", parseDateBR(tx.updatedAt));
          tx.novosAnexos.forEach((f) => fd.append("anexos", f));
          await fetch(`/api/transacao/${tx._id}`, { method: "PUT", body: fd });
        } else {
          await fetch(`/api/transacao/${tx._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tipo: tx.tipo,
              valor: tx.valor,
              updatedAt:
                typeof tx.updatedAt === "string" &&
                /^\d{2}\/\d{2}\/\d{4}$/.test(tx.updatedAt)
                  ? parseDateBR(tx.updatedAt)
                  : tx.updatedAt,
            }),
          });
        }
      }
      void fetchPage();
      setIsEditing(false);
      atualizaSaldo?.();
      setStatusMsg("Transações salvas!");
      return;
    }

    if (isDeleting) {
      if (!selectedTransactions.length) return;
      setIsDeletingInProgress(true);
      setStatusMsg("Excluindo transações…");
      try {
        await onDelete(selectedTransactions);
        setStatusMsg("Transações excluídas!");
      } finally {
        setIsDeletingInProgress(false);
        setIsDeleting(false);
        setSelectedTransactions([]);
        atualizaSaldo();
        setTimeout(() => setStatusMsg(""), 4000);
      }
    }
  };

  const handleStartDateChange = (v: string) => { setStartDate(v); setDateError(!isValidDate(v)); };
  const handleEndDateChange = (v: string) => { setEndDate(v); setDateError(!isValidDate(v)); };

  const loadingFirstPage = isPageLoading && editableTransactions.length === 0;
  const hasTransactions = !loadingFirstPage && editableTransactions.length > 0;

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '512px', 
      bgcolor: 'background.paper', 
      borderRadius: 2, 
      boxShadow: 1, 
      p: 3 
    }} role="region" aria-labelledby="extrato-heading">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography id="extrato-heading" variant="h6" component="h3">Extrato</Typography>
        {hasTransactions && !isEditing && !isDeleting && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton aria-label="editar" onClick={handleEditClick} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="excluir" onClick={handleDeleteClick} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
      
      {hasTransactions && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          pb: 2, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexWrap: 'wrap'
        }}>
          <Select
            size="small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "entrada" | "saida")}
            sx={{ flex: 1, minWidth: { xs: 'calc(50% - 16px)', md: 120 } }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="entrada">Entrada</MenuItem>
            <MenuItem value="saida">Saída</MenuItem>
          </Select>
          <TextField
            label="De"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            error={dateError}
            helperText={dateError ? "Data inválida" : ""}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: { xs: 'calc(50% - 16px)', md: 120 } }}
          />
          <TextField
            label="Até"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            error={dateError}
            helperText={dateError ? "Data inválida" : ""}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: { xs: 'calc(50% - 16px)', md: 120 } }}
          />
        </Box>
      )}
      
      {loadingFirstPage ? (
        <Box aria-busy="true" aria-label="Carregando">
          {/* Skeleton loading component would go here */}
        </Box>
      ) : dateError || !filteredTransactions.length ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center', 
          gap: 2, 
          py: 5 
        }}>
          {dateError ? (
            <>
              <Typography variant="h6" color="error">Data inválida</Typography>
              <Typography variant="body2" color="text.secondary">
                Verifique o formato da data inserida.
              </Typography>
            </>
          ) : (
            <>
              <ReceiptLongOutlinedIcon sx={{ fontSize: 56, color: 'text.secondary' }} />
              <Typography variant="h6">Nenhuma transação encontrada</Typography>
              <Typography variant="body2" color="text.secondary">
                Ajuste os filtros ou adicione uma nova transação para começar.
              </Typography>
            </>
          )}
        </Box>
      ) : (
        <>
          <Box component="ul" role="list" aria-busy={isPageLoading} sx={{ listStyle: 'none', p: 0, m: 0, '& > li': { mb: 2 } }}>
            {filteredTransactions.map((tx, idx) => {
              const hasExistingAttachment = (tx.anexos?.length ?? 0) > 0 || (tx.novosAnexos?.length ?? 0) > 0;

              return (
                <Box component="li" key={tx._id ?? `tx-${idx}`}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    alignItems: { md: 'center' }, 
                    justifyContent: 'space-between', 
                    p: 1.5, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1, 
                    '&:hover': { bgcolor: 'grey.100' },
                    gap: isEditing ? 0 : undefined 
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {isEditing ? (
                        <Input
                          disableUnderline
                          fullWidth
                          value={formatTipo(tx.tipo)}
                          onChange={(e) => handleTransactionChange(idx, "tipo", e.target.value)}
                          inputProps={{ style: { textAlign: 'left' } }}
                          inputRef={idx === 0 ? firstEditRef : undefined}
                          sx={{ minWidth: 120 }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 'medium' }}>
                          {formatTipo(tx.tipo)}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {formatDateBR(tx.createdAt)}
                      </Typography>
                    </Box>
                    
                    {isEditing ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Input
                          disableUnderline
                          sx={{ 
                            flex: 1, 
                            bgcolor: 'background.paper', 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            borderRadius: 1, 
                            px: 1.5, 
                            py: 0.5 
                          }}
                          value={formatBRL(tx.valor)}
                          onChange={(e) => handleTransactionChange(idx, "valor", maskCurrency(e.target.value))}
                          inputProps={{ inputMode: "decimal", title: "Até 999.999,99" }}
                        />
                        <input
                          hidden
                          multiple
                          accept="image/*,application/pdf"
                          id={`edit-anexos-${tx._id}`}
                          type="file"
                          aria-label="Selecionar arquivos para anexar"
                          disabled={hasExistingAttachment}
                          onChange={(e) => { 
                            const files = e.target.files; 
                            if (files) { 
                              handleAttachFiles(tx._id, Array.from(files)); 
                            } 
                          }}
                        />
                        <label htmlFor={`edit-anexos-${tx._id}`}>
                          <Tooltip title={hasExistingAttachment ? "Remova o anexo atual para adicionar um novo" : "Anexar arquivos"}>
                            <span>
                              <IconButton 
                                component="span" 
                                size="small" 
                                color="primary" 
                                aria-label="Anexar arquivos" 
                                disabled={hasExistingAttachment}
                              >
                                <AttachFileIcon fontSize="inherit" aria-hidden="true" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </label>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {isDeleting && (
                          <Checkbox
                            aria-label={`Selecionar transação ${formatBRL(Math.abs(tx.valor))}`}
                            checked={selectedTransactions.includes(tx._id)}
                            onChange={() => handleCheckboxChange(tx._id)}
                            size="small"
                            sx={{ mr: 1, color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }}
                          />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {tx.valor < 0 && "-"}
                          {formatBRL(tx.valor)}
                        </Typography>
                        {tx.anexos?.length ? (
                          <Tooltip title={`${tx.anexos.length} anexo(s)`}>
                            <AttachFileIcon sx={{ fontSize: 16, ml: 0.5, color: 'primary.main' }} aria-hidden="true" />
                          </Tooltip>
                        ) : null}
                      </Box>
                    )}
                  </Box>
                  
                  {(tx.anexos?.length || tx.novosAnexos?.length) ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, ml: 2 }}>
                      {tx.anexos?.map((a: Attachment) => (
                        <Chip
                          key={a.url}
                          label={a.name}
                          size="small"
                          icon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                          component={!isEditing ? Link : "div"}
                          href={!isEditing ? a.url : undefined}
                          target={!isEditing ? "_blank" : undefined}
                          clickable={!isEditing}
                          onDelete={isEditing ? () => { void handleRemoveAttachment(tx._id, a.url, false); } : undefined}
                          sx={{ 
                            bgcolor: 'primary.light', 
                            '&:hover': { bgcolor: 'primary.lighter' } 
                          }}
                        />
                      ))}
                      {isEditing && tx.novosAnexos?.map((f, i) => (
                        <Chip
                          key={i}
                          label={f.name}
                          size="small"
                          color="info"
                          variant="outlined"
                          icon={<AttachFileIcon sx={{ fontSize: 14 }} />}
                          onDelete={() => { void handleRemoveAttachment(tx._id, f.name, true); }}
                        />
                      ))}
                    </Box>
                  ) : null}
                </Box>
              );
            })}
          </Box>
          
          <Box aria-busy={isPageLoading}>
            {/* Infinite scroll component would go here */}
          </Box>
          
          {isPageLoading && editableTransactions.length > 0 && (
            {/* Skeleton loading component would go here */}
          )}
        </>
      )}
      
      {(isEditing || isDeleting) && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 2 }}>
          <Button
            onClick={() => { void handleSaveOrDeleteClick(); }}
            disabled={isDeleting && (isDeletingInProgress || !selectedTransactions.length)}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { opacity: 0.5, pointerEvents: 'none' }
            }}
          >
            {isEditing ? "Salvar" : isDeletingInProgress ? "Excluindo..." : "Excluir"}
          </Button>
          <Button
            onClick={isEditing ? handleCancelClick : handleCancelDeleteClick}
            disabled={isDeleting && isDeletingInProgress}
            sx={{
              bgcolor: 'grey.200',
              color: 'text.primary',
              '&:hover': { bgcolor: 'grey.300' }
            }}
          >
            Cancelar
          </Button>
        </Box>
      )}
      
      <Box role="status" aria-live="polite" sx={{ position: 'absolute', left: -9999 }}>
        {statusMsg}
      </Box>
    </Box>
  );
};

export default CardListExtract;