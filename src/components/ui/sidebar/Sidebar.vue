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
import { LandmarkList } from "@/components/ui/landmark";
import { DistanceList } from "@/components/ui/distance";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
} from '@/components/ui/context-menu'

import { useVirtualCameraStore, useLandmarksStore, useImageStore} from "@/lib/stores";
import { Landmark } from "@/data/models/landmark";
import CameraViewer from "@/components/ui/camera-viewer/CameraViewer.vue";

import { Scale } from "@/lib/lib";
import { round } from "mathjs"

import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"
import type { Coordinates } from "@/data/models/coordinates";

const repository = RepositoryFactory.get(repositorySettings.type)

const landmarksStore = useLandmarksStore()
const imageStore = useImageStore()
const cameraStore = useVirtualCameraStore();

var mapShortcuts: Map<string, Coordinates> = new Map();

function getShortcuts() {
  repository.getShorcuts(cameraStore.objectPath).then((shortcuts) => {
      shortcuts.forEach((item) => {
        mapShortcuts.set(item.name, item.coordinates);
      });
      console.log("Map shortcuts")
      console.log(mapShortcuts)
    })
    .catch((error) => {
      console.error(error);
    }); 
}


function shortcut(event: Event) {
  let target = event.currentTarget as HTMLButtonElement;
  let valKey = (target != null) ? target.attributes.getNamedItem("data-key")?.value : undefined
  console.log(valKey)
  if (
    valKey == undefined
  ) {
    return;
  }
  let newPos: Coordinates | undefined = mapShortcuts.get(valKey)!
  console.log(newPos)
  if (newPos != undefined) {
    // Don't forget to copy the object
    cameraStore.coordinates = {
      longitude : newPos.longitude,
      latitude : newPos.latitude
    };
  }
}

function addDistance(){
  let id_left = landmarksStore.selectedGroup.deque[0]
  let id_right = landmarksStore.selectedGroup.deque[1]
  let left : Landmark = landmarksStore.landmarks.find((x) => x.id == id_left) as Landmark
  let right : Landmark = landmarksStore.landmarks.find((x) => x.id == id_right) as Landmark
  landmarksStore.addDistance(left, right)
}

function resetScale(){
  landmarksStore.adjustFactor = 1
}
function reset(){
  cameraStore.setPath(cameraStore.objectPath)
  imageStore.$reset()
}

getShortcuts();
</script>

<template>
  <div class="pb-[12px] w-full flex-col">
    <!--<Button class="w-full" @click="reset">Reset</Button>-->
    <h2 class="mb-2 px-4 text-center font-semibold tracking-tight">
      Camera Viewer ({{ round(cameraStore.coordinates.longitude) }}, {{ round(cameraStore.coordinates.latitude)}}) : {{ round(imageStore.zoom * 100) }}%
    </h2>
    <CameraViewer />
    <div class="space-y-4 py-4">
      <div class="px-3 py-2">
        <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">
          Shortcuts
        </h2>
        <div class="grid grid-cols-4">
          <div class="grid grid-cols-subgrid col-span-4">
            <div class="col-start-2">
              <Button @click="shortcut" variant="secondary" class="w-full justify-center" data-key="SUPERIOR">
                TOP
              </Button>
            </div>
          </div>
          <Button @click="shortcut" variant="secondary" class="w-full justify-center" data-key="LEFT">
            LEFT
          </Button>
          <Button @click="shortcut" variant="secondary" class="w-full justify-center" data-key="FRONT">
            FRONT
          </Button>
          <Button @click="shortcut" variant="secondary" class="w-full justify-center" data-key="RIGHT">
            RIGHT
          </Button>
          <Button @click="shortcut" variant="secondary" class="w-full justify-center" data-key="POST">
            BACK
          </Button>
          <div class="grid grid-cols-subgrid col-span-4">
            <div class="col-start-2">
              <Button @click="shortcut" variant="secondary" class="w-full justify-center" data-key="INFERIOR">
                BOT
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div class="px-3 py-2">
        <h2 class="relative px-7 text-lg font-semibold tracking-tight">
          Landmarks
        </h2>
          <ContextMenu>
            <ContextMenuTrigger class="flex w-full h-full">
              <LandmarkList/>
            </ContextMenuTrigger>
            <ContextMenuContent class="w-64">
              <ContextMenuItem class="block" inset @select="addDistance">
                Create Distance
              </ContextMenuItem>
          </ContextMenuContent>
          </ContextMenu>
      </div>
      <div class="px-3 py-2">
        <div class="flex row">
          <h2 class="relative px-7 text-lg font-semibold tracking-tight">
            Distances
          </h2>
          <div class="w-full h-full flex justify-end space-x-2">
            <Select v-model="landmarksStore.scale">
              <SelectTrigger class="w-16">
                <SelectValue placeholder="Pick a scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Scale</SelectLabel>
                  <SelectItem v-for="scale in Object.keys(Scale).filter((v) => isNaN(Number(v)))" :value="scale">
                    {{ scale }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="secondary" @click="resetScale">
              Reset Scale
            </Button>
          </div>
        </div>
        <DistanceList/>
      </div>
    </div>
  </div>
</template>

<style>
.scroll-align {
  scroll-snap-align: start;
  scroll-behavior: auto;
}

.scroll-snap-type {
  scroll-snap-type: y mandatory;
}
</style>
