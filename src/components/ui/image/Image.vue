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
import  { LandmarkImage } from '@/data/models/landmark_image';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'vue';
import { ref } from 'vue';

const props = defineProps<{
  modelValue: LandmarkImage
  class?: HTMLAttributes['class']
}>()

const image = ref<HTMLImageElement | null>(null)


const emits = defineEmits<{
  (e: 'update:dimensions', dimensions: number[]): void
}>()
let val = 0
</script>

<template>
<img ref="image" :class="cn('object-fit', props.class)" :src="props.modelValue.image" :alt="props.modelValue.name" aspect-ratio="auto" draggable="false">
</template>

<style scoped>
.object-fit {
  object-fit: contain;
  display:block;
}
</style>