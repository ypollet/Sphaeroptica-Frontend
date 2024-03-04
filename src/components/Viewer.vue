<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

var list_images = []

const imageUrl = ref('https://images.unsplash.com/photo-1468817814611-b7edf94b5d60?')

function getExtension(filename : String){
    return filename.split('.').pop();
}

function getMessage() {
  const path = 'http://localhost:5000/images';
  axios.get(path)
    .then((res) => {
      console.log(res.data)
      list_images = res.data;
      var first_image = Object.keys(list_images["result"])[0]
      imageUrl.value = "data:image/"+ getExtension(first_image) +";base64, " + list_images["result"][first_image]
    })
    .catch((error) => {
      console.error(error);
    });

}

getMessage()
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
}
</style>