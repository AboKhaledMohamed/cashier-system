import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onCtrlS?: () => void;
  onCtrlP?: () => void;
  enabled?: boolean;
}

/**
 * Hook for keyboard navigation in forms and dialogs
 * 
 * @example
 * useKeyboardNavigation({
 *   onEscape: closeDialog,
 *   onEnter: handleSubmit,
 *   onCtrlS: handleSave,
 *   enabled: showDialog,
 * });
 */
export function useKeyboardNavigation({
  onEscape,
  onEnter,
  onCtrlS,
  onCtrlP,
  enabled = true,
}: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      }

      // Enter key (when not in textarea)
      if (event.key === 'Enter' && onEnter && !(event.target instanceof HTMLTextAreaElement)) {
        // Don't submit if in a select dropdown
        if (!(event.target instanceof HTMLSelectElement)) {
          event.preventDefault();
          onEnter();
        }
      }

      // Ctrl/Cmd + S for save
      if ((event.ctrlKey || event.metaKey) && event.key === 's' && onCtrlS) {
        event.preventDefault();
        onCtrlS();
      }

      // Ctrl/Cmd + P for print
      if ((event.ctrlKey || event.metaKey) && event.key === 'p' && onCtrlP) {
        event.preventDefault();
        onCtrlP();
      }
    },
    [enabled, onEscape, onEnter, onCtrlS, onCtrlP]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Auto-focus input on mount
 */
export function useAutoFocus<T extends HTMLElement>(enabled = true) {
  return useEffect(() => {
    if (!enabled) return;
    
    // Find first input and focus it
    const firstInput = document.querySelector('input:not([type="hidden"]), select, textarea') as T | null;
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }
  }, [enabled]);
}

/**
 * Tab order management for forms
 */
export function useTabOrder(formRef: React.RefObject<HTMLElement>, enabled = true) {
  useEffect(() => {
    if (!enabled || !formRef.current) return;

    const form = formRef.current;
    const focusableElements = form.querySelectorAll(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(focusableElements) as HTMLElement[];
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);

      if (e.shiftKey && currentIndex === 0) {
        // Shift + Tab at first element -> go to last
        e.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!e.shiftKey && currentIndex === focusable.length - 1) {
        // Tab at last element -> go to first
        e.preventDefault();
        focusable[0].focus();
      }
    };

    form.addEventListener('keydown', handleKeyDown as EventListener);
    return () => form.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [formRef, enabled]);
}
