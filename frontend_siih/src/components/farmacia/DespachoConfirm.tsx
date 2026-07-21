import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { RecetaDetalle } from '@/types';
import { Pill, User, ClipboardList } from 'lucide-react';

interface DespachoConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  receta: RecetaDetalle | null;
  loading: boolean;
}

export function DespachoConfirm({ isOpen, onClose, onConfirm, receta, loading }: DespachoConfirmProps) {
  if (!receta) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle className="flex items-center space-x-2 text-primary">
          <Pill className="h-5 w-5" />
          <span>Confirmar Despacho de Receta</span>
        </ModalTitle>
      </ModalHeader>

      <div className="py-4 space-y-4 text-sm text-foreground">
        <p>¿Está seguro de que desea despachar esta receta?</p>

        <div className="bg-muted/40 p-4 rounded-lg border space-y-2.5">
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">Medicamento:</span>
            <span>{receta.medicamento_nombre}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Pill className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">Cantidad Recetada:</span>
            <span>{receta.cantidad_recetada} unidades</span>
          </div>

          {(receta.dosis || receta.frecuencia || receta.duracion) && (
            <div className="border-t pt-2 mt-2 text-xs text-muted-foreground space-y-1">
              {receta.dosis && <div><strong>Dosis:</strong> {receta.dosis}</div>}
              {receta.frecuencia && <div><strong>Frecuencia:</strong> {receta.frecuencia}</div>}
              {receta.duracion && <div><strong>Duración:</strong> {receta.duracion}</div>}
            </div>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {loading ? 'Despachando...' : 'Despachar'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
