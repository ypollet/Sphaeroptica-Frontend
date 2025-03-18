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
import CameraViewer from "@/components/ui/camera-viewer/CameraViewer.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Button from "./ui/button/Button.vue";
import { X } from "lucide-vue-next";
import { useLandmarkImagesStore, DEFAULT_TAB, useVirtualCameraStore } from "@/lib/stores";
import ImageViewer from "@/components/ui/image-viewer/ImageViewer.vue";
import { storeToRefs } from "pinia";
import { ScrollBar, ScrollArea } from "./ui/scroll-area/";
import { round } from "mathjs";

const landmarkImageStore = useLandmarkImagesStore()
const cameraStore = useVirtualCameraStore()

const { getTabName } = storeToRefs(landmarkImageStore)

function removeTab(index: number) {
  landmarkImageStore.landmark_images.splice(index, 1)
  if (landmarkImageStore.landmark_images.length == 0) {
    landmarkImageStore.selected = -1
    return;
  }
  if (index >= landmarkImageStore.landmark_images.length) {
    landmarkImageStore.selected = landmarkImageStore.landmark_images.length - 1
    return;
  }
  landmarkImageStore.selected = index
}

function onTabChange(value: string | number) {
  landmarkImageStore.setTab(value.toString())
  console.log(landmarkImageStore.landmark_images)
}

</script>
<template>
  <Tabs :model-value="getTabName" @update:model-value="onTabChange" class="w-full h-full">
    <ScrollArea class="w-full tabs">
      <TabsList class="tabs-list space-x-2 p-2">
        <TabsTrigger :value="DEFAULT_TAB" class="flex justify-center items-end p-2">
          ({{ round(cameraStore.coordinates.longitude, 2) }}, {{ round(cameraStore.coordinates.latitude, 2)}})
        </TabsTrigger>
        <TabsTrigger v-for="(image, index) in landmarkImageStore.landmark_images" :value="image.name"
          class="flex justify-center items-end p-2">
          ({{ round(image.longLat.longitude, 2) }}, {{ round(image.longLat.latitude, 2)}})
          <Button variant="ghost" class="h-4 w-4 p-0 ml-2" @click="removeTab(index)">
            <X />
          </Button>
        </TabsTrigger>
      </TabsList>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    <TabsContent value="viewer" class="image m-0">
      <div class=" h-full w-full flex items-center justify-center">
        <CameraViewer />
      </div>
    </TabsContent>
      <TabsContent :value="image.name" class="image m-0" v-for="image in landmarkImageStore.landmark_images">
          <ImageViewer :model-value="image" />
      </TabsContent>
  </Tabs>

</template>

<style scoped>
.tabs {
  height: 70px;
}

.tabs-list {
  height: 60px;
}

.image {
  height: calc(100% - 70px);
}
</style>