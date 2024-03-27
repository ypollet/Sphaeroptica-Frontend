<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { useImagesStore, useVirtualCameraStore } from '@/lib/stores';
import type { Coordinates, Image } from '@/lib/types';
import { help } from 'mathjs';

const LONG_MAX = 360
const LONG_MIN = 0

var imageStore = useImagesStore()
var cameraStore = useVirtualCameraStore()

interface Div {
  clientWidth : number,
  clientHeight : number
}

function checkClass(){
  let clientWidth : number = 1;
  let clientHeight : number = 1;
  if(imageContainer.value){
    clientWidth = imageContainer.value.clientWidth
    clientHeight = imageContainer.value.clientHeight
  }
  viewerClass.value = (clientWidth/clientHeight) > (imageStore.selectedImageWidth/ imageStore.selectedImageHeight) ? 'h-full' : 'w-full'
}
const viewerClass = ref('w-full')


onMounted(() => {
  const resizeObserver = new ResizeObserver(function() {
    checkClass()
  });
  if(imageContainer.value){
    resizeObserver.observe(imageContainer.value);
  }
})
const imageContainer = ref<HTMLDivElement | null>(null)
cameraStore.$subscribe(() => {
  imageStore.setNearestImage(cameraStore.toRad)
})

watch(imageStore.getImageSize,
() => {
  checkClass()
})
checkClass()

var isPressed: boolean = false

function getImages() {
  const path = 'http://localhost:5000/images';
  axios.get(path, {
            params: {
              study: imageStore.objectPath,
            }
    })
    .then((res) => {
      imageStore.images = res.data.result.images as Image[]
      console.log("images : length = " + imageStore.images.length)
      
      imageStore.images.forEach((image: Image) => {
        console.log(image.name)
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

function onResize(){
  console.log("resize")
}

if (imageStore.images.length == 0){
  getImages()
}
imageStore.setNearestImage(cameraStore.toRad)

</script>
<template>
  <div ref="imageContainer" class="w-full h-full border flex justify-center items-center">
    <img class="object-fit" @mousedown="mouseEnter" @mouseup="mouseLeave" @mousemove="mouseMove" @mouseleave="mouseLeave" 
      :class="viewerClass" :src="imageStore.selectedImage" alt="album.name" aspect-ratio="auto" draggable="false">
  </div>
</template>

<style scoped>
.object-fit {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  display:block;
}
</style>