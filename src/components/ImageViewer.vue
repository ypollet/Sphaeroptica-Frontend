<script setup lang="ts">
import { ref, onMounted,  type HTMLAttributes, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { LandmarkImage } from '@/lib/types'
import * as math from 'mathjs'


const options = {
	FIT : "screen fit",
	WIDTH: "screen width",
	HEIGHT: "screen height",
	MANUAL: "manual"
}

const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const image = ref<HTMLImageElement | null>(null)

const zoom = ref<number>(0)

const zoomOptions = ref<string>(options.FIT)

watch(image, () => {
  console.log(image.value)
  console.log(image.value?.clientHeight)
  checkClass()
})

onMounted(() => {
  const resizeObserver = new ResizeObserver(function() {
    console.log("observer")
    checkClass()
  });
  if(imageContainer.value){
    resizeObserver.observe(imageContainer.value);
    console.log("container")
    checkClass()
  }
})
const viewerClass = ref("w-full")


function checkClass(){
  if(imageContainer.value && image.value){
    if(zoomOptions.value == options.MANUAL){
      let width = Math.round(image.value.naturalWidth * zoom.value / 100)
      console.log(width)
      viewerClass.value = "w-["+width+"px]"
      return;
    }
    if(zoomOptions.value == options.FIT){
      console.log("hello")
      let focusHeight = (imageContainer.value.clientWidth/imageContainer.value.clientHeight) > (image.value.naturalWidth/image.value.naturalHeight)
      viewerClass.value = focusHeight ? 'h-full' : 'w-full'
      viewerClass.value += " object-fit"
      zoom.value = focusHeight ? Math.round(imageContainer.value.clientHeight / image.value.naturalHeight *100) : Math.round(imageContainer.value.clientWidth / image.value.naturalWidth *100)
      return;
    }
    if(zoomOptions.value == options.WIDTH){
      viewerClass.value = 'w-full'
      zoom.value = Math.round(imageContainer.value.clientWidth / image.value.naturalWidth *100)
      return;
    }
    if(zoomOptions.value == options.HEIGHT){
      viewerClass.value = 'h-full'
      zoom.value = Math.round(imageContainer.value.clientHeight / image.value.naturalHeight *100)
      return;
    }
  }
  
}

function onZoom(event : WheelEvent){
  zoom.value = Math.max(1, zoom.value-event.deltaY/math.abs(event.deltaY))
  console.log(zoom.value)
  zoomOptions.value = options.MANUAL
  checkClass()
}

</script>

<template>
  <div ref="imageContainer" :class="cn('relative w-full h-full border flex justify-center items-center overflow-auto', props.class)">
    <img ref="image" class="object-fit":src="props.modelValue.image" :alt="props.modelValue.name" aspect-ratio="auto" :width="image ? Math.round(image!.naturalWidth * zoom / 100) : 1000" draggable="false" @wheel="onZoom"/>
    <div class="absolute left-0 top-0 opacity-20 hover:opacity-100">zoom : {{ zoom }}%</div>
  </div>
</template>

<style scoped>
.object-fit {
  display:block;
}
</style>
