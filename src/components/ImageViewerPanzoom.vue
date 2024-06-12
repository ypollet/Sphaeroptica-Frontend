<script setup lang="ts">
import { ref, onMounted, nextTick, type HTMLAttributes, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { LandmarkImage, MarkerInfo } from '@/lib/types'
import "leaflet/dist/leaflet.css"
import { type PointExpression, Point, CRS, Icon, type LeafletMouseEvent, LatLngBounds, LatLng, Marker } from 'leaflet'
import L from 'leaflet'
import { LMap, LImageOverlay, LPopup, LMarker, LIcon } from "@vue-leaflet/vue-leaflet"
import { useLandmarkImagesStore } from '@/lib/stores'
import panzoom from "@panzoom/panzoom";
import type { PanzoomObject } from "@panzoom/panzoom";

const landmarksImageStore = useLandmarkImagesStore()

const ZOOM_MIN = 0.1
const ZOOM_MAX = 4
const ZOOM_DELTA = 0.5

const markers = ref<MarkerInfo[]>([])


const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const base_image = ref<HTMLImageElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const width = ref<number>(1000)
const height = ref<number>(1000)
const zoom = ref<number>(1)
let panzoom_instance:  PanzoomObject | null =  null;

onMounted(() => {
  const resizeObserver = new ResizeObserver(function () {
    update()
  });
  if (imageContainer.value) {
    resizeObserver.observe(imageContainer.value);
    let canvasEl = canvas.value as HTMLElement
    console.log("Instantiation panzoom")
    panzoom_instance = panzoom(canvasEl, {
      minScale: ZOOM_MIN,
      maxScale: ZOOM_MAX,
      contain: "outside",
      startScale: 1,
      startX: imageContainer.value.clientWidth/2,
      starty: imageContainer.value.clientHeight/2,
    });
    canvasEl.addEventListener("wheel", panzoom_instance.zoomWithWheel);
    canvasEl.addEventListener("wheel", print_scale);
       
  }
})
function print_scale(){
  console.log("Scale : ", panzoom_instance!.getScale())
  console.log("Pan : ", panzoom_instance!.getPan())
}

function loaded() {
  console.log("load image")
  if(base_image.value && imageContainer.value){
    width.value = base_image.value.naturalWidth
    height.value = base_image.value.naturalHeight
    if (imageContainer.value && canvas.value ) {
      zoom.value = Math.max(imageContainer.value.clientWidth / base_image.value.naturalWidth, imageContainer.value.clientHeight / base_image.value.naturalHeight)
      console.log("zoom : ", zoom.value)
    }
  }
  nextTick(() => { 
      console.log("Hello")
      print_scale()
      panzoom_instance!.zoom(zoom.value)
      print_scale()
      update()
  })
}

function drawImage() {
  console.log(base_image.value)
  console.log(base_image.value && base_image.value.complete)
  if (canvas.value && base_image.value && base_image.value.complete) {
    console.log("check")
    let ctx = canvas.value.getContext("2d")!
    ctx.drawImage(base_image.value, 0, 0, width.value, height.value)
  }
  print_scale()
}

function update() {
  console.log("update")
  drawImage()

}

function print_pos(event : MouseEvent){
  const svgRect = canvas.value!.getBoundingClientRect();
  console.log((event.pageX - svgRect.left)/zoom.value, (event.pageY - svgRect.top)/zoom.value)
  print_scale()
}
function addMarker(event: LeafletMouseEvent) {
  event.originalEvent.preventDefault()
}
</script>

<template>
  <div ref="imageContainer" :class="cn('relative border w-full h-full overflow-auto', props.class)" @wheel.prevent>
    <canvas ref="canvas" :width="width" :height="height" @click="print_pos" @contextMenu="addMarker">
    </canvas>
    <img ref="base_image" class="hidden" :src="props.modelValue.image" alt="Image of view" aspect-ratio="auto" @load="loaded">
  </div>

</template>

<style scoped>
.object-fit {
  display: flex;
  object-fit: contain;
  max-width: none;
}
</style>
