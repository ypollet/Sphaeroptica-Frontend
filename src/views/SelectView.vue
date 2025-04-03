<!-- 
Sphaeroptica - 3D Viewer on calibrated images - Frontend

Copyright (C) 2024-2025 Yann Pollet, Royal Belgian Institute of Natural Sciences


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
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import { repositorySettings } from "@/config/appSettings"
import { RepositoryFactory } from "@/data/repositories/repository_factory";
import { useVirtualCameraStore } from "@/lib/stores";

const cameraStore = useVirtualCameraStore()
const repository = RepositoryFactory.get(repositorySettings.type)

async function openNewFile(){
    let projectFile = await repository.importNewFile()
    cameraStore.setPath(projectFile)
}
</script>

<template>
    <main class="h-screen">
        <div v-if="repositorySettings.type == 'DESKTOP'" class="justify-center items-center flex grow h-full">
            <Button @click="openNewFile" class="text-4xl p-8">Open Sphaeroptica Project</Button>
        </div>
        <Label class="text-4xl justify-center items-center align-middle flex grow h-full text-red-600 dark:text-red-400" v-else>
            Error 404 : please select a valid URL {{ repositorySettings.type }}
        </Label>
    </main>

</template>