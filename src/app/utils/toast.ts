import { toast } from 'sonner';

/**
 * Toast notifications utility for consistent messaging across the app
 */

export const notify = {
  /**
   * Show success toast
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Show error toast
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Show info toast
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Show loading toast (returns dismiss function)
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

/**
 * Common notification messages
 */
export const messages = {
  // Save operations
  saved: (item: string) => `تم حفظ ${item} بنجاح`,
  updated: (item: string) => `تم تحديث ${item} بنجاح`,
  deleted: (item: string) => `تم حذف ${item} بنجاح`,
  added: (item: string) => `تم إضافة ${item} بنجاح`,

  // Errors
  error: {
    save: (item: string) => `فشل حفظ ${item}`,
    update: (item: string) => `فشل تحديث ${item}`,
    delete: (item: string) => `فشل حذف ${item}`,
    load: (item: string) => `فشل تحميل ${item}`,
    required: (field: string) => `حقل ${field} مطلوب`,
    invalid: (field: string) => `قيمة ${field} غير صالحة`,
  },

  // Confirmations
  confirm: {
    delete: 'هل أنت متأكد من الحذف؟',
    cancel: 'هل أنت متأكد من الإلغاء؟',
    discard: 'هل تريد تجاهل التغييرات؟',
  },

  // Success messages
  success: {
    login: 'تم تسجيل الدخول بنجاح',
    logout: 'تم تسجيل الخروج بنجاح',
    print: 'تم إرسال الملف للطباعة',
    export: 'تم التصدير بنجاح',
    sync: 'تم المزامنة بنجاح',
  },
};
