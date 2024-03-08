<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import * as math from 'mathjs';

function degreesToRads(deg: number) {
  return (deg * Math.PI) / 180.0;
}

function radsToDegrees(rad: number) {
  return (rad * 180.0) / Math.PI;
}

var longitude: number = 0
var latitude: number = 0
var map_images: Map<String, Map<String, Object>> = new Map()


const imageUrl = ref('https://cdn.uclouvain.be/groups/cms-editors-arec/charte-graphique-uclouvain/UCLouvain_Logo_Pos_CMJN.png?itok=0Vz8FOqj')

function getExtension(filename: String) {
  return filename.split('.').pop();
}

function getNearestImage() {
  let best_angle: Number = Infinity;
  let best_image: String = ""

  let rad_pos: [number, number] = [degreesToRads(longitude), degreesToRads(latitude)]

  Object.keys(map_images).forEach((key : String) => {
    let img_pos: [number, number] = [degreesToRads(longitude), degreesToRads(latitude)]
    let sinus: number = math.sin(img_pos[1]) * math.sin(rad_pos[1])
    let cosinus: number = math.cos(img_pos[1]) * math.cos(rad_pos[1]) * math.cos(math.abs(img_pos[0] - rad_pos[0]))
    let cent_angle : Number = math.acos(sinus + cosinus) as Number
    if(cent_angle < best_angle){
      best_angle = cent_angle
      best_image = key
    }
      
  })
  
  return best_image

}

function getImages() {
  const path = 'http://localhost:5000/images';
  axios.get(path)
    .then((res) => {
      console.log(typeof(res.data["result"]["images"]))
      var data = new Map(res.data);
      console.log(res.data["result"]["images"])

      map_images = new Map()
      /*
      m
      map_images = new Map(data.get("result")["images"])
      let image : String = getNearestImage()
      console.log(Object.keys(map_images.get(image)!))
      var image_data = map_images.get(image)!
      imageUrl.value = "data:image/" + image_data.get("format") + ";base64, " + image_data.get("image")
      */
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
.object-fit {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
}
</style>