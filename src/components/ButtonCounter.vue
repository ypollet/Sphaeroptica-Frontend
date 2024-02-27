<script lang="ts" setup>
import { useStorage } from '@vueuse/core'
import { Button } from '@/components/ui/button'

const count = useStorage("count", 0, sessionStorage)

</script>

<template>
  <Button @click="count++">
    You clicked me {{ count }} times.
  </Button>
</template>