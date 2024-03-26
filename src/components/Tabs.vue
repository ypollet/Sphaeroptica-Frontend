<script setup lang="ts">
import Viewer from "@/components/Viewer.vue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>
<template>
    <Tabs default-value="viewer" class="w-full h-full">
    <TabsList class="tabs">
      <TabsTrigger value="viewer">
        Account
      </TabsTrigger>
      <TabsTrigger value="password">
        Password
      </TabsTrigger>
    </TabsList>
    <TabsContent value="viewer" class="image">
        <div class=" h-full w-full flex items-center justify-center">
            <Viewer/>
        </div>
    </TabsContent>
    <TabsContent value="password"  class="image">
      Change your password here.
    </TabsContent>
  </Tabs>
    
</template>

<style scoped>
.tabs {
  height: 60px;
}

.image {
height: calc(100% - 60px);;
}
</style>