<script setup lang="ts">
import { ref, onMounted,  type HTMLAttributes, watch } from 'vue'
import { cn } from '@/lib/utils'
import type { LandmarkImage } from '@/lib/types'

const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const imageContainer = ref<HTMLDivElement | null>(null)
const image = ref<HTMLImageElement | null>(null)

watch(image, () => {
  console.log("image")
  console.log(image.value)
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
    console.log(imageContainer.value)
    checkClass()
  }
})
const viewerClass = ref("w-full")


function checkClass(){
  if(imageContainer.value && image.value){
    console.log(imageContainer.value == null)
    console.log(image.value == null)
    console.log("div = " + imageContainer.value.clientWidth + "; " + imageContainer.value.clientHeight)
    console.log("img = " + image.value.naturalWidth + "; " + image.value.naturalHeight)
    console.log(image.value)
    viewerClass.value = (imageContainer.value.clientWidth/imageContainer.value.clientHeight) > (image.value.naturalWidth/image.value.naturalHeight) ? 'h-full' : 'w-full'
  }
}

</script>

<template>
  <div ref="imageContainer" :class="cn('w-full h-full border flex justify-center items-center overflow-scroll', props.class)">
    <img ref="image" :class="cn('object-fit', viewerClass)"
      :src="modelValue.image" alt="album.name" aspect-ratio="auto" draggable="false">
  </div>
</template>

<style scoped>
.object-fit {
  object-fit: contain;
  display:block;
}

.object-fit:hover{
  transition : transform 1s;
  transform : scale(2);
}
</style>
