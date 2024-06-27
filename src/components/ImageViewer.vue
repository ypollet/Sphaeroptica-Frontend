<script setup lang="ts">
import { ref, onMounted, nextTick, type HTMLAttributes, watch, version } from 'vue'
import { cn } from '@/lib/utils'
import { type Coordinates, type LandmarkImage, Landmark, type Marker } from '@/lib/types'
import { useLandmarksStore, useVCImagesStore } from '@/lib/stores'
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu'
import axios from 'axios'

const landmarksStore = useLandmarksStore()
const imageStore = useVCImagesStore()

function computeReprojection(){

}

function checkVersions(){
  landmarksStore.landmarks.forEach((landmark, index) => {
    console.log(props.modelValue.versions)
    if(props.modelValue.versions.get(landmark.id) == null || props.modelValue.versions.get(landmark.id) != landmark.getVersion()){
      props.modelValue.versions.set(landmark.id, landmark.getVersion())
      computeReprojection()
    }
  })
  update()
}
landmarksStore.$subscribe((mutation, state) => {
  checkVersions()
})


const ZOOM_MIN = 0.1
const ZOOM_MAX = 4
const ZOOM_DELTA = 0.5

const DOT_RADIUS = 4
const SPACE_TARGET = 0.2

const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const base_image = ref<HTMLImageElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const shiftCanvas = ref<Coordinates>({ x: 0, y: 0 })
const dragging = ref<boolean>(false)
const landmarkDragged = ref<number>(-1)
const draggedPos = ref<Coordinates>({ x: -1, y: -1 })
const posContextMenu = ref<Coordinates>({ x: -1, y: -1 })

const degrees_to_radians = (deg: number) => (deg * Math.PI) / 180.0; // Convert degrees to radians using the formula: radians = (degrees * Math.PI) / 180

watch(landmarkDragged, () => {
  if (landmarkDragged.value < 0) {

  } else {

  }
})

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
  checkVersions()
})

function loaded() {
  nextTick(() => {
    if (props.modelValue.zoom <= 0) {
      screenFit()
    }
    update()
  })
}

function drawImage() {
  if (canvas.value && base_image.value && base_image.value.complete) {
    let ctx = canvas.value.getContext("2d")!

    ctx.scale(props.modelValue.zoom, props.modelValue.zoom)

    ctx.translate(props.modelValue.offset.x, props.modelValue.offset.y)

    shiftCanvas.value = {
      x: Math.max(0, (canvas.value.width - base_image.value.naturalWidth * props.modelValue.zoom) / 2) / props.modelValue.zoom,
      y: Math.max(0, (canvas.value.height - base_image.value.naturalHeight * props.modelValue.zoom) / 2) / props.modelValue.zoom
    }
    ctx.drawImage(base_image.value, 0, 0, base_image.value.naturalWidth, base_image.value.naturalHeight,
      shiftCanvas.value.x, shiftCanvas.value.y, base_image.value.naturalWidth, base_image.value.naturalHeight)

    landmarksStore.landmarks.forEach((landmark, id) => {
      let marker = landmark.getPoses().get(props.modelValue.name)
      let radius = DOT_RADIUS / props.modelValue.zoom
      if (!marker) {
        //if undefined
        return
      }
      ctx.beginPath();
      if (landmarkDragged.value == id) {
        marker = draggedPos.value
        const targetRadius = radius * 4
        // draw circle
        ctx.arc((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y), targetRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = DOT_RADIUS / 2 / props.modelValue.zoom;
        ctx.stroke()
        ctx.closePath();

        // draw white lines diagonals
        ctx.beginPath();
        let start: Coordinates = posCircle(marker, 45, targetRadius, shiftCanvas.value);
        let end: Coordinates = posCircle(marker, 45, targetRadius * SPACE_TARGET, shiftCanvas.value);
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)

        start = posCircle(marker, 135, targetRadius, shiftCanvas.value);
        end = posCircle(marker, 135, targetRadius * SPACE_TARGET, shiftCanvas.value);
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)

        start = posCircle(marker, 225, targetRadius, shiftCanvas.value);
        end = posCircle(marker, 225, targetRadius * SPACE_TARGET, shiftCanvas.value);
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)

        start = posCircle(marker, 315, targetRadius, shiftCanvas.value);
        end = posCircle(marker, 315, targetRadius * SPACE_TARGET, shiftCanvas.value);
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)

        ctx.strokeStyle = 'white';
        ctx.lineWidth = DOT_RADIUS / 3 / props.modelValue.zoom;

        ctx.stroke()
        ctx.closePath();

        // draw black lines lines horizontal and vertical
        ctx.beginPath();

        //horizontal
        ctx.moveTo((marker.x + shiftCanvas.value.x) + (targetRadius * (1 - SPACE_TARGET)), (marker.y + shiftCanvas.value.y))
        ctx.lineTo((marker.x + shiftCanvas.value.x) + (targetRadius * SPACE_TARGET), (marker.y + shiftCanvas.value.y))

        ctx.moveTo((marker.x + shiftCanvas.value.x) - (targetRadius * (1 - SPACE_TARGET)), (marker.y + shiftCanvas.value.y))
        ctx.lineTo((marker.x + shiftCanvas.value.x) - (targetRadius * SPACE_TARGET), (marker.y + shiftCanvas.value.y))

        //vertical
        ctx.moveTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) + (targetRadius * (1 - SPACE_TARGET)))
        ctx.lineTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) + (targetRadius * SPACE_TARGET))

        ctx.moveTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) - (targetRadius * (1 - SPACE_TARGET)))
        ctx.lineTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) - (targetRadius * SPACE_TARGET))

        ctx.strokeStyle = 'black';
        ctx.lineWidth = DOT_RADIUS / 3 / props.modelValue.zoom;
        ctx.stroke()
      }
      else {

        ctx.arc((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y), radius, 0, 2 * Math.PI);
        ctx.fillStyle = landmark.getColorHEX()
        ctx.fill();
        ctx.lineWidth = DOT_RADIUS / 2 / props.modelValue.zoom;
        ctx.strokeStyle = "black";
        ctx.stroke();

      }

    });
  }
}

function posCircle(center: Coordinates, angle: number, radius: number, translate: Coordinates = { x: 0, y: 0 }): Coordinates {
  return { x: (center.x + radius * Math.cos(degrees_to_radians(angle))) + translate.x, y: (center.y + radius * Math.sin(degrees_to_radians(angle))) + translate.y };
}

function update() {
  if (canvas.value && base_image.value && base_image.value.complete) {
    // Clear canvas
    canvas.value.width = canvas.value.width

    // Check that offset values
    updateOffset(0, 0)

    //draw Image
    drawImage()
  }
}

function screenFit() {
  if (base_image.value && base_image.value.complete && imageContainer.value && canvas.value) {
    canvas.value.width = Math.floor(imageContainer.value.clientWidth)
    canvas.value.height = Math.floor(imageContainer.value.clientHeight)

    props.modelValue.zoom = Math.min(imageContainer.value.clientWidth / base_image.value.naturalWidth, imageContainer.value.clientHeight / base_image.value.naturalHeight)
  }
}

function getPos(event: MouseEvent): Coordinates {
  const svgRect = canvas.value!.getBoundingClientRect();
  let x = ((event.pageX - svgRect.left) / props.modelValue.zoom) - props.modelValue.offset.x - shiftCanvas.value.x
  let y = ((event.pageY - svgRect.top) / props.modelValue.zoom) - props.modelValue.offset.y - shiftCanvas.value.y

  return { x: x, y: y }
}

function updateOffset(movementX: number, movementY: number) {
  if (base_image.value && canvas.value) {
    props.modelValue.offset.x = props.modelValue.offset.x + movementX / props.modelValue.zoom
    props.modelValue.offset.y = props.modelValue.offset.y + movementY / props.modelValue.zoom

    //check value
    props.modelValue.offset.x = Math.min(0, Math.max(-((base_image.value.naturalWidth * props.modelValue.zoom) - canvas.value.width) / props.modelValue.zoom, props.modelValue.offset.x))
    props.modelValue.offset.y = Math.min(0, Math.max(-((base_image.value.naturalHeight * props.modelValue.zoom) - canvas.value.height) / props.modelValue.zoom, props.modelValue.offset.y))
  }
}

function updateZoom(zoomDelta: number) {

  props.modelValue.zoom = +(props.modelValue.zoom + (zoomDelta / 50)).toFixed(2)

  //check value
  props.modelValue.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, props.modelValue.zoom))
}


function zoomWithWheel(event: WheelEvent) {
  let oldZoom = props.modelValue.zoom
  updateZoom(Math.sign(-event.deltaY))
  let deltaZoom = props.modelValue.zoom / oldZoom

  //get pos mouse in canvas
  const svgRect = canvas.value!.getBoundingClientRect();
  let mouseX = event.pageX - svgRect.left
  let mouseY = event.pageY - svgRect.top

  //update offset
  let deltaOffsetX = -((svgRect.width * deltaZoom) - svgRect.width) * (mouseX / svgRect.width) // (dest offset - src offset) * ratio of pos mouse
  let deltaOffsetY = -((svgRect.height * deltaZoom) - svgRect.height) * (mouseY / svgRect.height)

  updateOffset(deltaOffsetX, deltaOffsetY)
  update()
}

function startDrag(event: MouseEvent) {
  if (event.button == 0) {
    dragging.value = true
    if (canvas.value) {
      let pos = getPos(event)
      landmarksStore.landmarks.forEach((landmark, index) => {
        let marker = landmark.getPoses().get(props.modelValue.name)
        if (!marker) {
          //if undefined
          return
        }
        if (pointInsideCircle(pos, marker, DOT_RADIUS / props.modelValue.zoom)) {
          console.log("found")
          landmarkDragged.value = index
        }
      })
    }
  }
}

function mousemove(event: MouseEvent) {
  if (dragging.value == true) {
    if (landmarkDragged.value < 0) {
      // no marker to drag => pan image
      updateOffset(event.movementX, event.movementY)
    }
    else {
      // drag marker
      draggedPos.value = getPos(event)
    }

    update()
  }
}

function stopDrag(event: MouseEvent) {
  dragging.value = false

  if (landmarkDragged.value >= 0) {
    //update pos of landmark
    landmarksStore.landmarks[landmarkDragged.value].addPose(props.modelValue.name, getPos(event))

    //triangulate landmark
    landmarksStore.landmarks[landmarkDragged.value].triangulatePosition(imageStore.objectPath)

    // reinit landmarkDrag
    landmarkDragged.value = -1
    draggedPos.value = { x: -1, y: -1 }

  }


}

function pointInsideCircle(pointCoord: Coordinates, circleCoord: Coordinates, radius: number) {
  const distance =
    Math.sqrt((pointCoord.x - circleCoord.x) ** 2 + (pointCoord.y - circleCoord.y) ** 2);
  return distance < radius;
}
function printPos(event: MouseEvent) {
  let pos = getPos(event)
  console.log("Position = ", pos.x, " : ", pos.y)
}

function onImage(pos: Coordinates): boolean {
  if (base_image.value) {
    return pos.x >= 0 && pos.y >= 0 && pos.x <= base_image.value.naturalWidth && pos.y <= base_image.value.naturalHeight
  }
  return false
}
function addMarker(event: MouseEvent) {
  posContextMenu.value = getPos(event)
  if (!onImage(posContextMenu.value)) {
    // Don't show context menu if image not clicked
    event.preventDefault()
    return;
  }

}

function clickContext(landmark: Landmark) {
  landmark.addPose(props.modelValue.name, { x: posContextMenu.value.x, y: posContextMenu.value.y })
  //triangulate landmark
  landmark.triangulatePosition(imageStore.objectPath)
  update()
}

function addLandmark() {
  let id = landmarksStore.generateID()
  let landmark = new Landmark(id, id)
  landmarksStore.addLandmark(landmark);
  landmark.addPose(props.modelValue.name, { x: posContextMenu.value.x, y: posContextMenu.value.y })
  update()
}

</script>

<template>
  <div ref="imageContainer"
    :class="cn('relative border w-full h-full flex justify-center items-center overflow-auto', props.class)"
    @wheel.prevent>
    <ContextMenu>
      <ContextMenuTrigger class="flex w-full h-full">
        <canvas ref="canvas" :class="(landmarkDragged >= 0) ? 'cursor-none' : 'cursor-pointer'" @mousedown="startDrag"
          @mouseup="stopDrag" @mouseout="stopDrag" @mousemove="mousemove" @wheel="zoomWithWheel"
          @contextmenu="addMarker">
        </canvas>
      </ContextMenuTrigger>
      <ContextMenuContent class="w-64">
        <ContextMenuLabel>
          Landmarks
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem v-for="landmark in landmarksStore.landmarks" class="block" inset
          @select="clickContext(landmark as Landmark)">
          <div class="flex space-x-4">
            <svg class="h-4 w-4" viewBox="0 0 8 8" stroke="currentColor" stroke-width="1" :fill="landmark.getColorHEX()"
              xmlns="http://www.w3.org/2000/svg">
              <circle cx="4" cy="4" r="3" />
            </svg>
            <div>{{ landmark.getLabel() }}</div>
          </div>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem class="block" inset @select="addLandmark">
          Add Landmark
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    <img ref="base_image" class="hidden" :src="props.modelValue.image" alt="Image of view" aspect-ratio="auto"
      @load="loaded">
  </div>

</template>

<style scoped>
.object-fit {
  display: flex;
  object-fit: contain;
  max-width: none;
}
</style>
