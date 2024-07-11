<script setup lang="ts">
import { useLandmarksStore } from "@/lib/stores";
const landmarksStore = useLandmarksStore()
</script>

<template>
    <div class="flex min-h-48 max-w-full flex flex-col">
        <div v-for="distance in landmarksStore.distances" class="w-full h-full border">
            <span>{{ distance.label }} : {{ distance.distance || '' }}</span>
        </div>
    </div>
</template>