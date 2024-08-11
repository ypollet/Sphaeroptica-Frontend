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

import { Button } from '@/components/ui/button'

import { MoonStar, Sun } from 'lucide-vue-next'

import { useToggle, useDark } from '@vueuse/core'
import { useSettingsStore } from '@/lib/stores'

const settingsStore = useSettingsStore()

const isDark = useDark({
  storageKey: 'localStorage'
})

const toggleDark = useToggle(isDark)

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
            <MenubarItem>
              CSV
            </MenubarItem>
            <MenubarItem>
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