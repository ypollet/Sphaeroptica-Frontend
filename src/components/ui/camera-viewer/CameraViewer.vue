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

import { ref } from 'vue';

import { Loader2 } from 'lucide-vue-next';

import { useQuery } from '@tanstack/vue-query'

import { useLandmarkImagesStore, useVirtualCameraStore } from '@/lib/stores';

import type { VirtualCameraImage } from '@/data/models/virtual_camera_image'
import * as turf  from '@turf/turf'

import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"
import type { Pos } from '@/data/models/pos';
import type { Feature, Point } from 'geojson';

const imageStore = useLandmarkImagesStore()
const cameraStore = useVirtualCameraStore()
console.log("Reset CameraViewer")

const imageContainer = ref<HTMLDivElement | null>(null)

const { isPending, isError, data, error } = useQuery({
  queryKey: ['all_images'],
  queryFn: () => getImages(),
})
var isPressed: boolean = false

const repository = RepositoryFactory.get(repositorySettings.type)

async function getImages(): Promise<Array<VirtualCameraImage>> {
  if(cameraStore.images.length > 0){
    
    return cameraStore.images
  }
  return repository.getImages(cameraStore.objectPath).then((data) => {
    let images = data.images
    // Set Latitude Values
    let latMin = Number.MAX_VALUE
    let latMax = Number.MIN_VALUE
    let points : Array<Feature<Point, {
    index: number;
      }>> = []
    try{
      
      images.forEach((image: VirtualCameraImage, index : number) => {
      let point = turf.point([image.coordinates.longitude, image.coordinates.latitude], {'index' : index})
      points.push(point)
      if (image.coordinates.latitude < latMin) {
        latMin = image.coordinates.latitude
      }
      if (image.coordinates.latitude > latMax) {
        latMax = image.coordinates.latitude
      }
    })
    cameraStore.images = images
    cameraStore.posImages = turf.featureCollection(points)
    cameraStore.latMin = latMin
    cameraStore.latMax = latMax
    imageStore.size = data.size
    }catch(e){
      console.error("Orthanc sent the data but there's an error, we'll reset and start again : " + (e as Error).message)
      cameraStore.$reset()
      throw new Error((e as Error).message)
    }
    return images

  })
}

function mouseEnter(event: MouseEvent) {
  isPressed = true
}
function mouseMove(event: MouseEvent) {
  if (isPressed) {
    let widthContainer = imageContainer.value!.clientWidth
    let heightContainer = imageContainer.value!.clientHeight

    let pos: Pos = { x: event.movementX, y: event.movementY }
    cameraStore.moveLongitude(((pos.x) / widthContainer *2 * 90))
    cameraStore.moveLatitude(((pos.y) / heightContainer *2 * 90))
    
  }
}
function mouseLeave() {
  isPressed = false
}

/*
async function selectImage() {
  let image: LandmarkImage = repository.getImage(cameraStore.selectedImage)
  landmarksImageStore.addImage(image)
}
*/
</script>
<template>
  <div class="w-full h-full border flex justify-center items-center">
    <div v-if="isPending" class="w-full h-full flex justify-center items-center">
      <Loader2 class="animate-spin mr-10 w-full aspect-square" width="10%" height="10%" />
    </div>
    <div v-if="isError" class="w-full h-full flex justify-center items-center">
      <div class="text-red-600">{{ error }}</div>
    </div>
    <div v-if="data" ref="imageContainer" class="w-full h-full flex justify-center items-center">
      <img class="object-fit" @mousedown="mouseEnter" @mouseup="mouseLeave" @mousemove="mouseMove"
        @mouseleave="mouseLeave" :src="cameraStore.selectedImage.thumbnail || cameraStore.selectedImage.fullImage" :alt="cameraStore.selectedImage.name" aspect-ratio="auto"
        draggable="false">
    </div>
  </div>
</template>

<style scoped>
.object-fit {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  display: block;
}
</style>