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

import { onMounted, ref, watch } from 'vue';

import { Loader2 } from 'lucide-vue-next';

import { useQuery } from '@tanstack/vue-query'

import { useImageStore, useVirtualCameraStore } from '@/lib/stores';

import type { VirtualCameraImage } from '@/data/models/virtual_camera_image'
import * as turf from '@turf/turf'

import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"
import type { Pos } from '@/data/models/pos';
import type { Feature, Point } from 'geojson';
import { storeToRefs } from 'pinia';
import { round } from 'mathjs'

const imageStore = useImageStore()
const cameraStore = useVirtualCameraStore()
const { zoomRect } = storeToRefs(imageStore)
const { images } = storeToRefs(cameraStore)



const scaledZoomRect = ref<{
  top: number;
  left: number;
  width: number;
  height: number;
}>(zoomRect.value)

const base_image = ref<HTMLImageElement | null>(null)
const imageContainer = ref<HTMLDivElement | null>(null)

const isZoomedOut = ref<boolean>(true)

const { isPending, isError, data, error } = useQuery({
  queryKey: ['all_images'],
  queryFn: () => getImages(),
})
var isPressed: boolean = false

const repository = RepositoryFactory.get(repositorySettings.type)
watch(zoomRect, () => {
  updateRect()
})

onMounted(() => {
  updateRect()
})

watch(images, () => {
  if(cameraStore.objectPath != ""){
    getImages()
  }
})

async function getImages(): Promise<Array<VirtualCameraImage>> {
  if (cameraStore.images.length > 0) {

    return cameraStore.images
  }
  return repository.getImages(cameraStore.objectPath).then((data) => {
    let images = data.images
    // Set Latitude Values
    let latMin = Number.MAX_VALUE
    let latMax = Number.MIN_VALUE
    let points: Array<Feature<Point, {
      index: number;
    }>> = []
    try {

      images.forEach((image: VirtualCameraImage, index: number) => {
        let point = turf.point([image.coordinates.longitude, image.coordinates.latitude], { 'index': index })
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
    } catch (e) {
      console.error("Orthanc sent the data but there's an error, we'll reset and start again : " + (e as Error).message)
      cameraStore.$reset()
      throw new Error((e as Error).message)
    }
    return images

  })
}

function updateRect() {
  if (imageContainer.value && base_image.value && base_image.value.complete) {
    let ratioW = imageStore.size.width / imageContainer.value.clientWidth
    let ratioH = imageStore.size.height / imageContainer.value.clientHeight
    
    scaledZoomRect.value = {
      top: zoomRect.value.top / ratioH,
      left: zoomRect.value.left / ratioW,
      width: zoomRect.value.width / ratioW,
      height: zoomRect.value.height / ratioH
    }

    isZoomedOut.value = round(zoomRect.value.width,3) != round(imageStore.size.width, 3) || round(zoomRect.value.height,3) != round(imageStore.size.height, 3)
  }
}


function mouseEnter(event: MouseEvent) {
  isPressed = true
}
function mouseMove(event: MouseEvent) {
  if (isPressed) {
    let widthContainer = imageContainer.value!.clientWidth
    let heightContainer = imageContainer.value!.clientHeight

    let pos: Pos = { x: event.movementX, y: event.movementY }
    cameraStore.moveLongitude(((pos.x) / widthContainer * 2 * 90))
    cameraStore.moveLatitude(((pos.y) / heightContainer * 2 * 90))

  }
}
function mouseLeave() {
  isPressed = false
}
</script>
<template>
  <div class="w-full h-full border flex justify-center items-center">
    <div v-if="isPending" class="w-full h-full flex justify-center items-center">
      <Loader2 class="animate-spin mr-10 w-full aspect-square" width="10%" height="10%" />
    </div>
    <div v-if="isError" class="w-full h-full flex justify-center items-center">
      <div class="text-red-600">{{ error }}</div>
    </div>
    <div v-if="data" ref="imageContainer" class="w-full h-full relative p-0" @mousedown="mouseEnter" @mouseup="mouseLeave" @mousemove="mouseMove"
    @mouseleave="mouseLeave">
      <div class="absolute bottom-0 left-0 w-full h-full">
        <svg v-if="isZoomedOut" class="w-full h-full">
          <rect id="box" :x="scaledZoomRect.left" :y="scaledZoomRect.top" :width="scaledZoomRect.width" :height="scaledZoomRect.height" />
        </svg>
      </div>
      <img class="object-fit" ref="base_image"  :src="cameraStore.selectedImage.thumbnail || cameraStore.selectedImage.fullImage"
        :alt="cameraStore.selectedImage.name" aspect-ratio="auto" draggable="false">
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

#box {
  position: absolute;
  fill: transparent;
  stroke: red;
  stroke-width : 3;
}
</style>