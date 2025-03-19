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
import { useLandmarksStore } from "@/lib/stores";

import { Distance } from "@/data/models/distance";

import { Separator } from '@/components/ui/separator'
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button";

import { X } from "lucide-vue-next";

import * as math from "mathjs"
import { Scale } from "@/lib/utils";

const STEP = 0.01
const ROUND = 5
const landmarksStore = useLandmarksStore()

function changeLabel(payload: string | number, distance: Distance) {
  distance.label = payload.toString() 
}

function changeScale(payload: string | number, distance: Distance) {
  landmarksStore.adjustFactor = math.number(payload)/distance.distance!* math.number(Scale[landmarksStore.scale as keyof typeof Scale])
}
</script>

<template>
    <div class="flex min-h-48 max-w-full flex flex-col border">
        <div v-for="(distance, index) in landmarksStore.distances" class="flex flex-col w-full h-10">
            <div class="flex row items-center justify-start space-x-3 px-3 w-full h-full">
                <Label v-show="!distance.edit_label" class="flex whitespace-nowrap w-36"
                    @dblclick="distance.edit_label = true">{{ distance.label }}</Label>
                <Input v-show="distance.edit_label" type="text" :model-value="distance.label"
                    class="flex h-auto w-36 px-0" @focusout="distance.edit_label= false" @keyup.enter="distance.edit_label= false"
                    @update:model-value="changeLabel($event, distance)" />
                <span>:</span>
                <Label v-show="!distance.edit_distance" class="flex whitespace-nowrap w-36"
                    @dblclick="distance.edit_distance = true">{{ math.round(((distance.distance) ? distance.distance * landmarksStore.adjustFactor / math.number(Scale[landmarksStore.scale as keyof typeof Scale]) : 0), 5) }} {{ landmarksStore.scale }}</Label>
                <Input v-show="distance.edit_distance" type="number" :min="0" :step="STEP" :model-value="(distance.distance) ? distance.distance * landmarksStore.adjustFactor / math.number(Scale[landmarksStore.scale as keyof typeof Scale]) : 0"
                    class="flex h-auto w-36 px-0" @focusout="distance.edit_distance= false" @keyup.enter="distance.edit_distance= false"
                    @update:model-value="changeScale($event, distance)" />
                <Button class="relative w-6 h-6 p-0" variant="destructive" @click="landmarksStore.distances.splice(index, 1)">
                <X class="relative w-4 h-4 p-0" />
              </Button>
            </div>
            <Separator class="w-full"/>
        </div>
    </div>
</template>