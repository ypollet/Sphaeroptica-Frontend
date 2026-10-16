<script setup lang="ts">

import { useDark } from '@vueuse/core'

const isDark = useDark({
    storageKey: 'localStorage'
})
</script>
<template>
    <svg width="500" height="65.970032" viewBox="0 0 132.29189 17.454571" version="1.1" id="svg1"
        xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
        <defs id="defs1" /><text xml:space="preserve"
            style="font-weight:bold;font-size:18.0358px;line-height:0;font-family:'DejaVu Sans';-inkscape-font-specification:'DejaVu Sans Bold';writing-mode:lr-tb;direction:ltr;stroke-linecap:round;stroke-dasharray:none"
            x="-1.2945619" y="13.702973" id="text1" :fill="(isDark) ? '#dbffc9ff' : '#141712'">
            <tspan id="tspan1"
                style="font-style:normal;font-variant:normal;font-weight:bold;font-stretch:normal;font-size:18.0358px;font-family:'DejaVu Sans';-inkscape-font-specification:'DejaVu Sans Bold';stroke-width:0;stroke-dasharray:none"
                x="-1.2945619" y="13.702973">Sphaeroptica</tspan>
        </text>
    </svg>

</template>