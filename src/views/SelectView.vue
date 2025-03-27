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
import Label from "@/components/ui/label/Label.vue";

</script>

<template>
    <main class="h-screen">
        <Label class="text-4xl justify-center items-center align-middle flex grow h-full text-red-600 dark:text-red-400">
            Error 404 : please select a valid URL
        </Label>
    </main>

</template>