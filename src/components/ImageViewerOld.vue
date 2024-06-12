<script setup lang="ts">
import { ref, onMounted, nextTick, type HTMLAttributes, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { LandmarkImage, MarkerInfo } from '@/lib/types'
import "leaflet/dist/leaflet.css"
import { type PointExpression, Point, CRS, Icon, type LeafletMouseEvent, LatLngBounds, LatLng, Marker } from 'leaflet'
import L from 'leaflet'
import { LMap, LImageOverlay, LPopup, LMarker, LIcon } from "@vue-leaflet/vue-leaflet"
import { useLandmarkImagesStore } from '@/lib/stores'

const landmarksImageStore = useLandmarkImagesStore()

const ZOOM_MIN = -4
const ZOOM_MAX = 4
const ZOOM_DELTA = 0.5

const markers = ref<MarkerInfo[]>([])

console.log("Before Bounds")

const bounds = ref<LatLngBounds>(new LatLngBounds([0, 0], [1000, 1000]))
const center = ref<PointExpression>([500, 500])


console.log("after Center")

var targetIcon = L.icon({
  iconUrl: 'src/assets/images/target-icon.svg',
  iconSize: [35, 35], // size of the icon
  iconAnchor: [18, 18], // point of the icon which will correspond to marker's location
  popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
});


const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const image = ref<typeof LImageOverlay | null>(null)
const map = ref<typeof LMap | null>(null)

const width = ref<number>(1000)
const height = ref<number>(1000)
const zoom = ref<number>(1)
const options = {
  zoomSnap: 0.25,
  zoomDelta: ZOOM_DELTA,
  wheelPxPerZoomLevel: 180
}

function setImage() {
  console.log("load image")
  if(image.value && imageContainer.value){
    console.log(image.value.leafletObject._image)
    let img = image.value.leafletObject._image
    bounds.value = new LatLngBounds([0, 0], [img.naturalHeight, img.naturalWidth])
    center.value = [img.naturalHeight/2, img.naturalWidth/3]
  }
}



function addMarker(event: LeafletMouseEvent) {
  if (map.value && bounds.value && bounds.value.contains(event.latlng) && image.value) {
    console.log(event.latlng)
    console.log([image.value.leafletObject._image.naturalHeight, image.value.leafletObject._image.naturalWidth])
    let marker: MarkerInfo = { label: "Hello", latlng: event.latlng, dragged: true }
    markers.value.push(marker)
  }
  event.originalEvent.preventDefault()
}

function removeMarker(index: number, event: LeafletMouseEvent) {
  markers.value.splice(index, 1)
}

console.log("End script")
</script>

<template>
  Leaflet
  <div ref="imageContainer" :class="cn('relative border w-full h-full overflow-auto', props.class)" @wheel.prevent>
    
    <l-map ref="map" :crs="CRS.Simple" v-model:zoom="zoom" v-model:center="center" :min-zoom="ZOOM_MIN"
      :max-zoom="ZOOM_MAX" :options="options" @contextMenu="addMarker">
      <l-image-overlay ref="image" :url="props.modelValue.image" :bounds="bounds" @load="setImage" />
      <l-marker v-for="(marker, index) in markers" v-model:lat-lng="marker.latlng"
        :name="marker.label" :draggable="true">
        
        <l-icon
          :icon-size="[35, 35]"
          :icon-anchor="[18, 18]"
          icon-url="/src/assets/images/target-icon.svg">
        </l-icon>
        <l-popup>{{ marker.label }}</l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<style scoped>
.object-fit {
  display: flex;
  object-fit: contain;
  max-width: none;
}
</style>
