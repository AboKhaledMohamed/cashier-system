import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
}: ConfirmDialogProps) {
  const confirmButtonStyles: Record<string, React.CSSProperties> = {
    danger: { backgroundColor: 'var(--danger)' },
    warning: { backgroundColor: 'var(--warning)', color: '#1A1A2E' },
    info: { backgroundColor: 'var(--info)' },
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent 
        className="transition-theme"
        style={{ 
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold transition-theme" style={{ color: 'var(--text-primary)' }}>{title}</AlertDialogTitle>
          <AlertDialogDescription className="transition-theme" style={{ color: 'var(--text-muted)' }}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            onClick={onClose}
            className="bg-transparent border transition-theme font-bold"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="font-bold text-white"
            style={confirmButtonStyles[variant]}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
