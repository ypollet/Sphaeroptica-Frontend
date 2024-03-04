<script setup lang="ts">
import { ref } from "vue";
import Menu from "@/components/Menu.vue";
import Viewer from "@/components/Viewer.vue";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TransitionChild, TransitionRoot } from "@headlessui/vue";

const show_sidebar = ref(false);
console.log("Initial value :" + show_sidebar.value);
const updateSidebar = function () {
  show_sidebar.value = !show_sidebar.value;
  console.log(show_sidebar.value);
};
</script>

<template>
  <main class="h-screen">
    <Menu
      @show="updateSidebar"
      class="sticky menu top-0 flex flex-row grow z-50"
    ></Menu>
    <Separator></Separator>
    <div class="h-full flex flex-row">
      <TransitionRoot :show="show_sidebar">
        <TransitionChild
          enter="transform transition ease-in-out duration-500"
          enterFrom="-translate-x-64"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-500"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-64"
        >
          <ScrollArea class="rest_height sidebar rounded-md border p-4 left-0">
            <Sidebar />
          </ScrollArea>
        </TransitionChild>
      </TransitionRoot>
      <div
        id="viewer_container"
        class="transition-width duration-500 ease-in-out rest_height flex items-center justify-center"
        :class="{ rest_width: show_sidebar, 'w-full': !show_sidebar }"
      >
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
  width: 256px;
}

.rest_height {
  height: calc(100% - 60px);
}

.rest_width {
  width: calc(100% - 256px);
}
</style>
