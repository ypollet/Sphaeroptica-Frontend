<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useDark } from "@vueuse/core";
const isDark = useDark();
isDark.value = true;

</script>

<template>
  <div class="h-screen overflow-hidden"> <RouterView/></div>
</template>

