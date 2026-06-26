<template>
  <div class="flex-center size100">
    <img class="logo-image" src="/assets/img/logo.webp" alt="Application logo" />
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
/* Tablet */
.logo-image {
  max-width: 60%;
  height: auto;
}

@media (min-width: 768px) {
  .logo-image {
    max-width: 40%;
  }
}

/* Laptop / small desktop */
@media (min-width: 1024px) {
  .logo-image {
    max-width: 40%;
  }
}

/* Large desktop */
@media (min-width: 1280px) {
  .logo-image {
    max-width: 30%;
  }
}

/* Extra large desktop */
@media (min-width: 1536px) {
  .logo-image {
    max-width: 20%;
  }
}
</style>
