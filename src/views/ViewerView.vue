<!-- 
Sphaeroptica - 3D Viewer on calibrated images - Frontend

Copyright (C) 2024 Yann Pollet, Royal Belgian Institute of Natural Sciences


This program is free software: you can redistribute it and/or

modify it under the terms of the GNU General Public License as

published by the Free Software Foundation, either version 3 of the

License, or (at your option) any later version.



This program is distributed in the hope that it will be useful, but

WITHOUT ANY WARRANTY; without even the implied warranty of

MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU

General Public License for more details.


You should have received a copy of the GNU General Public License

along with this program. If not, see <http://www.gnu.org/licenses/>. 
-->

<script setup lang="ts">
import { Sidebar } from "@/components/ui/sidebar";
import ImageViewer from "@/components/ui/image-viewer/ImageViewer.vue";
import { useSettingsStore } from "@/lib/stores";

const settingsStore = useSettingsStore()

</script>

<template>
  <main class="h-screen">
    <div class="h-full flex" :class="settingsStore.isLeft ? 'flex-row' : 'flex-row-reverse'">
      <div class="rest_height overflow-auto sidebar rounded-md border p-4">
        <Sidebar />
      </div>

      <div class="rest_width rest-height flex grow items-center justify-center">
        <ImageViewer />
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
  height: calc(100% - 61px);
}

.rest_width {
  width: 75%;
}
</style>
