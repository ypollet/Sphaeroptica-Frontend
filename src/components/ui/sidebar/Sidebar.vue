<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'
import draggable from "vuedraggable"

import scrollIntoView from 'scroll-into-view-if-needed'

import axios from "axios";
import { useCameraStore, useLandmarksStore } from "@/lib/stores";
import { Landmark } from "@/lib/types";
import { ref, nextTick } from "vue";

import { X } from "lucide-vue-next";

const landmarksStore = useLandmarksStore()

const landmarksElements = ref<InstanceType<typeof draggable> | null>(null)
const landmarksScroll = ref<HTMLElement | null>(null)


type Shortcut = {
  name: string;
  longitude: number;
  latitude: number;
};

const camera = useCameraStore();
var mapShortcuts: Map<string, Shortcut> = new Map();

function getShortcuts() {
  const path = "http://localhost:5000/shortcuts";
  axios
    .get(path)
    .then((res) => {
      let shortcuts = res.data.result.commands as Shortcut[];
      shortcuts.forEach((item) => {
        mapShortcuts.set(item.name, item);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}
const map: Map<string, string> = new Map();
map.set("top", "SUPERIOR");
map.set("bot", "INFERIOR");
map.set("left", "LEFT");
map.set("right", "RIGHT");
map.set("front", "FRONT");
map.set("back", "POST");

function shortcut(event: Event) {
  let target = event.currentTarget as HTMLButtonElement;
  if (
    target == null ||
    target.attributes.getNamedItem("data-key")?.value == undefined
  ) {
    return;
  }
  // TODO : It's ugly there's a triple Map !!
  let newPos: Shortcut | undefined = mapShortcuts.get(
    map.get(target.attributes.getNamedItem("data-key")?.value!)!
  );

  if (newPos != undefined) {
    camera.longitude = newPos.longitude;
    camera.latitude = newPos.latitude;
  }
}
function labelClicked(landmark: Landmark) {
  landmark.edit = true;
}
function changeLabel(event : KeyboardEvent, landmark: Landmark) {
  let target : HTMLInputElement = event.target as HTMLInputElement
  if (event.key === "Enter") {
    landmark.edit = false;
    landmark.label = target.value
  }
}

function clearLandmark() {
  landmarksStore.landmarks = new Array<Landmark>()
}

function addLandmark() {
  let id = landmarksStore.generateID()
  landmarksStore.addLandmark(
    new Landmark(id,
      id
    )
  );
  nextTick(() => {
    if (landmarksScroll.value && landmarksElements.value) {
      scrollIntoView(landmarksElements.value.$el.childNodes[landmarksElements.value.$el.childNodes.length - 1], { behavior: 'smooth', scrollMode: 'if-needed', block: 'end', inline: 'start',  boundary: landmarksScroll.value })

    }
  })
}

function changeColor(event: Event, id: string) {
  let target = event.currentTarget as HTMLButtonElement;
  if (target == null) {
    return;
  }
  landmarksStore.landmarks.find(x => x.id == id)!.setColorHEX(target.value)
}

function removeLandmark(id: string) {
  landmarksStore.landmarks = landmarksStore.landmarks.filter((el) => el.id != id)
}

getShortcuts();


</script>

<template>
  <div class="pb-[1000px] w-auto">
    <div class="space-y-4 py-4">
      <div class="px-3 py-2">
        <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">
          Shortcuts
        </h2>
        <div class="grid grid-cols-4">
          <div class="grid grid-cols-subgrid col-span-4">
            <div class="col-start-2">
              <Button @click="shortcut" variant="default" class="w-full justify-center" data-key="top">
                TOP
              </Button>
            </div>
          </div>
          <Button @click="shortcut" variant="default" class="w-full justify-center" data-key="left">
            LEFT
          </Button>
          <Button @click="shortcut" variant="default" class="w-full justify-center" data-key="front">
            FRONT
          </Button>
          <Button @click="shortcut" variant="default" class="w-full justify-center" data-key="right">
            RIGHT
          </Button>
          <Button @click="shortcut" variant="default" class="w-full justify-center" data-key="back">
            BACK
          </Button>
          <div class="grid grid-cols-subgrid col-span-4">
            <div class="col-start-2">
              <Button @click="shortcut" variant="default" class="w-full justify-center" data-key="bot">
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


        <div ref="landmarksScroll" class="overflow-auto max-h-96 max-w-full">
          <draggable ref="landmarksElements" v-model="landmarksStore.landmarks" group="landmarks" item-key="id"
             :force-fallback="true" :animation="150" :scroll="true"
            :bubbleScroll="false" :handle="'.handle'"
            class="relative scroll-snap-type w-fit min-w-full">
            <template #item="{ element: landmark }: { element: Landmark }">
              <div class="scroll-align border flex grow p-2">
                <div class="h-12 flex grow row justify-between items-center font-normal space-x-3 px-3 py-2">
                  <div class="flex items-center justify-start space-x-3 py-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"
                      class="mr-2 h-6 w-6 handle">
                      <path
                        d="M7.49985 0.877045C3.84216 0.877045 0.877014 3.84219 0.877014 7.49988C0.877014 11.1575 3.84216 14.1227 7.49985 14.1227C11.1575 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1575 0.877045 7.49985 0.877045ZM1.82701 7.49988C1.82701 4.36686 4.36683 1.82704 7.49985 1.82704C10.6328 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6328 13.1727 7.49985 13.1727C4.36683 13.1727 1.82701 10.6329 1.82701 7.49988ZM7.49999 9.49999C8.60456 9.49999 9.49999 8.60456 9.49999 7.49999C9.49999 6.39542 8.60456 5.49999 7.49999 5.49999C6.39542 5.49999 5.49999 6.39542 5.49999 7.49999C5.49999 8.60456 6.39542 9.49999 7.49999 9.49999Z"
                        fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>
                    </svg>
                    <input type="color"
                      class="h-8 w-8 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700"
                      id="hs-color-input" :value="landmark.color.hex()" title="Choose your color"
                      @change="changeColor($event, landmark.id)">
                    <Label v-show="!landmark.edit" @dblclick="labelClicked(landmark)">{{ landmark.label }}</Label>
                    <Input v-show="landmark.edit" type="text" :model-value="landmark.label" 
                    @keyup.enter="changeLabel($event, landmark)"/>
                  </div>
                  <Button class="relative w-16" variant="destructive" @click="removeLandmark(landmark.id)">
                    <X />
                  </Button>
                </div>
              </div>

            </template>
          </draggable>
        </div>
        <div class="flex flex-row">
            <Button variant="ghost" class="h-8 item-centers mt-3" @click="addLandmark">Add Landmark</Button>
            <Button variant="ghost" class="h-8 item-centers mt-3" @click="clearLandmark">Clear</Button>
        </div>


      </div>
    </div>
  </div>
</template>

<style>
.scroll-align {
  scroll-snap-align: start;
}

.scroll-snap-type {
  scroll-snap-type: y mandatory;
}
</style>
