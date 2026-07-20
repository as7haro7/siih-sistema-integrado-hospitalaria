import * as React from "react"
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'default',
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <div className="py-4">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button 
          variant={variant} 
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
