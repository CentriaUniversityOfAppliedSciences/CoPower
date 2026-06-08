let toastInstance: any = null;

/**
 * Initialize the toast instance
 * @param instance The toast instance to initialize
 */
function toastInstanceInit(instance: any): void {
  if (toastInstance === null) { toastInstance = instance; }
}

/**
 * Show a toast notification
 * @param summary The summary of the toast
 * @param detail The detail message of the toast
 * @param severity The severity level of the toast
 */
const toastShow = (summary: string, detail: string, severity: 'contrast' | 'error' | 'info' | 'secondary' | 'success' | 'warn'): void => {
  if (toastInstance === null) { console.warn('Toast is not initialized'); return; }
  toastInstance.add({ severity, summary, detail, life: 3000 });
};

export { toastInstanceInit, toastShow }