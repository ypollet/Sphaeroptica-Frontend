import * as math from 'mathjs'
import { defineStore, type PiniaPluginContext, type StateTree } from 'pinia'
import { degreesToRad } from '@/lib/utils'
import { Landmark } from './types'
import type { Image } from './types'
import Color from 'color'


export const useImagesStore = defineStore('images', {
  state: () => ({ latMin : Number.MAX_VALUE,
                  latMax : Number.MIN_VALUE,
                  images : Array<Image>(), 
                  objectPath : "geonemus-geoffroyii", 
                  selectedImage : "https://cdn.uclouvain.be/groups/cms-editors-arec/charte-graphique-uclouvain/UCLouvain_Logo_Pos_CMJN.png?itok=0Vz8FOqj",
                  selectedImageWidth : 595,
                  selectedImageHeight : 138,
                }),
  getters: {
    getImageSize: (state) => [state.selectedImageWidth, state.selectedImageHeight],
  },
  actions: {
    reset(){
      this.latMin = Number.MAX_VALUE
      this.latMax = Number.MIN_VALUE
      this.images = []
      this.objectPath = "geonemus-geoffroyii"
      this.selectedImage = "https://cdn.uclouvain.be/groups/cms-editors-arec/charte-graphique-uclouvain/UCLouvain_Logo_Pos_CMJN.png?itok=0Vz8FOqj",
      this.selectedImageWidth = 595,
      this.selectedImageHeight = 138
    },
    setNearestImage(radPos : number[]) {
      let bestAngle: Number = Infinity;
      let bestImage: Image | null = null
        
      this.images.forEach((imageData: Image) => {
        let imgPos: [number, number] = [degreesToRad(imageData.longitude), degreesToRad(imageData.latitude)]
        let sinus: number = math.sin(imgPos[1]) * math.sin(radPos[1])
        let cosinus: number = math.cos(imgPos[1]) * math.cos(radPos[1]) * math.cos(math.abs(imgPos[0] - radPos[0]))
        let centAngle: Number = math.acos(sinus + cosinus) as Number
        if (centAngle < bestAngle) {
          bestAngle = centAngle
          bestImage = imageData
        }
      })
    
      if (bestImage === null) {
        return;
      }
      var imageData: Image = bestImage
      this.selectedImage = imageData.image
      this.selectedImageHeight = imageData.height
      this.selectedImageWidth = imageData.width
    }
  }              
})
export const useVirtualCameraStore = defineStore('camera', {
  state: () => ({ longitude: 0, 
                  latitude: 0,
                   }),
  getters: {
    toRad: (state) => [degreesToRad(state.longitude), degreesToRad(state.latitude)],
  },
  actions: {
    reset(){
      this.longitude = 0
      this.latitude = 0
    },
    setLongitude(move: number, longMin: number, longMax: number) {
      let difference: number = longMax - longMin
      this.longitude -= longMin + move
      while (this.longitude < 0) {
        this.longitude += difference
      }
      this.longitude = ((this.longitude) % difference) + longMin
    },
    setLatitude(move: number, latMin: number, latMax: number) {
      this.latitude = math.min(math.max(this.latitude + move, latMin), latMax)
    },
  },

  persist: {
    storage: sessionStorage,
    key: 'camera',
  },
})

export const useLandmarksStore = defineStore('landmarks', {
  state: () => ({ landmarks: Array<Landmark>() }),
  actions: {
    addLandmark(landmark: Landmark) {
      this.landmarks.push(landmark)
    },
    generateID(){
      let check : boolean = false
      let id : string = ""
      while(!check){
        id = (Math.random() + 1).toString(36).substring(2);
        if(this.landmarks.filter(e => e.id === id).length == 0){
          check = true
        }
      }
      return id;
    }
  },
  persist: {
    storage: sessionStorage,
    key: 'landmarks',
    afterRestore: (ctx: PiniaPluginContext) => {
      let landmarks = ctx.store.$state.landmarks.map((x: Landmark) => x)
      ctx.store.$state.landmarks = landmarks.map((jsonObject: Landmark) =>
        new Landmark(jsonObject.id, jsonObject.label, Color(jsonObject.color), new Map(Object.entries(jsonObject.poses)))
      )
    },
  },
})