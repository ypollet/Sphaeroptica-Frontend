<script setup lang="ts">
import { ref, onMounted, nextTick, type HTMLAttributes, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { LandmarkImage } from '@/lib/types'
import * as math from 'mathjs'

const ZOOM_MIN = 1
const ZOOM_MAX = 400
const options = {
  FIT: "screen fit",
  WIDTH: "screen width",
  HEIGHT: "screen height",
  MANUAL: "manual"
}


const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const contentWrapper = ref<HTMLDivElement | null>(null)
const image = ref<HTMLImageElement | null>(null)

const zoom = ref<number>(ZOOM_MIN)
const zoomOptions = ref<string>(options.FIT)

const imageClass = ref<string>("justify-center items-center")

onMounted(() => {
  console.log("REFRESH")
  const resizeObserver = new ResizeObserver(function () {
    update()
  });
  if (imageContainer.value) {
    resizeObserver.observe(imageContainer.value);
    update()
  }

})

watch(zoom, () => {
  update()
})


function update() {
  if (imageContainer.value && image.value && contentWrapper.value) {
    switch (zoomOptions.value) {
      case options.MANUAL:
        break;
      case options.FIT:
        let focusHeight = (imageContainer.value.clientWidth / imageContainer.value.clientHeight) > (image.value.naturalWidth / image.value.naturalHeight)
        zoom.value = focusHeight ? Math.round(imageContainer.value.clientHeight / image.value.naturalHeight * 100) : Math.round(imageContainer.value.clientWidth / image.value.naturalWidth * 100)
        break;
      case options.WIDTH:
        zoom.value = Math.round(imageContainer.value.clientWidth / image.value.naturalWidth * 100)
        break;
      case options.HEIGHT:
        zoom.value = Math.round(imageContainer.value.clientHeight / image.value.naturalHeight * 100)
        break;
    }
    contentWrapper.value.style.width = (image.value.naturalWidth*(zoom.value/100)) + 'px'
    contentWrapper.value.style.height = (image.value.naturalHeight*(zoom.value/100)) + 'px'
    //console.log('(' + imageContainer.value.scrollWidth + ', ' + imageContainer.value.scrollHeight + "); (" + image.value.clientWidth + ', ' + image.value.clientHeight + "); (" + imageContainer.value.clientWidth + ', ' + imageContainer.value.clientHeight + ")")
    
    let classImage : string = ""
    if(image.value.clientWidth < imageContainer.value.clientWidth){
      classImage += "justify-center "
    }
    if(image.value.clientHeight < imageContainer.value.clientHeight){
      classImage += "items-center "
    }
    imageClass.value = classImage
  }


}

function onZoom(event: WheelEvent) {
  console.log(event.offsetX + "; " + event.offsetY)
  zoom.value = Math.min(Math.max(ZOOM_MIN, zoom.value - event.deltaY / math.abs(event.deltaY)), ZOOM_MAX)
  zoomOptions.value = options.MANUAL
}

</script>

<template>
  <div ref="imageContainer" :class="cn('relative border w-full h-full flex overflow-auto', props.class, imageClass)" @wheel.prevent>
    <div ref="contentWrapper" class="flex">
      <img ref="image" class="object-fit origin-top-left" :src="props.modelValue.image"
        :alt="props.modelValue.name" aspect-ratio="auto" draggable="false" @wheel="onZoom" />
      <div class="absolute top-0 left-0 opacity-20 w-auto h-auto hover:opacity-100">zoom : {{ zoom }}%</div>
    </div>
  </div>

</template>

<style scoped>
.object-fit {
  display: flex;
  object-fit: cover;
  max-width: none;
  height: auto;
}

.red {
  background-color: red;
}
</style>
