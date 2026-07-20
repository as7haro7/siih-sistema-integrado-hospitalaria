import * as React from "react"
import { cn } from "@/lib/utils"

const ModalContext = React.createContext<{ isOpen: boolean; onClose: () => void }>({
  isOpen: false,
  onClose: () => {},
})

export function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all" onClick={onClose} />
        <div className="z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg animate-slide-in relative glass-card">
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  )
}

export function ModalHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>{children}</div>
}

export function ModalTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>{children}</h2>
}

export function ModalFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props}>{children}</div>
}
