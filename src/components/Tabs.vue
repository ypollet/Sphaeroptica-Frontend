<script setup lang="ts">
import Viewer from "@/components/Viewer.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Button from "./ui/button/Button.vue";
import { X } from "lucide-vue-next";

let images = ["hello", "zebi", "bonjour", "rhoooo"]
</script>
<template>
    <Tabs default-value="viewer" class="w-full h-full">
    <TabsList class="tabs space-x-2">
      <TabsTrigger value="viewer">
        Virtual Camera
      </TabsTrigger>
      <TabsTrigger v-for="image in images" :value="image" class="flex justify-center items-end">
        {{  image }}
        <Button variant="ghost" class="h-4 w-4 p-0 ml-2"><X /></Button>
      </TabsTrigger>
    </TabsList>
    <TabsContent value="viewer" class="image m-0">
        <div class=" h-full w-full flex items-center justify-center">
            <Viewer/>
        </div>
    </TabsContent>
    <TabsContent v-for="image in images" :value="image"  class="image">
      Change your image here.  {{  image }}
    </TabsContent>
  </Tabs>
    
</template>

<style scoped>
.tabs {
  height: 60px;
}

.image {
height: calc(100% - 60px);
}
</style>