import { useState, useEffect } from "react";
import { useWidgetPreferences } from "../../hooks/use-widget-preferences";
import { BarChart, ModeStandby } from "@mui/icons-material";
import {
  Box,
  Modal,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";

type WidgetSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function WidgetSettingsModal({
  open,
  onClose,
}: WidgetSettingsModalProps) {
  const { preferences, togglePreference } = useWidgetPreferences();

  // Fechar modal com Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="widget-modal-title"
      aria-describedby="widget-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          outline: 'none',
          overflowY: 'auto'
        }}
      >
        <Typography id="widget-modal-title" variant="h6" fontWeight="bold" mb={2}>
          Personalizar Widgets
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Escolha quais widgets deseja exibir no painel
        </Typography>

        {/* CARD: Alerta de Gastos */}
        <Box
          sx={{
            border: 1,
            borderColor: preferences.spendingAlert ? 'primary.main' : 'divider',
            borderRadius: 1,
            p: 3,
            mb: 2,
            bgcolor: preferences.spendingAlert ? 'primary.light' : 'background.paper',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'text.secondary'
            }
          }}
          onClick={() => togglePreference("spendingAlert")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            togglePreference("spendingAlert")
          }
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight="bold">Alerta de gastos</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={preferences.spendingAlert}
                  onChange={() => togglePreference("spendingAlert")}
                  onClick={(e) => e.stopPropagation()}
                  color="primary"
                />
              }
              label=""
            />
          </Box>

          <Typography variant="body2" color="text.secondary" mt={1}>
            Monitore seus gastos mensais e receba alertas quando se aproximar do
            limite definido.
          </Typography>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              my: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <BarChart fontSize="small" />
              <Typography fontWeight="bold" variant="body2">
                Prévia do widget
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" fontSize={14}>
              Visualize seus gastos em tempo real com barras de progresso.
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography variant="caption" color="text.secondary">
                Limite atual: <strong>R$ 2.000</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gasto: <strong color="error">R$ 0</strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* CARD: Meta de Economia */}
        <Box
          sx={{
            border: 1,
            borderColor: preferences.savingsGoal ? 'primary.main' : 'divider',
            borderRadius: 1,
            p: 3,
            mb: 2,
            bgcolor: preferences.savingsGoal ? 'primary.light' : 'background.paper',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'text.secondary'
            }
          }}
          onClick={() => togglePreference("savingsGoal")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            togglePreference("savingsGoal")
          }
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight="bold">Meta de economia</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={preferences.savingsGoal}
                  onChange={() => togglePreference("savingsGoal")}
                  onClick={(e) => e.stopPropagation()}
                  color="primary"
                />
              }
              label=""
            />
          </Box>

          <Typography variant="body2" color="text.secondary" mt={1}>
            Defina metas de economia e acompanhe seu progresso.
          </Typography>

          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              my: 2,
              bgcolor: 'background.paper'
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <ModeStandby fontSize="small" />
              <Typography fontWeight="bold" variant="body2">
                Prévia do widget
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" fontSize={14}>
              Acompanhe o progresso das suas metas.
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography variant="caption" color="text.secondary">
                Meta atual: <strong>R$ 3.000</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Economizado: <strong color="success">R$ 0</strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--byte-color-dash)',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </Box>
      </Box>
    </Modal>
  );
}