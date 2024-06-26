<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { useLandmarkImagesStore, useVCImagesStore, useVirtualCameraStore } from '@/lib/stores';
import type { Coordinates, LandmarkImage, VirtualCameraImage } from '@/lib/types';

const LONG_MAX = 360
const LONG_MIN = 0

const landmarksImageStore = useLandmarkImagesStore()
const imageStore = useVCImagesStore()
const cameraStore = useVirtualCameraStore()

const imageContainer = ref<HTMLDivElement | null>(null)

cameraStore.$subscribe(() => {
  imageStore.setNearestImage(cameraStore.toRad)
})

var isPressed: boolean = false

function getImages() {
  const path = 'http://localhost:5000/images';
  axios.get(path, {
            params: {
              study: imageStore.objectPath,
            }
    })
    .then((res) => {
      imageStore.images = res.data.result.images as VirtualCameraImage[]
      console.log("images : length = " + imageStore.images.length)
      
      imageStore.images.forEach((image: VirtualCameraImage) => {
        if (image.latitude < imageStore.latMin) {
          imageStore.latMin = image.latitude
        }
        if (image.latitude > imageStore.latMax) {
          imageStore.latMax = image.latitude
        }
      })
      cameraStore.reset()
      imageStore.setNearestImage(cameraStore.toRad)

    })
    .catch((error) => {
      console.error(error);
    });
}

function mouseEnter(event: MouseEvent) {
  isPressed = true
}
function mouseMove(event: MouseEvent) {
  if (isPressed) {
    let pos: Coordinates = { x: event.movementX, y: event.movementY }
    cameraStore.setLongitude(((pos.x) / 5), LONG_MIN, LONG_MAX)
    cameraStore.setLatitude(((pos.y) / 5), imageStore.latMin, imageStore.latMax)
   }
}
function mouseLeave() {
  isPressed = false
}

function selectImage(){
  const path = 'http://localhost:5000/image';
  let image : LandmarkImage = {
    name: imageStore.selectedImageName,
    image: 'http://localhost:5000/image?study='+imageStore.objectPath+"&image="+imageStore.selectedImageName,
    zoom: -1,
    offset: {x:0, y:0}
  }
  landmarksImageStore.addImage(image)
}

if (imageStore.images.length == 0){
  getImages()
}
imageStore.setNearestImage(cameraStore.toRad)

</script>
<template>
  <div ref="imageContainer" class="w-full h-full border flex justify-center items-center">
    <img class="object-fit" @mousedown="mouseEnter" @mouseup="mouseLeave" @mousemove="mouseMove" @mouseleave="mouseLeave" @dblclick="selectImage()"
      :src="imageStore.selectedImage" alt="album.name" aspect-ratio="auto" draggable="false">
  </div>
</template>

<style scoped>
.object-fit {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  width:100%;
  height:100%;
  display:block;
}
</style>