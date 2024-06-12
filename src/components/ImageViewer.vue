<script setup lang="ts">
import { ref, onMounted, nextTick, type HTMLAttributes, watch } from 'vue'
import { cn } from '@/lib/utils'
import { type Coordinates, type LandmarkImage, type MarkerInfo, type MarkerInfoCanvas } from '@/lib/types'
import { useLandmarkImagesStore } from '@/lib/stores'
import { marker } from 'leaflet';

const landmarksImageStore = useLandmarkImagesStore()

const ZOOM_MIN = 0.1
const ZOOM_MAX = 4
const ZOOM_DELTA = 0.5

const markers = ref<MarkerInfoCanvas[]>([])


const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const base_image = ref<HTMLImageElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const offset = ref<Coordinates>({ x: 0, y: 0})
const shiftCanvas = ref<Coordinates>({ x: 0, y: 0})
const dragging = ref<boolean>(false)
const landmark = ref<number>(-1)
const zoom = ref<number>(1)

onMounted(() => {
  const resizeObserver = new ResizeObserver(function () {
    if (imageContainer.value && canvas.value && base_image.value) {
      canvas.value.width = Math.floor(imageContainer.value.clientWidth)
      canvas.value.height = Math.floor(imageContainer.value.clientHeight)
      update()
    }
    
  });
  if (imageContainer.value) {
    resizeObserver.observe(imageContainer.value);
  }
})

function loaded() {
  nextTick(() => {
    screenFit()
    update()
  })
}

function drawImage() {
  if (canvas.value && base_image.value && base_image.value.complete) {
    let ctx = canvas.value.getContext("2d")!
    ctx.scale(zoom.value,zoom.value)
    ctx.translate(offset.value.x, offset.value.y)
    shiftCanvas.value = { x: Math.max(0, (canvas.value.width-base_image.value.naturalWidth*zoom.value)/2)/zoom.value, 
                          y: Math.max(0, (canvas.value.height-base_image.value.naturalHeight*zoom.value)/2)/zoom.value}
    ctx.drawImage(base_image.value, 0, 0, base_image.value.naturalWidth, base_image.value.naturalHeight, 
      shiftCanvas.value.x, shiftCanvas.value.y, base_image.value.naturalWidth, base_image.value.naturalHeight)

    markers.value.forEach(marker => {
      ctx.beginPath();
      ctx.arc((marker.x+shiftCanvas.value.x), (marker.y+shiftCanvas.value.y), 4/zoom.value, 0/zoom.value, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.lineWidth = 2/zoom.value;
      ctx.strokeStyle = "black";
      ctx.stroke();
    });
  }
}

function update() {
  if(canvas.value){
    canvas.value.width = canvas.value.width
    updateOffset(0,0)
    drawImage()
  }
}

function screenFit(){
  if(base_image.value && imageContainer.value && canvas.value){
    canvas.value.width = Math.floor(imageContainer.value.clientWidth)
    canvas.value.height = Math.floor(imageContainer.value.clientHeight)
    
    zoom.value = Math.min(imageContainer.value.clientWidth / base_image.value.naturalWidth, imageContainer.value.clientHeight / base_image.value.naturalHeight)    
  }
}

function getPos(event : MouseEvent) : Coordinates {
  const svgRect = canvas.value!.getBoundingClientRect();
  let x = ((event.pageX - svgRect.left)/zoom.value) - offset.value.x - shiftCanvas.value.x
  let y = ((event.pageY - svgRect.top)/zoom.value) - offset.value.y - shiftCanvas.value.y

  return {x:x, y:y}
}

function updateZoom(zoomDelta : number){
  zoom.value = +(zoom.value+(zoomDelta/100)).toFixed(2)

  //check value
  zoom.value = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom.value))
}


function updateOffset(movementX : number, movementY : number){
  if(base_image.value && canvas.value){
    offset.value.x = offset.value.x+ movementX/zoom.value
    offset.value.y = offset.value.y+ movementY/zoom.value
    
    //check value
    offset.value.x = Math.min(0, Math.max(-((base_image.value.naturalWidth*zoom.value)-canvas.value.width)/zoom.value, offset.value.x))
    offset.value.y = Math.min(0, Math.max(-((base_image.value.naturalHeight*zoom.value)-canvas.value.height)/zoom.value, offset.value.y))
  }
}


function zoomWithWheel(event : WheelEvent){
  updateZoom(Math.sign(-event.deltaY))
  update()
}

function startDrag(event : MouseEvent){
  if(event.button == 0){
    dragging.value = true
  }
  printPos(event)
}

function mousemove(event : MouseEvent){
  if(dragging.value == true){
    updateOffset(event.movementX, event.movementY)
    update()
  }
}

function stopDrag(event : MouseEvent){
  dragging.value = false
}

function printPos(event : MouseEvent){
  let pos = getPos(event)
}
function addMarker(event: MouseEvent) {
  let posMarker = getPos(event)
  let marker: MarkerInfoCanvas = { label: "Hello", x : posMarker.x, y : posMarker.y, dragged: false }
  markers.value.push(marker)
  event.preventDefault()
  update()
}

</script>

<template>
  <div ref="imageContainer" :class="cn('relative border w-full h-full flex justify-center items-center overflow-auto', props.class)" @wheel.prevent>
    <canvas ref="canvas" @contextmenu="addMarker"
    @mousedown="startDrag" @mouseup="stopDrag" @mouseout="stopDrag" @mousemove="mousemove" @wheel="zoomWithWheel">
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
