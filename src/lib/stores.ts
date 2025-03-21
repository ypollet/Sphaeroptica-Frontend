// Sphaeroptica - 3D Viewer on calibrated images - Frontend

// Copyright (C) 2024 Yann Pollet, Royal Belgian Institute of Natural Sciences

//

// This program is free software: you can redistribute it and/or

// modify it under the terms of the GNU General Public License as

// published by the Free Software Foundation, either version 3 of the

// License, or (at your option) any later version.

// 

// This program is distributed in the hope that it will be useful, but

// WITHOUT ANY WARRANTY; without even the implied warranty of

// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU

// General Public License for more details.

//

// You should have received a copy of the GNU General Public License

// along with this program. If not, see <http://www.gnu.org/licenses/>.

import * as math from 'mathjs'
import { defineStore, type PiniaPluginContext, type StateTree } from 'pinia'
import { degreesToRad } from '@/lib/utils'
import { DequeMax2 } from '@/data/models/dequeMax2'
import { Distance } from '@/data/models/distance'
import { Landmark } from '@/data/models/landmark'
import Color from 'color'
import type { VirtualCameraImage } from '@/data/models/virtual_camera_image'
import { destr } from "destr";
import * as turf  from '@turf/turf'
import type {  FeatureCollection, GeoJsonProperties, Point } from 'geojson';

const LONG_MAX = 360
const LONG_MIN = 0

export const DEFAULT_IMAGE = {
  name: "RBINS Logo",
  fullImage: "https://www.naturalsciences.be/bundles/8c62adb1e0fbef009ef7c06c69a991890012e203/img/logos/logo.svg",
  thumbnail: "",
  coordinates: { longitude: 0, latitude: 0 }, 
  versions: new Map(), 
  reprojections: new Map()
};

export const useSettingsStore = defineStore('settings', {
  state: () => ({ isLeft: false }),
  actions: {
    useToggleLeft(value: boolean) {
      this.isLeft = value
    },
  },

  persist: {
    storage: localStorage,
  }
})


export const useVirtualCameraStore = defineStore('camera', {
  state: () => ({
    objectPath: "",
    images: new Array<VirtualCameraImage>(),
    posImages : turf.featureCollection([]),
    latMin: Number.MAX_VALUE,
    latMax: Number.MIN_VALUE,
    coordinates: {
      longitude: 0,
      latitude: 0,
    }
  }),
  getters: {
    toRad: (state) => [degreesToRad(state.coordinates.longitude), degreesToRad(state.coordinates.latitude)],
    coord : (state) => [state.coordinates.longitude, state.coordinates.latitude],
    selectedImage: (state) => {
      if(state.images == null){
        return DEFAULT_IMAGE
      } 
      let targetPoint = turf.point([state.coordinates.longitude, state.coordinates.latitude])
      let points = state.posImages as FeatureCollection<Point, GeoJsonProperties>
      let nearest = turf.nearestPoint(targetPoint, points);

      if (nearest === null || nearest.properties.index >= state.images.length) {
        return DEFAULT_IMAGE
      }
      
      let imageData = state.images[nearest.properties.index]

      return imageData
    }
  },
  actions: {
    home() {
      this.coordinates = {
        longitude: 0,
        latitude: 0,
      }
    },
    setPath(path: string) {
      this.images = new Array<VirtualCameraImage>()
      this.latMin = Number.MAX_VALUE
      this.latMax = Number.MIN_VALUE
      this.objectPath = path
      this.coordinates = {
        longitude: 0,
        latitude: 0,
      }
    },
    moveLongitude(move: number) {
      let difference: number = LONG_MAX - LONG_MIN
      this.coordinates.longitude -= LONG_MIN + move
      while (this.coordinates.longitude < LONG_MIN) {
        this.coordinates.longitude += difference
      }
      this.coordinates.longitude = ((this.coordinates.longitude) % difference) + LONG_MIN
    },
    moveLatitude(move: number) {
      this.coordinates.latitude = math.min(math.max(this.coordinates.latitude + move, this.latMin), this.latMax)
    },

  },

  persist: {
    storage: sessionStorage,
    debug: true,
    serializer: {
      deserialize: (value: string) => {
        let state = destr<StateTree>(value)
        let stateCopy = Object.assign({}, state)
        stateCopy.images = Array.from(state.images)
        stateCopy.images.forEach((image : VirtualCameraImage) => {
          image.versions = new Map(Object.entries(image.versions))
          image.reprojections = new Map(Object.entries(image.reprojections))
        })
        return stateCopy
      },
      serialize: (state: StateTree) => {
        return JSON.stringify(state)
      }
    },
  },
})

export const useLandmarksStore = defineStore('landmarks', {
  state: () => ({
    landmarks: Array<Landmark>(),
    selectedGroup: new DequeMax2(),
    distances: Array<Distance>(),
    adjustFactor: 1,
    scale: "m",
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
    addDistance(left: Landmark, right: Landmark, label: string | null = null) {
      let distance: Distance = new Distance(label || "distance_" + this.distances.length, left, right)
      if (this.distances.filter((x) => x.equals(distance)).length == 0) {
        this.distances.push(distance)
      }
    }
  },
  persist: {
    storage: sessionStorage,
    afterHydrate: (ctx: PiniaPluginContext) => {
      // restore landmarks
      let landmarks = ctx.store.$state.landmarks.map((x: Landmark) => x)
      let landmarksToKeep = landmarks.map((jsonObject: Landmark) =>
        new Landmark(jsonObject.id, jsonObject.label, jsonObject.version, Color(jsonObject.color), new Map(Object.entries(jsonObject.poses)), jsonObject.position)
      )
      ctx.store.$state.landmarks = landmarksToKeep

      // restore selectedGroup
      let selectedGroup = new DequeMax2()
      let deque = ctx.store.$state.selectedGroup
      if (deque) {
        for (let i = 0; i < Object.values(deque.deque).length; i++) {
          selectedGroup.add(deque.deque[i])
        }
        ctx.store.$state.selectedGroup = selectedGroup
      }

      let distances = ctx.store.$state.distances.map((x: Distance) => x)

      ctx.store.$state.distances = distances.map((jsonObject: Distance) =>
        new Distance(jsonObject.label, landmarksToKeep[landmarksToKeep.map((e: Landmark) => e.id).indexOf(jsonObject.landmarkLeft.id)],
          landmarksToKeep[landmarksToKeep.map((e: Landmark) => e.id).indexOf(jsonObject.landmarkRight.id)])
      )

    },
  },
})

export const useLandmarkImagesStore = defineStore('landmarks_images', {
  state: () => ({
    zoom: 0,
    offset: { x: 0, y: 0 },
    size : { width : -1, height : -1}
  }),
  persist: {
    storage: localStorage,
    debug: true,
  },
})