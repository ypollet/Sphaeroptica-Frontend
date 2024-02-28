<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ScrollArea } from './ui/scroll-area';

const width = 600
const height = 600
</script>
<template>
    <ScrollArea class="h-full w-full rounded-md border p-4 left-0">
        <div class="rounded-md">
            <img src="https://images.unsplash.com/photo-1468817814611-b7edf94b5d60?" alt="album.name" :width=width
                :height=height aspect-ratio="auto">
        </div>
    </ScrollArea></template>