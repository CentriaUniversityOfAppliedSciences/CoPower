import 'vue-i18n';
import type { MessageSchema } from 'vue-i18n';

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {
    [key: string]: string | DefineLocaleMessage;
  }
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $t: (key: keyof MessageSchema, ...args: any[]) => string;
  }
}