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
import { ref, onMounted, nextTick, type HTMLAttributes, watch, version } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { cn, ZOOM_MAX, ZOOM_MIN, DOT_RADIUS, SPACE_TARGET } from '@/lib/utils'
import { Landmark } from "@/data/models/landmark"
import { useImageStore, useLandmarksStore, useVirtualCameraStore } from '@/lib/stores'
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"
import type { Pos } from '@/data/models/pos'
import { storeToRefs } from 'pinia'
import type { Ratio, VirtualCameraImage } from '@/data/models/virtual_camera_image'

const repository = RepositoryFactory.get(repositorySettings.type)

const landmarksStore = useLandmarksStore()
const cameraStore = useVirtualCameraStore()
const imageStore = useImageStore()

const { selectedImage } = storeToRefs(cameraStore)
const { landmarks } = storeToRefs(landmarksStore)

const screenZoom = ref<number>(1)

landmarksStore.$subscribe(()=> {
  update()
})

async function computeReprojection(image : VirtualCameraImage, landmark: Landmark) {
  if (landmark.position) {
    repository.computeReprojection(cameraStore.objectPath, landmark.position, image.name).then((pose) => {
      image.reprojections.set(landmark.id, pose)
      image.versions.set(landmark.id, landmark.getVersion())
      update()
    }).catch((error) => {
      console.error(error);
    });
  }
}

async function checkVersions() {
  landmarksStore.landmarks.forEach((landmark, index) => {
    if (cameraStore.selectedImage.versions.get(landmark.id) == null || cameraStore.selectedImage.versions.get(landmark.id) !== landmark.getVersion()) {
      if (landmark.position != null) {
        computeReprojection(cameraStore.selectedImage, landmark)
      } else {
        // automatically delete key just in case
        cameraStore.selectedImage.reprojections.delete(landmark.id)
        update()
      }
    }
  })

}

function getRatio(): Ratio {
  if (base_image.value && base_image.value.complete) {
    return {
      width: base_image.value.naturalWidth / imageStore.size.width,
      height: base_image.value.naturalHeight / imageStore.size.height
    }
  }
  return {
    width: 0,
    height: 0
  }
}

const base_image = ref<HTMLImageElement>(new Image())

base_image.value.onload = (ev: Event) => {
  if (imageStore.zoom <= 0) {
    if (cameraStore.selectedImage.thumbnail) {
      screenFit()
    }
  }
  loaded()
}

base_image.value.src = cameraStore.selectedImage.thumbnail || cameraStore.selectedImage.fullImage
base_image.value.alt = (cameraStore.selectedImage.thumbnail) ? 'Thumbnail of ' + cameraStore.selectedImage.name : cameraStore.selectedImage.name

if (cameraStore.selectedImage.thumbnail) {
      base_image.value.onload = (ev: Event) => loaded()
    } else {
      base_image.value.onload = (ev: Event) => {
        if (imageStore.zoom <= 0) {
          screenFit()
        }
      }
    }


watch(
  selectedImage,
  () => {

    base_image.value.src = cameraStore.selectedImage.thumbnail || cameraStore.selectedImage.fullImage
    base_image.value.alt = (cameraStore.selectedImage.thumbnail) ? 'Thumbnail of ' + cameraStore.selectedImage.name : cameraStore.selectedImage.name
    base_image.value.onload = (ev: Event) => loaded()
    checkVersions()
  }
)
watch(landmarks, () => {
  checkVersions()
})



const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

var full_image = new Image()
const shiftCanvas = ref<Pos>({ x: 0, y: 0 })
const dragging = ref<boolean>(false)
const landmarkDragged = ref<Landmark | null>(null)
const draggedPos = ref<Pos>({ x: -1, y: -1 })
const posContextMenu = ref<Pos>({ x: -1, y: -1 })
const contextMenuOpen = ref<boolean>(false)

const degrees_to_radians = (deg: number) => (deg * Math.PI) / 180.0; // Convert degrees to radians using the formula: radians = (degrees * Math.PI) / 180

onMounted(() => {
  const resizeObserver = new ResizeObserver(function () {
    console.log("Resize : ", useWindowSize().height.value)
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
    screenFit()
    let image_name = cameraStore.selectedImage.name
    setTimeout(() => {
      if (image_name == cameraStore.selectedImage.name) {

        nextTick(() => {
          // Just verifies we draw the right image
          if (base_image.value.alt.endsWith(image_name)) {
            full_image = new Image()
            full_image.src = cameraStore.selectedImage.fullImage
            full_image.alt = image_name

            full_image.onload = (ev: Event) => {
              if (base_image.value.alt.endsWith(full_image.alt)) {
                base_image.value = full_image
                update()
              }
            }
          }
        })
      }
    }, 500);
    update()
  })
}

function drawImage() {
  if (canvas.value && base_image.value && base_image.value.complete && imageStore.zoom > 0) {
    let ratio = getRatio()

    let ctx = canvas.value.getContext("2d")!

    let zoomX = imageStore.zoom / ratio.width
    let zoomY = imageStore.zoom / ratio.height

    let radius = DOT_RADIUS / zoomX

    ctx.scale(zoomX, zoomY)

    ctx.translate(imageStore.offset.x * ratio.width, imageStore.offset.y * ratio.height)

    shiftCanvas.value = {
      x: Math.max(0, (canvas.value.width - base_image.value.naturalWidth * zoomX) / 2) / zoomX,
      y: Math.max(0, (canvas.value.height - base_image.value.naturalHeight * zoomY) / 2) / zoomY
    }
    ctx.drawImage(base_image.value, 0, 0, base_image.value.naturalWidth, base_image.value.naturalHeight,
      shiftCanvas.value.x, shiftCanvas.value.y, base_image.value.naturalWidth, base_image.value.naturalHeight)

    landmarksStore.landmarks.forEach((landmark, id) => {
      ctx.beginPath();
      if (landmark.equals(landmarkDragged.value)) {
        let marker = draggedPos.value
        // update pos marker depending on image
        marker = {
          x: marker.x * ratio.width,
          y: marker.y * ratio.height
        }

        drawTarget(ctx, marker, radius)
      }
      else {
        drawMarker(ctx, landmark, radius)
      }
      ctx.closePath()
    });

  }
}


function drawTarget(ctx: CanvasRenderingContext2D, marker: Pos, radius: number) {
  const targetRadius = radius * 4
  ctx.beginPath();
  // draw circle
  ctx.arc((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y), targetRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = radius / 2;
  ctx.stroke()
  ctx.closePath();

  // draw white lines diagonals
  ctx.beginPath();
  let start: Pos = posCircle(marker, 45, targetRadius, shiftCanvas.value);
  let end: Pos = posCircle(marker, 45, targetRadius * SPACE_TARGET, shiftCanvas.value);
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
  ctx.lineWidth = radius / 3;

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
  ctx.lineWidth = radius / 3;
  ctx.stroke()
  ctx.closePath()
}

function drawMarker(ctx: CanvasRenderingContext2D, landmark: Landmark, radius: number) {
  let marker = landmark.getPoses().get(cameraStore.selectedImage.name)
  let color = "black"
  if (marker == undefined) {
    marker = cameraStore.selectedImage.reprojections.get(landmark.id)
    color = "white"
    if (marker == undefined) {
      // if no projections and reprojections
      return
    }
  }
  let ratio = getRatio()
  if (landmark.getPoses().has(cameraStore.selectedImage.name)) {

  }
  marker = {
    x: marker.x * ratio.width,
    y: marker.y * ratio.height
  }
  ctx.beginPath()
  ctx.arc((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y), radius, 0, 2 * Math.PI);
  ctx.fillStyle = landmark.getColorHEX()
  ctx.fill();
  ctx.lineWidth = radius / 2;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath()
}

function posCircle(center: Pos, angle: number, radius: number, translate: Pos = { x: 0, y: 0 }): Pos {
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

    const svgRect = canvas.value!.getBoundingClientRect();

    let topLeft = getPos({ x: svgRect.left, y: svgRect.top })
    topLeft = {
      x: Math.max(0, topLeft.x),
      y: Math.max(0, topLeft.y)
    }
    
    
    let shift = {
      x: Math.max(0, (canvas.value.width - imageStore.size.width * imageStore.zoom))/ imageStore.zoom,
      y: Math.max(0, (canvas.value.height - imageStore.size.height * imageStore.zoom))/ imageStore.zoom
    }
    
    imageStore.zoomRect = {
      top: topLeft.y,
      left: topLeft.x,
      width: canvas.value.width / imageStore.zoom - shift.x,
      height: canvas.value.height / imageStore.zoom - shift.y,
    }
  }
}

function screenFit() {
  if (imageContainer.value && canvas.value) {
    canvas.value.width = Math.floor(imageContainer.value.clientWidth)
    canvas.value.height = Math.floor(imageContainer.value.clientHeight)

    screenZoom.value = Math.min(imageContainer.value.clientWidth / imageStore.size.width, imageContainer.value.clientHeight / imageStore.size.height)
    imageStore.zoom = screenZoom.value
    imageStore.offset = {x:0, y:0}
  }
}

function getPos(pos: Pos): Pos {
  let ratio = getRatio()
  const svgRect = canvas.value!.getBoundingClientRect();
  let x = ((pos.x - svgRect.left) / imageStore.zoom) - imageStore.offset.x - (shiftCanvas.value.x / ratio.width)
  let y = ((pos.y - svgRect.top) / imageStore.zoom) - imageStore.offset.y - (shiftCanvas.value.y / ratio.height)
  return { x: x, y: y }
}

function updateOffset(movementX: number, movementY: number) {
  if (canvas.value) {
    imageStore.offset.x = imageStore.offset.x + movementX / imageStore.zoom
    imageStore.offset.y = imageStore.offset.y + movementY / imageStore.zoom

    //check value
    imageStore.offset.x = Math.min(0, Math.max(-((imageStore.size.width * imageStore.zoom) - canvas.value.width) / imageStore.zoom, imageStore.offset.x))
    imageStore.offset.y = Math.min(0, Math.max(-((imageStore.size.height * imageStore.zoom) - canvas.value.height) / imageStore.zoom, imageStore.offset.y))
  }
}

function updateZoom(zoomDelta: number) {

  imageStore.zoom = +(imageStore.zoom * (1 + zoomDelta / 20)).toFixed(2)

  //check value
  imageStore.zoom = Math.max(ZOOM_MIN*screenZoom.value, Math.min(ZOOM_MAX, imageStore.zoom))
}


function zoomWithWheel(event: WheelEvent) {
  let oldZoom = imageStore.zoom
  updateZoom(Math.sign(-event.deltaY))
  let deltaZoom = imageStore.zoom / oldZoom

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
    let pos = getPos({
      x: event.pageX,
      y: event.pageY
    })
    landmarksStore.landmarks.forEach((landmark, index) => {
      let marker = landmark.getPoses().get(cameraStore.selectedImage.name) || cameraStore.selectedImage.reprojections.get(landmark.id)
      if (!marker) {
        //if undefined
        return
      }
      if (pointInsideCircle(pos, marker, DOT_RADIUS / imageStore.zoom)) {
        landmarkDragged.value = landmark
      }
    })
  }
}


function mousemove(event: MouseEvent) {
  if (dragging.value == true) {
    if (landmarkDragged.value == null) {
      // no marker to drag => pan image
      updateOffset(event.movementX, event.movementY)
    }
    else {
      // drag marker
      draggedPos.value = getPos({
        x: event.pageX,
        y: event.pageY
      })
    }

    update()
  }
}

function stopDrag(event: MouseEvent) {
  if (!contextMenuOpen.value) {
    dragging.value = false
    if (landmarkDragged.value != null) {
      //update pos of landmark

      let pos = getPos({
        x: event.pageX,
        y: event.pageY
      })

      pos = {
        x: Math.max(0, Math.min(imageStore.size.width, pos.x)),
        y: Math.max(0, Math.min(imageStore.size.height, pos.y))
      }
      landmarkDragged.value.addPose(cameraStore.selectedImage.name, pos)

      //triangulate landmark
      landmarkDragged.value.triangulatePosition(cameraStore.objectPath)

      // reinit landmarkDrag
      reinitDraggedLandmark()

    }
    update()
  }
}

function reinitDraggedLandmark() {
  landmarkDragged.value = null
  draggedPos.value = { x: -1, y: -1 }
}

function printPos(pos: Pos) {
  console.log("Position = ", pos.x, " : ", pos.y)
}

function pointInsideCircle(pointCoord: Pos, circleCoord: Pos, radius: number) {
  const distance =
    Math.sqrt((pointCoord.x - circleCoord.x) ** 2 + (pointCoord.y - circleCoord.y) ** 2);
  return distance < radius;
}

function onImage(pos: Pos): boolean {
  let ratio = getRatio()
  if (base_image.value) {
    return pos.x >= 0 && pos.y >= 0 && pos.x <= base_image.value.naturalWidth / ratio.width && pos.y <= base_image.value.naturalHeight / ratio.height
  }
  return false
}

function openContextMenu(event: MouseEvent) {
  contextMenuOpen.value = true
  posContextMenu.value = getPos({
    x: event.pageX,
    y: event.pageY
  })
  if (!onImage(posContextMenu.value)) {
    // Don't show context menu if image not clicked
    event.preventDefault()
    return;
  }
  let pos = getPos({
    x: event.pageX,
    y: event.pageY
  })
  landmarksStore.landmarks.forEach((landmark, index) => {
    let marker = landmark.getPoses().get(cameraStore.selectedImage.name)
    if (!marker) {
      //if undefined
      return
    }
    if (pointInsideCircle(pos, marker, DOT_RADIUS / imageStore.zoom)) {
      landmarkDragged.value = landmark
    }
  })

}

function closeContextMenu() {
  contextMenuOpen.value = false
  reinitDraggedLandmark()
  update()
}

function clickContext(landmark: Landmark) {
  landmark.addPose(cameraStore.selectedImage.name, { x: posContextMenu.value.x, y: posContextMenu.value.y })
  //triangulate landmark
  landmark.triangulatePosition(cameraStore.objectPath)
  update()
  // reinit landmarkDrag
  reinitDraggedLandmark()
}

function addLandmark() {
  let id = landmarksStore.generateID()
  let landmark = new Landmark(id, id)
  landmarksStore.addLandmark(landmark);
  landmark.addPose(cameraStore.selectedImage.name, { x: posContextMenu.value.x, y: posContextMenu.value.y })
  update()
}

function deleteLandmark(landmark: Landmark) {
  landmark.removePose(cameraStore.selectedImage.name)
  landmark.triangulatePosition(cameraStore.objectPath).then(() => {
    computeReprojection(cameraStore.selectedImage, landmark)
  })
}
</script>

<template>
  <div ref="imageContainer"
    :class="cn('relative border w-full h-full flex justify-center items-center overflow-visible', props.class)"
    @wheel.prevent>
    <ContextMenu>
      <ContextMenuTrigger class="flex w-full h-full">
        <canvas ref="canvas" :class="{ 'cursor-none': landmarkDragged, 'cursor-pointer': !landmarkDragged }"
          @mousedown="startDrag" @mouseup="stopDrag" @mousemove="mousemove" @mouseout="stopDrag" @wheel="zoomWithWheel"
          @contextmenu="openContextMenu">
        </canvas>
      </ContextMenuTrigger>
      <ContextMenuContent class="w-64" @closeAutoFocus="closeContextMenu">
        <ContextMenuLabel>
          Place landmark
        </ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem v-for="landmark in landmarksStore.landmarks" class="block" inset
          @select="clickContext(landmark as Landmark)">
          <div class="flex space-x-2 items-center">
            <svg class="h-4 w-4" viewBox="0 0 8 8" stroke="currentColor" stroke-width="1" :fill="landmark.getColorHEX()"
              xmlns="http://www.w3.org/2000/svg">
              <circle cx="4" cy="4" r="3" />
            </svg>
            <div class="flex item-centers">{{ landmark.getLabel() }}</div>
          </div>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem class="block" inset @select="addLandmark">
          Add Landmark
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem v-if="landmarkDragged != null" @select="deleteLandmark(landmarkDragged)">
          <div class="flex space-x-4 items-center">
            <span class="inline-block align-middle font-bold">Delete :</span>
            <div class="flex space-x-2 inline-block items-center">
              <svg class="h-4 w-4" viewBox="0 0 8 8" stroke="currentColor" stroke-width="1"
                :fill="landmarkDragged.getColorHEX()" xmlns="http://www.w3.org/2000/svg">
                <circle cx="4" cy="4" r="3" />
              </svg>
              <span class="inline-flex items-center align-middle">{{ landmarkDragged.getLabel() }}</span>
            </div>
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    <!--<img ref="base_image" class="hidden" :src="props.modelValue.image" alt="Image of view" aspect-ratio="auto"
      @load="loaded">-->
  </div>

</template>

<style scoped>
.object-fit {
  display: flex;
  object-fit: contain;
  max-width: none;
}
</style>
