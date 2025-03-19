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
import * as math from 'mathjs'
import { degreesToRad } from '@/lib/utils'

import { ref, watch, type Ref, nextTick } from 'vue';

import { Loader2 } from 'lucide-vue-next';

import { useQuery } from '@tanstack/vue-query'

import { useLandmarkImagesStore, useVirtualCameraStore } from '@/lib/stores';

import { LandmarkImage } from '@/data/models/landmark_image'
import type { VirtualCameraImage } from '@/data/models/virtual_camera_image'

import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"
import type { Pos } from '@/data/models/pos';

const landmarksImageStore = useLandmarkImagesStore()
const cameraStore = useVirtualCameraStore()

const imageContainer = ref<HTMLDivElement | null>(null)

const selectedImage: Ref<VirtualCameraImage> = ref({name:"", fullImage : "", thumbnail : "", coordinates:{longitude: 0, latitude : 0}})
const selectedImageName: Ref<string> = ref("")

cameraStore.$subscribe(() => {
  setNearestImage(cameraStore.toRad)
})

const { isPending, isError, data, error } = useQuery({
  queryKey: ['all_images'],
  queryFn: () => getImages(),
})
watch(data, () => {
  setNearestImage(cameraStore.toRad)
}) 

var isPressed: boolean = false

const repository = RepositoryFactory.get(repositorySettings.type)

function getImages(): Promise<Array<VirtualCameraImage>> {

  return repository.getImages(cameraStore.objectPath).then((images) => {
    // Set Latitude Values
    let dict_images : Map<string, VirtualCameraImage> = new Map()
    let latMin = Number.MAX_VALUE
    let latMax = Number.MIN_VALUE
    try{
      images.forEach((image: VirtualCameraImage) => {
      dict_images.set(image.name, image)
      if (image.coordinates.latitude < latMin) {
        latMin = image.coordinates.latitude
      }
      if (image.coordinates.latitude > latMax) {
        latMax = image.coordinates.latitude
      }
    })
    cameraStore.images = dict_images
    cameraStore.latMin = latMin
    cameraStore.latMax = latMax
    }catch(e){
      console.error("Orthanc sent the data but there's an error, we'll reset and start again : " + (e as Error).message)
      cameraStore.$reset()
      throw new Error((e as Error).message)
    }
    return images

  })
}

function setNearestImage(radPos: number[]) {
  if (data.value) {
    let bestAngle: Number = Infinity;
    let bestImage: VirtualCameraImage | null = null

    data.value.forEach((imageData: VirtualCameraImage) => {
      let imgPos: [number, number] = [degreesToRad(imageData.coordinates.longitude), degreesToRad(imageData.coordinates.latitude)]
      let sinus: number = math.sin(imgPos[1]) * math.sin(radPos[1])
      let cosinus: number = math.cos(imgPos[1]) * math.cos(radPos[1]) * math.cos(math.abs(imgPos[0] - radPos[0]))
      let centAngle: Number = math.acos(sinus + cosinus) as Number
      if (centAngle < bestAngle) {
        bestAngle = centAngle
        bestImage = imageData
      }
    })

    if (bestImage === null) {
      return;
    }
    var imageData: VirtualCameraImage = bestImage
    selectedImage.value = imageData
  }

}

function mouseEnter(event: MouseEvent) {
  isPressed = true
}
function mouseMove(event: MouseEvent) {
  if (isPressed) {
    let pos: Pos = { x: event.movementX, y: event.movementY }
    cameraStore.setLongitude(((pos.x) / 5))
    cameraStore.setLatitude(((pos.y) / 5))
  }
}
function mouseLeave() {
  isPressed = false
}

async function selectImage() {
  let image: LandmarkImage = repository.getImage(selectedImage.value)
  landmarksImageStore.addImage(image)
}

setNearestImage(cameraStore.toRad)

</script>
<template>
  <div class="w-full h-full border flex justify-center items-center">
    <div v-if="isPending" class="w-full h-full flex justify-center items-center">
      <Loader2 class="animate-spin mr-10" width="10%" height="10%" />
    </div>
    <div v-if="isError" class="w-full h-full flex justify-center items-center">
      <div class="text-red-600">{{ error }}</div>
    </div>
    <div v-if="data" ref="imageContainer" class="w-full h-full flex justify-center items-center">
      <img class="object-fit" @mousedown="mouseEnter" @mouseup="mouseLeave" @mousemove="mouseMove"
        @mouseleave="mouseLeave" @dblclick="selectImage()" :src="selectedImage.thumbnail" :alt="selectedImageName" aspect-ratio="auto"
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