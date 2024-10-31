import type { Repository } from "./repository";
import type { Coordinates } from "../models/coordinates";
import type { Shortcut } from "../models/shortcut";
import type { VirtualCameraImage } from "../models/virtual_camera_image";

import type { DataProvider } from "../providers/providers";
import type { LandmarkImage } from "../models/landmark_image";

export class DataRepository implements Repository {
    provider: DataProvider;

    constructor(provider: DataProvider) {
        this.provider = provider
    }

    async getImages(objectPath: string): Promise<Array<VirtualCameraImage>> {
        return this.provider.getImages(objectPath).then((res) => {
            let images = res.data.result.images as VirtualCameraImage[]
            return images
        })
    }

    getImage(objectPath: string, imageName : string, longLat : Coordinates): LandmarkImage {
        return {
            name: imageName,
            image: this.provider.getImage(objectPath, imageName),
            longLat : longLat,
            zoom: -1,
            offset: {x:0, y:0},
            versions : new Map(),
            reprojections : new Map()
          }

    }

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        return this.provider.getShorcuts(objectPath).then((res) => {
            let shortcuts = new Array<Shortcut>()
            let map : Map<string, string> = new Map(Object.entries(res.data.commands))
            map.forEach((val : string, key : string) => {
                shortcuts.push({name: key, image : val})
            });
            
            return shortcuts
        })
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<Coordinates> {
        return this.provider.computeReprojection(objectPath, position, imageName).then((res) => {
            let pose: Coordinates = res.data.result.pose
            return pose
        })
    }

    async triangulate(objectPath: string, poses: Map<string, Coordinates>): Promise<Array<number> | undefined> {
        return this.provider.triangulate(objectPath, poses).then((res) => {
            let position = res.data.result.position
            return position
        })

    }

}