<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import math from 'mathjs'

var list_images = []

const imageUrl = ref('https://images.unsplash.com/photo-1528143358888-6d3c7f67bd5d?w=300&dpr=2&q=80')

function getExtension(filename : String){
    return filename.split('.').pop();
}

function getImages() {
  const path = 'http://localhost:5000/images';
  axios.get(path)
    .then((res) => {
      list_images = res.data;
      var first_image = Object.keys(list_images["result"]["images"])[0]
      var image_data = list_images["result"]["images"][first_image]
      imageUrl.value = "data:image/"+ image_data["format"] +";base64, " + image_data["image"]
    })
    .catch((error) => {
      console.error(error);
    });

}

getImages()
</script>
<template>
<div class="h-full w-full rounded-md border p-4 flex justify-center items-center">
    <img class="object-fit" :src="imageUrl" alt="album.name" aspect-ratio="auto">
</div>
</template>

<style scoped>
.object-fit{
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
    width: 100%;
}
</style>