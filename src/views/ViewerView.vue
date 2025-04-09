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
  <div class="rest_height">
    <div class="flex w-screen h-full" :class="settingsStore.isLeft ? 'flex-row' : 'flex-row-reverse'">
      <div class="h-full w-96 flex-none overflow-auto rounded-md border p-4">
        <Sidebar />
      </div>

      <div class="h-full w-0 flex-auto items-center justify-center">
        <ImageViewer/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rest_height {
  height: calc(100% - 41px);
}

</style>
