<script setup lang="ts">
import Menu from '@/components/Menu.vue';
import Viewer from '@/components/Viewer.vue';
import { Separator } from '@/components/ui/separator'
import { Sidebar } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area';
</script>

<template>
  <main class="h-screen">
    <Menu class="sticky top-0 flex flex-row grow z-50"></Menu>
    <Separator></Separator>
    <div class="h-full flex flex-row">
      <ScrollArea class="w-1/4 rounded-md border p-4 left-0">
        <Sidebar />
      </ScrollArea>
      <div class="h-screen flex items-center justify-center">
        <Viewer/>
      </div>
    </div>

  </main>
</template>
