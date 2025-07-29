import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Chip,
  Tooltip,
  Checkbox,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AttachFileIcon from "@mui/icons-material/AttachFile";

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
  isPageLoading: boolean;
  onSave?: (transactions: Transaction[]) => void;
  onDelete: (transactionIds: number[]) => Promise<void>;
}

const parseBRL = (value: string): number => {
  const parsed = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(parsed) || 0;
};

const formatBRL = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const formatDateBR = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
};

const CardListExtract: React.FC<CardListExtractProps> = ({
  transactions,
  fetchPage,
  isPageLoading,
  onSave,
  onDelete,
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

  useEffect(() => {
    if (transactions) {
      setEditableTransactions(
        transactions.map((tx) => ({
          ...tx,
          valor: typeof tx.valor === "string" ? parseFloat(tx.valor) : tx.valor,
          anexos: Array.isArray(tx.anexos) ? tx.anexos : [], // garante array
        }))
      );
    }
  }, [transactions]);

  const isValidDate = (v: string) => v === "" || !Number.isNaN(Date.parse(v));

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
    setEditableTransactions((currentTxs) =>
      currentTxs.map((tx) =>
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
        const fileName = attachmentIdentifier.substring(attachmentIdentifier.lastIndexOf("/") + 1);
        const response = await fetch(`/api/anexos/${encodeURIComponent(fileName)}`, {
          method: "DELETE",
        });

        if (response.status !== 204 && response.status !== 200) {
          const errorData = (await response.json()) as { message?: string };
          alert(`Erro ao remover anexo: ${errorData.message ?? "Erro desconhecido"}`);
          return;
        }
      } catch {
        alert("Erro de rede ao tentar remover o anexo.");
        return;
      }
    }

    setEditableTransactions((currentTxs) =>
      currentTxs.map((tx) => {
        if (tx._id !== transactionId) return tx;
        if (isNew) {
          return { ...tx, novosAnexos: tx.novosAnexos?.filter((f) => f.name !== attachmentIdentifier) };
        } else {
          return { ...tx, anexos: tx.anexos?.filter((a) => a.url !== attachmentIdentifier) };
        }
      })
    );
  };

  const handleSaveOrDeleteClick = async () => {
    if (isEditing) {
      if (onSave) {
        const transactionsToSave = editableTransactions.map((tx) => ({
          ...tx,
          valor: typeof tx.valor === "string" ? parseBRL(tx.valor) : tx.valor,
        }));
        setStatusMsg("Salvando transações...");
        await onSave(transactionsToSave);
        setStatusMsg("Transações salvas!");
      }
      setIsEditing(false);
      setTimeout(() => setStatusMsg(""), 4000);
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
        setTimeout(() => setStatusMsg(""), 4000);
      }
    }
  };

  const handleStartDateChange = (v: string) => {
    setStartDate(v);
    setDateError(!isValidDate(v));
  };
  const handleEndDateChange = (v: string) => {
    setEndDate(v);
    setDateError(!isValidDate(v));
  };

  const loadingFirstPage = isPageLoading && editableTransactions.length === 0;
  const hasTransactions = !loadingFirstPage && editableTransactions.length > 0;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "512px",
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 1,
        p: 3,
      }}
      role="region"
      aria-labelledby="extrato-heading"
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography id="extrato-heading" variant="h6" component="h3">
          Extrato
        </Typography>

        {hasTransactions && !isEditing && !isDeleting && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton aria-label="editar" onClick={handleEditClick} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="excluir" onClick={handleDeleteClick} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {(isEditing || isDeleting) && (
          <Box>
            <Button variant="outlined" onClick={handleCancelClick} disabled={isDeletingInProgress}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveOrDeleteClick}
              disabled={isDeletingInProgress}
              sx={{ ml: 2 }}
            >
              {isEditing ? "Salvar" : isDeletingInProgress ? "Excluindo..." : "Confirmar"}
            </Button>
          </Box>
        )}
      </Box>

      {/* FILTROS SIMPLES */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | "entrada" | "saida")}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Todos os tipos</MenuItem>
          <MenuItem value="entrada">Entradas</MenuItem>
          <MenuItem value="saida">Saídas</MenuItem>
        </Select>

        <TextField
          label="Data início"
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          error={dateError}
          sx={{ maxWidth: 150 }}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Data fim"
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          error={dateError}
          sx={{ maxWidth: 150 }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* LISTA DE TRANSAÇÕES */}
      {loadingFirstPage && <Typography>Carregando transações...</Typography>}

      {!loadingFirstPage && filteredTransactions.length === 0 && (
        <Typography>Nenhuma transação encontrada.</Typography>
      )}

      {!loadingFirstPage && filteredTransactions.length > 0 && (
        <Box>
          {filteredTransactions.map((tx, index) => (
            <Box
              key={tx._id}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                gap: 2,
                borderBottom: "1px solid #ccc",
                pb: 1,
              }}
            >
              {isDeleting && (
                <Checkbox
                  checked={selectedTransactions.includes(tx._id)}
                  onChange={() => handleCheckboxChange(tx._id)}
                  inputProps={{ "aria-label": `Selecionar transação ${tx._id}` }}
                />
              )}

              <Box sx={{ flexGrow: 1 }}>
                {isEditing ? (
                  <>
                    <TextField
                      inputRef={index === 0 ? firstEditRef : undefined}
                      label="Tipo"
                      value={tx.tipo}
                      size="small"
                      onChange={(e) => handleTransactionChange(index, "tipo", e.target.value)}
                      sx={{ mb: 1, maxWidth: 180 }}
                    />
                    <TextField
                      label="Valor"
                      value={formatBRL(tx.valor)}
                      size="small"
                      onChange={(e) => handleTransactionChange(index, "valor", e.target.value)}
                      sx={{ mb: 1, maxWidth: 150 }}
                    />

                    {/* Anexos */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {tx.anexos && tx.anexos.length > 0 ? (
                        tx.anexos.map((anexo, idx) => (
                          <Chip
                            key={idx}
                            icon={<AttachFileIcon />}
                            label={anexo.name ?? "Anexo"}
                            onDelete={() => handleRemoveAttachment(tx._id, anexo.url, false)}
                            sx={{ cursor: "pointer" }}
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sem anexos
                        </Typography>
                      )}

                      {/* Input para anexar arquivos */}
                      <input
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        id={`file-input-${tx._id}`}
                        onChange={(e) => {
                          if (!e.target.files) return;
                          handleAttachFiles(tx._id, Array.from(e.target.files));
                          e.target.value = ""; // limpa o input para o mesmo arquivo poder ser selecionado de novo
                        }}
                      />
                      <label htmlFor={`file-input-${tx._id}`}>
                        <Button component="span" size="small" variant="outlined">
                          Anexar
                        </Button>
                      </label>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography>
                      <strong>Tipo:</strong> {tx.tipo}
                    </Typography>
                    <Typography>
                      <strong>Valor:</strong> {formatBRL(tx.valor)}
                    </Typography>
                    <Typography>
                      <strong>Data:</strong> {formatDateBR(tx.createdAt)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                      {Array.isArray(tx.anexos) && tx.anexos.length > 0 ? (
                        tx.anexos.map((anexo, idx) => (
                          <Tooltip key={idx} title={anexo.name ?? ""}>
                            <Chip
                              icon={<AttachFileIcon />}
                              label={anexo.name ?? "Anexo"}
                              component="a"
                              href={anexo.url}
                              target="_blank"
                              clickable
                              size="small"
                            />
                          </Tooltip>
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sem anexos
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {statusMsg && (
        <Typography
          variant="body2"
          sx={{ mt: 2, fontWeight: "bold", color: "primary.main" }}
          role="alert"
          aria-live="polite"
        >
          {statusMsg}
        </Typography>
      )}
    </Box>
  );
};

export default CardListExtract;
