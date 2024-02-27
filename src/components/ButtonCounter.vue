<script lang="ts" setup>
import { useStorage } from '@vueuse/core'

const count = useStorage("count", 0, sessionStorage)

function increment(){
  console.log("ZELE")
  count.value++
};

</script>

<template>
  <button @click="increment()">
    You clicked me {{ count }} times.
  </button>
</template>