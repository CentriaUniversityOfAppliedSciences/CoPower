import { ConfirmationOptions } from "primevue/confirmationoptions";

let dialogInstance: any = null; // Dialog instance reference

/**
 * Initialize the dialog instance
 * @param instance - The dialog instance to set
 */
function dialogInstanceInit(instance: any): void {
  if (dialogInstance === null) { dialogInstance = instance; }
}

/**
 * Show the dialog with the given options
 * @param options - The options for the confirmation dialog
 */
const dialogShow = (options: ConfirmationOptions): void => {
  dialogInstance.require(options);
};

export { dialogInstanceInit, dialogShow }