import * as math from 'mathjs'
import { defineStore, type PiniaPluginContext, type StateTree } from 'pinia'
import { degreesToRad } from '@/lib/utils'
import { DequeMax2 } from '@/data/models/dequeMax2'
import { Distance } from '@/data/models/distance'
import { Landmark } from '@/data/models/landmark'
import { LandmarkImage } from '@/data/models/landmark_image'
import Color from 'color'
import type { VirtualCameraImage } from '@/data/models/virtual_camera_image'

export const DEFAULT_TAB = "viewer"

export const useSettingsStore = defineStore('settings', {
  state: () => ({ isLeft : false }),
  actions: {
    useToggleLeft(value : boolean){
      this.isLeft = value
    },
  },

  persist: {
    storage: localStorage,
  }
})

export const useVCImagesStore = defineStore('vc_images', {
  state: () => ({
    images : new Map<string, VirtualCameraImage>(),
    latMin: Number.MAX_VALUE,
    latMax: Number.MIN_VALUE,
    objectPath: "",
  }),
  actions: {
    setPath(path : string) {
      this.images = new Map<string, VirtualCameraImage>()
      this.latMin = Number.MAX_VALUE
      this.latMax = Number.MIN_VALUE
      this.objectPath = path
    },
  },
  persist: {
    storage: localStorage,
  },
})
export const useVirtualCameraStore = defineStore('camera', {
  state: () => ({
    longitude: 0,
    latitude: 0,
  }),
  getters: {
    toRad: (state) => [degreesToRad(state.longitude), degreesToRad(state.latitude)],
  },
  actions: {
    reset() {
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
    afterHydrate: (ctx: PiniaPluginContext) => {
      console.log("Restore CameraImages")
      console.log(ctx.store.$state.images)
      console.log(Object.entries(ctx.store.$state.images))
      let images : Map<string, VirtualCameraImage> = new Map(Object.entries(ctx.store.$state.images))
      console.log(images)
      ctx.store.$state.images = images
    },
  },
})

export const useLandmarksStore = defineStore('landmarks', {
  state: () => ({ landmarks: Array<Landmark>(),
                  selectedGroup : new DequeMax2(),
                  distances: Array<Distance>(),
                  adjustFactor: 1,
                  scale: "m"
                }),
  actions: {
    addLandmark(landmark: Landmark) {
      this.landmarks.push(landmark)
    },
    generateID() {
      let check: boolean = false
      let id: string = ""
      while (!check) {
        id = (Math.random() + 1).toString(36).substring(2);
        if (this.landmarks.filter(e => e.getId() === id).length == 0) {
          check = true
        }
      }
      return id;
    },
    addDistance(left : Landmark, right : Landmark, label:string | null = null){
      let distance : Distance = new Distance(label || "distance_"+this.distances.length, left, right)
      if(this.distances.filter((x) => x.equals(distance)).length == 0){
        this.distances.push(distance)
      }
    }
  },
  persist: {
    storage: localStorage,
    afterHydrate: (ctx: PiniaPluginContext) => {
      console.log("Restore landmarks")
      // restore landmarks
      let landmarks = ctx.store.$state.landmarks.map((x: Landmark) => x)
      console.log(landmarks)
      let landmarksToKeep = landmarks.map((jsonObject: Landmark) =>
        new Landmark(jsonObject.id, jsonObject.label, jsonObject.version, Color(jsonObject.color), new Map(Object.entries(jsonObject.poses)), jsonObject.position)
      )
      ctx.store.$state.landmarks = landmarksToKeep

      // restore selectedGroup
      let selectedGroup = new DequeMax2()
      let deque = ctx.store.$state.selectedGroup
      if(deque){
        for(let i = 0; i < Object.values(deque.deque).length; i++){
          selectedGroup.add(deque.deque[i])
        }
        ctx.store.$state.selectedGroup = selectedGroup
      }

      // restore distances
      landmarksToKeep.forEach((x : Landmark) => {
        console.log(x.id)
      })
      let distances = ctx.store.$state.distances.map((x : Distance) => x)

      ctx.store.$state.distances = distances.map((jsonObject: Distance) => 
        new Distance(jsonObject.label, landmarksToKeep[landmarksToKeep.map((e : Landmark) => e.id).indexOf(jsonObject.landmarkLeft.id)], 
          landmarksToKeep[landmarksToKeep.map((e : Landmark) => e.id).indexOf(jsonObject.landmarkRight.id)])
      )
      
    },
  },
})

export const useLandmarkImagesStore = defineStore('landmarks_images', {
  state: () => ({ landmark_images: Array<LandmarkImage>(), selected: -1 }),
  getters: {
    getTabName: (state) => (state.selected >= 0 && state.selected < state.landmark_images.length) ? state.landmark_images[state.selected].name : DEFAULT_TAB,
  },
  actions: {
    reset() {
      console.log("Reset Landmark images")
      this.landmark_images = new Array<LandmarkImage>()
      this.selected = -1
    },
    setTab(value: string) {
      this.selected = this.landmark_images.findIndex((image) => image.name == value)
    },
    removeImage(index: number) {
      this.landmark_images.splice(index, 1)
    },
    addImage(image: LandmarkImage) {
      if (this.landmark_images.filter((el) => el.name == image.name).length == 0) {
        this.landmark_images.push(image)
      }
      console.log(this.landmark_images)
    }
  },
  persist: {
    storage: localStorage,
    debug: true,
    afterHydrate: (ctx: PiniaPluginContext) => {
      console.log("Restore LandmarkImages")
      console.log(ctx.store.$state)
      let landmark_images = ctx.store.$state.landmark_images.map((x: LandmarkImage) => x)
      console.log(landmark_images)
      ctx.store.$state.landmark_images = landmark_images.map((jsonObject: LandmarkImage) =>
          new LandmarkImage(jsonObject.name, 
            jsonObject.image,
            jsonObject.longLat, 
            jsonObject.zoom, 
            jsonObject.offset, 
            new Map(Object.entries(jsonObject.versions)), 
            new Map(Object.entries(jsonObject.reprojections)))
      )
    },
  },
})