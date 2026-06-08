import { onBeforeUnmount, onMounted, ref } from "vue";

export interface useClassPresenceOptions { // Options for useClassPresence composable
  immediate?: boolean; // Whether to notify immediately on mount
  onChange?: (present: boolean, el: Element) => void; // Callback for class presence change
}

/**
 * Detect the presence of a class on a target element
 * @param target The target element to observe
 * @param className The class name to detect
 * @param options Options for the detection
 * @returns A ref indicating the presence of the class
 */
export function useClassPresence(
  target: () => Element | null,
  className: string,
  options: useClassPresenceOptions = {}
) {
  const present = ref(false);
  let observer: MutationObserver | null = null
  let last: boolean | null = null;

  const compute = () => {
    const el = target();
    const value = !!el?.classList.contains(className)
    present.value = value;
    return { el, value };
  }

  const notifyIfChanged = (el: Element | null, value: boolean) => {
    if (value !== last) {
      last = value;
      if (el && options.onChange) { options.onChange(value, el); }
    }
  }

  onMounted(() => {
    const el = target();
    if (!el) return;

    const { value } = compute();
    if (options.immediate) { notifyIfChanged(el, value); }

    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if ((m.type === 'attributes') && (m.attributeName === 'class')) {
          const { el: curEl, value: v } = compute();
          notifyIfChanged(curEl, v);
          break;
        }
      }
    })

    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;
  });

  return { present }
}