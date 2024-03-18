import * as math from 'mathjs'
import { defineStore } from 'pinia'
import { degreesToRad } from '@/lib/utils'

export const useCameraStore = defineStore('camera', {
    state: () => ({ longitude: 0, latitude: 0}),
    getters: {
      toRad: (state) => [degreesToRad(state.longitude), degreesToRad(state.latitude)],
    },
    actions: {
      setLongitude(move : number, longMin : number, longMax : number){
        let difference : number = longMax - longMin
        this.longitude -= longMin + move
        while(this.longitude < 0){
          this.longitude += difference
        }
        this.longitude = ((this.longitude) % difference) + longMin
      },
  
      setLatitude(move : number, latMin : number, latMax : number){
        this.latitude = math.min(math.max(this.latitude+move, latMin), latMax)
      }
    },
  })