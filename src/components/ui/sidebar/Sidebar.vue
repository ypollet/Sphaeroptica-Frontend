<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ScrollAreaRoot,
  ScrollAreaCorner,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb
} from "radix-vue";
import axios from "axios";
import { useCameraStore } from "@/lib/stores";
import { Landmark } from "@/lib/types";

import { TargetIcon } from "lucide-vue-next";

var landmarks: Array<Landmark> = [];

for (let i: number = 0; i < 50; i++) {
  landmarks.push(
    new Landmark(
      "Front.zsgiaqhofpoazeofhiuezhgfuhzeofihzohfpozjefohzeofjopzenfozejfkzelfnozjfop." +
        i
    )
  );
}

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
      let shortcuts = res.data.result.commands as Array<Shortcut>;
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
function labelClicked(label : string) {
  console.log(label + " Clicked");
}

getShortcuts();
</script>

<template>
  <div class="pb-10 w-auto">
    <div class="space-y-4 py-4">
      <div class="px-3 py-2">
        <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">
          Shortcuts
        </h2>
        <div class="grid grid-cols-4">
          <div class="grid grid-cols-subgrid col-span-4">
            <div class="col-start-2">
              <Button
                @click="shortcut"
                variant="default"
                class="w-full justify-center"
                data-key="top"
              >
                TOP
              </Button>
            </div>
          </div>
          <Button
            @click="shortcut"
            variant="default"
            class="w-full justify-center"
            data-key="left"
          >
            LEFT
          </Button>
          <Button
            @click="shortcut"
            variant="default"
            class="w-full justify-center"
            data-key="front"
          >
            FRONT
          </Button>
          <Button
            @click="shortcut"
            variant="default"
            class="w-full justify-center"
            data-key="right"
          >
            RIGHT
          </Button>
          <Button
            @click="shortcut"
            variant="default"
            class="w-full justify-center"
            data-key="back"
          >
            BACK
          </Button>
          <div class="grid grid-cols-subgrid col-span-4">
            <div class="col-start-2">
              <Button
                @click="shortcut"
                variant="default"
                class="w-full justify-center"
                data-key="bot"
              >
                BOT
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div class="px-3 py-2">
        <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">Library</h2>
        <div class="space-y-1">
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="M21 15V6" />
              <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path d="M12 12H3" />
              <path d="M16 6H3" />
              <path d="M12 18H3" />
            </svg>
            Playlists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <circle cx="8" cy="18" r="4" />
              <path d="M12 18V2l7 4" />
            </svg>
            Songs
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Made for You
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
              <circle cx="17" cy="7" r="5" />
            </svg>
            Artists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="m16 6 4 14" />
              <path d="M12 6v14" />
              <path d="M8 8v12" />
              <path d="M4 4v16" />
            </svg>
            Albums
          </Button>
        </div>
        <div class="space-y-1">
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="M21 15V6" />
              <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path d="M12 12H3" />
              <path d="M16 6H3" />
              <path d="M12 18H3" />
            </svg>
            Playlists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <circle cx="8" cy="18" r="4" />
              <path d="M12 18V2l7 4" />
            </svg>
            Songs
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Made for You
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
              <circle cx="17" cy="7" r="5" />
            </svg>
            Artists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="mr-2 h-4 w-4"
            >
              <path d="m16 6 4 14" />
              <path d="M12 6v14" />
              <path d="M8 8v12" />
              <path d="M4 4v16" />
            </svg>
            Albums
          </Button>
        </div>
      </div>
      <div class="px-3 py-2">
        <h2 class="relative px-7 text-lg font-semibold tracking-tight">
          Landmarks
        </h2>
        <ScrollAreaRoot class="px-1">
          <ScrollAreaViewport class="max-h-[300px] max-w-fit p-2">
            <div
              v-for="(landmark, i) in landmarks"
              :key="`${landmark}-${i}`"
              variant="ghost"
              class="w-full flex row justify-start font-normal px-1 py-3"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
                class="mr-2 h-4 w-4"
              >
                <path
                  d="M7.49985 0.877045C3.84216 0.877045 0.877014 3.84219 0.877014 7.49988C0.877014 11.1575 3.84216 14.1227 7.49985 14.1227C11.1575 14.1227 14.1227 11.1575 14.1227 7.49988C14.1227 3.84219 11.1575 0.877045 7.49985 0.877045ZM1.82701 7.49988C1.82701 4.36686 4.36683 1.82704 7.49985 1.82704C10.6328 1.82704 13.1727 4.36686 13.1727 7.49988C13.1727 10.6329 10.6328 13.1727 7.49985 13.1727C4.36683 13.1727 1.82701 10.6329 1.82701 7.49988ZM7.49999 9.49999C8.60456 9.49999 9.49999 8.60456 9.49999 7.49999C9.49999 6.39542 8.60456 5.49999 7.49999 5.49999C6.39542 5.49999 5.49999 6.39542 5.49999 7.49999C5.49999 8.60456 6.39542 9.49999 7.49999 9.49999Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <Label @dblclick="labelClicked(landmark.label)">{{ landmark.label }}</Label>
            </div>
          </ScrollAreaViewport>
          <ScrollBar/>
          <ScrollBar orientation="horizontal"/>
          <ScrollAreaCorner />
        </ScrollAreaRoot>
      </div>
    </div>
  </div>
</template>
