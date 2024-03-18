<script setup lang="ts">
import { VueElement, ref } from 'vue';
import axios from 'axios';
import * as math from 'mathjs';
import { list } from 'postcss';

type Image = {
  name : string,
  format : string,
  longitude : number,
  latitude : number,
  image : string
}

type Position = {
  x : number,
  y : number
}

class Geodesics {
  longitude: number;
  latitude: number;
  
  constructor(longitude : number, latitude : number){
    this.longitude = longitude
    this.latitude = latitude
  }

  toRad(){
    return [degreesToRads(this.longitude), degreesToRads(this.latitude)]
  }

  copy(){
    return new Geodesics(this.longitude, this.latitude)
  }

  setLongitude(move : number, longMin : number, longMax : number){
    let difference : number = longMax - longMin
    this.longitude -= longMin + move
    while(this.longitude < 0){
      this.longitude += difference
    }
    this.longitude = ((this.longitude) % difference) + longMin
  }

  setLatitude(move : number, latMin : number, latMax : number){
    this.latitude = math.min(math.max(this.latitude+move, latMin), latMax)
  }
}

function degreesToRads(deg: number) {
  return (deg * Math.PI) / 180.0;
}

function radsToDegrees(rad: number) {
  return (rad * 180.0) / Math.PI;
}

const LONG_MAX = 360
const LONG_MIN = 0

var imagePos: Geodesics = new Geodesics(0, 0)
                        
var lat_min: number = Number.MAX_VALUE
var lat_max: number = Number.MIN_VALUE
var map_images: Map<String, Image> = new Map()

var isPressed : boolean = false


const imageUrl = ref('https://cdn.uclouvain.be/groups/cms-editors-arec/charte-graphique-uclouvain/UCLouvain_Logo_Pos_CMJN.png?itok=0Vz8FOqj')

function setNearestImage() {
  let best_angle: Number = Infinity;
  let best_image: Image | null = null

  let rad_pos: [number, number] = [degreesToRads(imagePos.longitude), degreesToRads(imagePos.latitude)]

  map_images.forEach((image_data : Image, key : String) => {
    let img_pos: [number, number] = [degreesToRads(image_data.longitude), degreesToRads(image_data.latitude)]
    let sinus: number = math.sin(img_pos[1]) * math.sin(rad_pos[1])
    let cosinus: number = math.cos(img_pos[1]) * math.cos(rad_pos[1]) * math.cos(math.abs(img_pos[0] - rad_pos[0]))
    let cent_angle : Number = math.acos(sinus + cosinus) as Number
    if(cent_angle < best_angle){
      best_angle = cent_angle
      best_image = image_data
    } 
  })

  if (best_image === null) {
    return;
  }
  var image_data : Image = best_image
  imageUrl.value = image_data.image
  

}

function getImages() {
  const path = 'http://localhost:5000/images';
  axios.get(path)
    .then((res) => {
      let list_images = res.data.result.images as Array<Image>
      
      map_images = new Map()
      list_images.forEach((image: Image) => {
        map_images.set(image.name, image)
        if(image.latitude < lat_min){
          lat_min = image.latitude
        }
        if(image.latitude > lat_max){
          lat_max = image.latitude
        }
      })
      console.log(lat_min +"; " + lat_max)
      setNearestImage()
    })
    .catch((error) => {
      console.error(error);
    });

}

function mouseEnter(event : MouseEvent){
  isPressed = true
}
function mouseMove(event : MouseEvent){
  if (isPressed){
    let pos : Position = {x: event.movementX, y: event.movementY}
    imagePos.setLongitude(((pos.x)/2), LONG_MIN, LONG_MAX)

    imagePos.setLatitude(((pos.y)/2), lat_min, lat_max)

    console.log("Long = " + imagePos.longitude + "; Latitude" + imagePos.latitude)
    setNearestImage()
  }
}
function mouseLeave(){
  isPressed = false
}

getImages()
</script>
<template>
  <div class="h-full w-full rounded-md border p-4 flex justify-center items-center">
    <img class="object-fit" @mousedown="mouseEnter" @mouseup="mouseLeave" @mousemove="mouseMove" @mouseleave="mouseLeave" :src="imageUrl" alt="album.name" aspect-ratio="auto" draggable="false">
  </div>
</template>

<style scoped>
.object-fit {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  width:100%;
  height:100%;
}
</style>