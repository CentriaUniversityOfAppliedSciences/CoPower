<template>
  <div class="footer">
    <div v-if="themeColor === 'light'" class="footer-left">
      <a class="logo" href="https://www.interreg-npa.eu/projects/copower/home/" aria-label="Interreg" target="_blank">
        <img src="/assets/logo/copower-light.webp" alt="Interreg" class="margin-right" />
      </a>
      <a class="logo" href="https://www.ernact.eu/" aria-label="Ernact" target="_blank">
        <img src="/assets/logo/ernact-light.webp" alt="Ernact" class="margin-right" />
      </a>
      <a class="logo" href="https://www.oulu.fi/fmt/" aria-label="University of Oulu" target="_blank">
        <img src="/assets/logo/uoo-light.webp" alt="University of Oulu" class="margin-right" />
      </a>
      <a class="logo" href="https://www.donegalcoco.ie/" aria-label="Donegal County Council" target="_blank">
        <img src="/assets/logo/donegal-light.webp" alt="Donegal County Council" class="margin-right" />
      </a>
      <a class="logo-smaller" href="https://net.centria.fi/en/" aria-label="Centria University of Applied Sciences" target="_blank">
        <img src="/assets/logo/centria-light.webp" alt="Centria University of Applied Sciences" class="margin-right" />
      </a>
      <a class="logo-smaller margin-right" href="https://www.facebook.com/people/N%C3%B3lsoyar-Orkufelag/61575141518269/#" aria-label="Nolsoy Energy" target="_blank">
        <img src="/assets/logo/nolsoy-light.webp" alt="Nolsoy Energy" />
      </a>
      <a class="logo-smaller" href="https://english.hi.is/" aria-label="University of Iceland" target="_blank">
        <img src="/assets/logo/uoi-light.webp" alt="University of Iceland" />
      </a>
    </div>
    <div v-else-if="themeColor === 'dark'" class="footer-left">
      <a class="logo" href="https://www.interreg-npa.eu/projects/copower/home/" aria-label="Interreg" target="_blank">
        <img src="/assets/logo/copower-dark.webp" alt="Interreg" class="margin-right" />
      </a>
      <a class="logo" href="https://www.ernact.eu/" aria-label="Ernact" target="_blank">
        <img src="/assets/logo/ernact-dark.webp" alt="Ernact" class="margin-right" />
      </a>
      <a class="logo" href="https://www.oulu.fi/fmt/" aria-label="University of Oulu" target="_blank">
        <img src="/assets/logo/uoo-dark.webp" alt="University of Oulu" class="margin-right" />
      </a>
      <a class="logo" href="https://www.donegalcoco.ie/" aria-label="Donegal County Council" target="_blank">
        <img src="/assets/logo/donegal-dark.webp" alt="Donegal County Council" class="margin-right" />
      </a>
      <a class="logo-smaller" href="https://net.centria.fi/en/" aria-label="Centria University of Applied Sciences" target="_blank">
        <img src="/assets/logo/centria-dark.webp" alt="Centria University of Applied Sciences" class="margin-right" />
      </a>
      <a class="logo-smaller margin-right" href="https://www.facebook.com/people/N%C3%B3lsoyar-Orkufelag/61575141518269/#" aria-label="Nolsoy Energy" target="_blank">
        <img src="/assets/logo/nolsoy-dark.webp" alt="Nolsoy Energy" />
      </a>
      <a class="logo-smaller" href="https://english.hi.is/" aria-label="University of Iceland" target="_blank">
        <img src="/assets/logo/uoi-dark.webp" alt="University of Iceland" />
      </a>
    </div>
    
    <div class="footer-right">
      <span class="version-number margin-right">{{ version }}</span>
      <a class="social pi pi-globe" href="https://www.interreg-npa.eu/projects/copower/home/" aria-label="CoPower project page" target="_blank" />
      <a class="social pi pi-linkedin" href="https://www.linkedin.com/company/98045104" aria-label="CoPower Linkedin" target="_blank" />
      <a class="social pi pi-twitter" href="https://twitter.com/CoPowerproject" aria-label="CoPower X" target="_blank" />
    </div>
    
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useClassPresence } from '../services/useClassPresence';

// Detect current theme mode
const { present: isDark } = useClassPresence(() => document.documentElement, 'app-dark-mode', {
    immediate: true,
    onChange: (present, el) => {
      themeColor.value = present === true ? 'dark' : 'light';
    }
  }
);

const version = import.meta.env.VITE_APP_VERSION;

const themeColor = ref(isDark.value ? 'dark' : 'light'); // Current theme color
</script>
<style scoped>
.footer {
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 5px;
  z-index: 2;
}

.footer-left {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
}

.footer-left > div, .footer-right > div, .footer-simple > div {
  margin-right: 1em;
}

.footer-right {
  display: flex;
  height: 100%;
  align-items: center;
}

.footer-simple {
  width: 100%;
  padding: 5px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 2;
}

img { height: 100%; }

.logo { height: 100%; }
.logo-smaller { height: 60%; }

.social {
  color: var(--color-black);
  font-size: 1.25em;
  padding: 0.33em;
}
.social:hover { color: var(--color-hover); }

.version-number {
  color: var(--color-black);
  font-size: 0.75em;
}
</style>