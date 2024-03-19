<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import axios from 'axios';
import { useCameraStore } from '@/lib/stores';

var playlists = [
  'Recently Added',
  'Recently Played',
  'Top Songs',
  'Top Albums',
  'Top Artists',
  'Logic Discography',
  'Bedtime Beats',
  'Feeling Happy',
  'I miss Y2K Pop',
  'Runtober',
  'Mellow Days',
  'Eminem Essentials',
]

type Shortcut = {
  name: string,
  longitude: number,
  latitude: number
}

const camera = useCameraStore()
var mapShortcuts: Map<String, Shortcut> = new Map()

function getShortcuts() {
  const path = 'http://localhost:5000/shortcuts';
  axios.get(path)
    .then((res) => {
      let shortcuts = res.data.result.commands as Array<Shortcut>
      console.log(shortcuts)
      shortcuts.forEach((item) => {
        mapShortcuts.set(item.name, item)
      })
    })
    .catch((error) => {
      console.error(error);
    });
}
const map: Map<String, String> = new Map()
map.set("top", "SUPERIOR")
map.set("bot", "INFERIOR")
map.set("left", "LEFT")
map.set("right", "RIGHT")
map.set("front", "FRONT")
map.set("back", "POST")

function shortcut(event: Event) {
  if (event.currentTarget != null) {
    let target = event.currentTarget as HTMLButtonElement
    console.log("click : " + map.get(target.attributes.getNamedItem('data-key')?.value as String))
    let newPos : Shortcut | undefined = mapShortcuts.get(map.get(target.attributes.getNamedItem('data-key')?.value as String)!)

    console.log(newPos)
    if(newPos != undefined){
      camera.longitude = newPos.longitude
      camera.latitude = newPos.latitude
    }
  }

}

getShortcuts()

</script>

<template>
  <div class="pb-12">
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
        <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">
          Library
        </h2>
        <div class="space-y-1">
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <path d="M21 15V6" />
              <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path d="M12 12H3" />
              <path d="M16 6H3" />
              <path d="M12 18H3" />
            </svg>
            Playlists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <circle cx="8" cy="18" r="4" />
              <path d="M12 18V2l7 4" />
            </svg>
            Songs
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Made for You
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
              <circle cx="17" cy="7" r="5" />
            </svg>
            Artists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <path d="M21 15V6" />
              <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path d="M12 12H3" />
              <path d="M16 6H3" />
              <path d="M12 18H3" />
            </svg>
            Playlists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <circle cx="8" cy="18" r="4" />
              <path d="M12 18V2l7 4" />
            </svg>
            Songs
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Made for You
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
              <circle cx="17" cy="7" r="5" />
            </svg>
            Artists
          </Button>
          <Button variant="ghost" class="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
              <path d="m16 6 4 14" />
              <path d="M12 6v14" />
              <path d="M8 8v12" />
              <path d="M4 4v16" />
            </svg>
            Albums
          </Button>
        </div>
      </div>
      <div class="py-2">
        <h2 class="relative px-7 text-lg font-semibold tracking-tight">
          Playlists
        </h2>
        <ScrollArea class="h-[300px] px-1">
          <div class="space-y-1 p-2">
            <Button v-for="(playlist, i) in playlists" :key="`${playlist}-${i}`" variant="ghost"
              class="w-full justify-start font-normal">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="mr-2 h-4 w-4">
                <path d="M21 15V6" />
                <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                <path d="M12 12H3" />
                <path d="M16 6H3" />
                <path d="M12 18H3" />
              </svg>
              {{ playlist }}
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  </div>
</template>