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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import Color from "color"

import { Landmark } from '@/data/models/landmark'

import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { useToggle, useDark } from '@vueuse/core'
import { useSettingsStore, useLandmarksStore, useVirtualCameraStore } from '@/lib/stores'
import { repositorySettings } from "@/config/appSettings"
import saveAs from 'file-saver';

const settingsStore = useSettingsStore()
const landmarksStore = useLandmarksStore()
const cameraStore = useVirtualCameraStore()

const isDark = useDark({
  storageKey: 'localStorage'
})

const repository = RepositoryFactory.get(repositorySettings.type)

const toggleDark = useToggle(isDark)


function downloadCsv() {
  const rows = [
    ["Label", "Color", "X", "Y", "Z", "X_adjused", "Y_adjusted", "Z_adjusted"]
  ];

  landmarksStore.landmarks.filter((landmark) => landmark.position != undefined).forEach((landmark) => {
    landmark = landmark as Landmark
    let ajdusted_pos: Array<number> = landmark.position!.map((input) => input * landmarksStore.adjustFactor)
    let row: Array<string> = [landmark.label, landmark.getColorHEX(), landmark.position![0].toString(), landmark.position![1].toString(), landmark.position![2].toString(), ajdusted_pos[0].toString(), ajdusted_pos[1].toString(), ajdusted_pos[2].toString()]
    rows.push(row)
  })

  let csvContent = rows.map(e => e.join(";")).join("\n");

  let blob: Blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, "landmarks_" + cameraStore.objectPath + ".csv")
}

function downloadJSON() {
  const data: Map<string, any> = new Map()

  data.set('scale_factor', landmarksStore.adjustFactor)

  let mapLandmark = new Map<string, Object>()

  landmarksStore.landmarks.forEach((landmark) => {
    mapLandmark.set(landmark.id, {
      "label": landmark.label,
      "color": landmark.getColorHEX(),
      "position": landmark.position,
      "poses": Object.fromEntries(landmark.poses)
    })
  })
  data.set('landmarks', Object.fromEntries(mapLandmark))

  let arrayDistance = new Array<Object>()
  landmarksStore.distances.forEach((distance) => {
    arrayDistance.push({
      "label" : distance.label,
      "left" : distance.landmarkLeft.id,
      "right" : distance.landmarkRight.id
    })
  })
  data.set('distances', arrayDistance)

  var blob = new Blob([JSON.stringify(Object.fromEntries(data.entries()), null, 2)], { type: "application/json;charset=utf-8" });
  saveAs(blob, "landmarks_" + cameraStore.objectPath + "_" + new Date().getTime() + ".json");
}

async function openFile() {
  let projectFile = await repository.importNewFile()
  if(projectFile != ""){
    cameraStore.setPath(projectFile)
  }
}

function createFile() {
}


function onSubmit(event: Event) {
  event.preventDefault()
  let form = event.target as HTMLFormElement
  let inputFile = form.elements[0] as HTMLInputElement
  let file = inputFile.files![0] as Blob
  if (file) {
    file.text().then((text) => {
      importLandmarks(text)
    }).catch((reason) => {
      console.error(reason)
    })
  }
}
function importLandmarks(jsonData: string) {
  let jsonObject = JSON.parse(jsonData)
  let mapData: Map<string, any> = new Map(Object.entries(jsonObject));
  let oldIds = new Map<string, Landmark>()
  let mapLandmarks : Map<string, Object> = new Map(Object.entries(mapData.get("landmarks")))
  mapLandmarks.forEach((value: Object, key: string) => {
    let landmarkMap = new Map(Object.entries(value));
    let landmark = new Landmark(landmarksStore.generateID(), landmarkMap.get("label"), 1, Color(landmarkMap.get("color")), new Map(Object.entries(landmarkMap.get("poses"))), landmarkMap.get("position"))
    oldIds.set(key, landmark)
    landmarksStore.addLandmark(landmark)
  })

  if(mapData.get("distances")){
    mapData.get("distances").forEach((distanceObject : Object) => {
      let distanceMap = new Map(Object.entries(distanceObject));
      landmarksStore.addDistance(oldIds.get(distanceMap.get("left"))!, oldIds.get(distanceMap.get("right"))!, distanceMap.get("label"))
    })
  }
}


</script>

<template>
  <Dialog>
    <Menubar class="rounded border-b z-100 h-10">
      <MenubarMenu>
        <MenubarTrigger class="relative">
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarLabel v-if="repositorySettings.type == 'DESKTOP'">
            Files
          </MenubarLabel>
          <MenubarItem @select="openFile" inset v-if="repositorySettings.type == 'DESKTOP'">Open</MenubarItem>
          <MenubarItem @select="createFile" inset v-if="repositorySettings.type == 'DESKTOP'">New</MenubarItem>
          <MenubarSeparator v-if="repositorySettings.type == 'DESKTOP'"/>
          <MenubarLabel>
            Landmarks
          </MenubarLabel>
          <DialogTrigger asChild>
            <MenubarItem inset :disabled="cameraStore.objectPath == ''">Import</MenubarItem>
          </DialogTrigger>
          <MenubarSub :disabled="cameraStore.objectPath == ''">
            <MenubarSubTrigger inset :disabled="cameraStore.objectPath == ''">Export</MenubarSubTrigger>
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
            <div class="flex flex-row justify-between h-full w-full"><span>Dark Mode :</span>
              <Switch :checked="isDark" @update:checked="toggleDark" class="inline-block align-middle ml-auto"></Switch>
            </div>
          </MenubarLabel>
          <MenubarLabel inset>
            <div class="flex flex-row justify-between h-full w-full"><span>Reverse Mode :</span>
              <Switch :checked="settingsStore.isLeft" @update:checked="settingsStore.useToggleLeft"
                class="inline-block align-middle self-end"></Switch>
            </div>
          </MenubarLabel>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add the landmark file</DialogTitle>
        <DialogDescription>Add the json files containing the landmarks</DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit">
        <Label>File</Label>
        <Input type="file" placeholder="your landmark json file" />
        <DialogFooter>
          <DialogClose as-child>
            <Button type="submit">Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>