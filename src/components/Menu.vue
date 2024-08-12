<script setup lang="ts">
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'

import { Switch } from '@/components/ui/switch'

import { Landmark } from '@/data/models/landmark'

import { useToggle, useDark } from '@vueuse/core'
import { useSettingsStore, useLandmarksStore, useVCImagesStore } from '@/lib/stores'
import saveAs from 'file-saver';
import * as math from 'mathjs'

const settingsStore = useSettingsStore()
const landmarksStore = useLandmarksStore()
const imageStore = useVCImagesStore()

const isDark = useDark({
  storageKey: 'localStorage'
})

const toggleDark = useToggle(isDark)


function downloadCsv(){
  const rows = [
    ["Label", "Color", "X", "Y", "Z", "X_adjused", "Y_adjusted", "Z_adjusted"]
  ];

  landmarksStore.landmarks.filter((landmark) => landmark.position != undefined).forEach((landmark) => {
    landmark = landmark as Landmark
    let ajdusted_pos : Array<number> = landmark.position!.map((input) => input * landmarksStore.adjustFactor)
    let row : Array<string> = [landmark.label, landmark.getColorHEX(), landmark.position![0].toString(), landmark.position![1].toString(), landmark.position![2].toString(), ajdusted_pos[0].toString(), ajdusted_pos[1].toString(), ajdusted_pos[2].toString()]
    rows.push(row)
  })

  let csvContent = rows.map(e => e.join(";")).join("\n");

  let blob : Blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, "landmarks_" + imageStore.objectPath + ".csv")
}

function downloadJSON(){
  const data : Map<string, any> = new Map()

  data.set('scale_factor', landmarksStore.adjustFactor)
  data.set('landmarks', new Map<string, Object>())

  landmarksStore.landmarks.forEach((landmark) => {
    data.get("landmarks")!.set(landmark.label,  {
      "color": landmark.getColorHEX(), 
      "position": landmark.position,
      "poses": Object.fromEntries(landmark.poses)
    })
  })
  data.set('landmarks', Object.fromEntries(data.get('landmarks')!.entries()))

  var blob = new Blob([JSON.stringify(Object.fromEntries(data.entries()))], {type: "application/json;charset=utf-8"});
  saveAs(blob, "landmarks_" + imageStore.objectPath + ".json");
}


</script>

<template>
  <Menubar class="rounded border-b z-100 h-10">

    <MenubarMenu>
      <MenubarTrigger class="relative">
        File
      </MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Import Landmarks</MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Export Landmarks</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem @select="downloadCsv">
              CSV
            </MenubarItem>
            <MenubarItem @select="downloadJSON">
              JSON
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub> 
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem disabled>
          Undo <MenubarShortcut>⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled>
          Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>
        Settings
      </MenubarTrigger>
      <MenubarContent>
        <MenubarLabel inset>
          <div class="flex flex-row justify-between h-full w-full"><span>Dark Mode :</span><Switch :checked="isDark" @update:checked="toggleDark" class="inline-block align-middle ml-auto"></Switch>  </div>
        </MenubarLabel>
        <MenubarLabel inset>
          <div class="flex flex-row justify-between h-full w-full"><span>Reverse Mode :</span><Switch :checked="settingsStore.isLeft" @update:checked="settingsStore.useToggleLeft" class="inline-block align-middle self-end"></Switch>  </div>
        </MenubarLabel>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>