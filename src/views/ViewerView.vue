<script setup lang="ts">
import { ref } from "vue";
import Menu from "@/components/Menu.vue";
import Viewer from "@/components/Viewer.vue";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

const isLeft = ref(false)
</script>

<template>
  <main class="h-screen">
    <Menu class="sticky menu top-0 flex flex-row grow z-50"></Menu>
    <Separator></Separator>
    <div class="h-full flex"
    :class="isLeft ? 'flex-row' : 'flex-row-reverse'">
      <ScrollArea class="rest_height sidebar rounded-md border p-4">
        <Sidebar />
      </ScrollArea>

      <div id="viewer_container" class="rest_width rest_height flex grow items-center justify-center">
        <Viewer />
      </div>
    </div>
  </main>
</template>

<style scoped>
.menu {
  height: 60px;
}

.sidebar {
  width: 25%;
}

.rest_height {
  height: calc(100% - 60px);
}

.rest_width {
  width: 75%;
}
</style>
