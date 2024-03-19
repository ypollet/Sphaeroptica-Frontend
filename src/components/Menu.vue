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

import IconBars3 from '@/components/icons/IconBars3.vue'

import { useColorMode, useDark } from '@vueuse/core'
import { Icon } from '@iconify/vue'


const isDark = useDark()

isDark.value = false

//const mode = useColorMode()

import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'


</script>

<template>
  <Menubar class="rounded border-b z-100 h-10">
    <Button variant="ghost">
      <Icon icon="radix-icons:moon"
        class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Icon icon="radix-icons:sun"
        class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span class="sr-only">Toggle theme</span>
    </Button>
    <MenubarMenu>
      <MenubarTrigger class="relative">
        File
      </MenubarTrigger>
      <MenubarContent>
        <MenubarSub>
          <MenubarSubTrigger>New</MenubarSubTrigger>
          <MenubarSubContent class="w-[230px]">
            <MenubarItem>
              Playlist <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled>
              Playlist from Selection <MenubarShortcut>⇧⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Smart Playlist... <MenubarShortcut>⌥⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>Playlist Folder</MenubarItem>
            <MenubarItem disabled>
              Genius Playlist
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem>
          Open Stream URL... <MenubarShortcut>⌘U</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Close Window <MenubarShortcut>⌘W</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Library</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem>Update Cloud Library</MenubarItem>
            <MenubarItem>Update Genius</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Organize Library...</MenubarItem>
            <MenubarItem>Export Library...</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Import Playlist...</MenubarItem>
            <MenubarItem disabled>
              Export Playlist...
            </MenubarItem>
            <MenubarItem>Show Duplicate Items</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Get Album Artwork</MenubarItem>
            <MenubarItem disabled>
              Get Track Names
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem>
          Import... <MenubarShortcut>⌘O</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled>
          Burn Playlist to Disc...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem>
          Show in Finder <MenubarShortcut>⇧⌘R</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>Convert</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Page Setup...</MenubarItem>
        <MenubarItem disabled>
          Print... <MenubarShortcut>⌘P</MenubarShortcut>
        </MenubarItem>
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
        <MenubarSeparator />
        <MenubarItem disabled>
          Cut <MenubarShortcut>⌘X</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled>
          Copy <MenubarShortcut>⌘C</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled>
          Paste <MenubarShortcut>⌘V</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem>
          Select All <MenubarShortcut>⌘A</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled>
          Deselect All <MenubarShortcut>⇧⌘A</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem>
          Smart Dictation...
          <MenubarShortcut>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round"
              strokeLinejoin="round" strokeWidth="2" class="h-4 w-4" viewBox="0 0 24 24">
              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12" />
              <circle cx="17" cy="7" r="5" />
            </svg>
          </MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Emoji & Symbols
          <MenubarShortcut>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round"
              strokeLinejoin="round" strokeWidth="2" class="h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>View</MenubarTrigger>
      <MenubarContent>
        <MenubarCheckboxItem>Show Playing Next</MenubarCheckboxItem>
        <MenubarCheckboxItem checked>
          Show Lyrics
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarItem inset disabled>
          Show Status Bar
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem inset>
          Hide Sidebar
        </MenubarItem>
        <MenubarItem disabled inset>
          Enter Full Screen
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>
        Settings
      </MenubarTrigger>
      <MenubarContent>
        <Icon icon="radix-icons:moon"
          class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Icon icon="radix-icons:sun"
          class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span class="sr-only">Toggle theme</span>
        

        <MenubarSeparator />
        <MenubarLabel inset>
          Switch Account
        </MenubarLabel>
        <MenubarSeparator />
        <MenubarRadioGroup value="benoit">
          <MenubarRadioItem value="andy">
            Andy
          </MenubarRadioItem>
          <MenubarRadioItem value="benoit">
            Benoit
          </MenubarRadioItem>
          <MenubarRadioItem value="Luis">
            Luis
          </MenubarRadioItem>
        </MenubarRadioGroup>
        <MenubarSeparator />
        <MenubarItem inset>
          Manage Famliy...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem inset>
          Add Account...
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>