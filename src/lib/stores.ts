import * as math from 'mathjs'
import { defineStore, type PiniaPluginContext, type StateTree } from 'pinia'
import { degreesToRad } from '@/lib/utils'
import { Landmark } from './types'
import Color from 'color'

export const useCameraStore = defineStore('camera', {
  state: () => ({ longitude: 0, latitude: 0 }),
  getters: {
    toRad: (state) => [degreesToRad(state.longitude), degreesToRad(state.latitude)],
  },
  actions: {
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
    }
  },

  persist: {
    storage: sessionStorage,
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