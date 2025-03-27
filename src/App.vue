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
import { useDark } from '@vueuse/core';
import Menu from "@/components/Menu.vue";
import { Separator } from "@/components/ui/separator";
import SelectView from './views/SelectView.vue';
import ViewerView from './views/ViewerView.vue';
import { useLandmarkImagesStore, useLandmarksStore, useVirtualCameraStore } from "@/lib/stores";

useDark({
  storageKey: 'localStorage'
})


const landmarksStore = useLandmarksStore()
const landmarkImagesStore = useLandmarkImagesStore()
const cameraStore = useVirtualCameraStore()

let urlParams = new URLSearchParams(window.location.search);

if(urlParams.has('series')){
  console.log("Has series")
  let seriesId = urlParams.get('series') as string
  if(cameraStore.objectPath != seriesId){
    console.log("Complete Reset : ", seriesId)
    landmarksStore.$reset()
    landmarkImagesStore.$reset()
    cameraStore.setPath(seriesId)
  }
}
else{
  landmarksStore.$reset()
  landmarkImagesStore.$reset()
  cameraStore.$reset()
}
</script>

<template>
  <div class="overflow-hidden">
    <Menu class="sticky menu top-0 flex flex-row grow z-50"></Menu>
    <Separator></Separator>
    <ViewerView v-if="cameraStore.objectPath"/>
    <SelectView v-else/>
  </div>
</template>

