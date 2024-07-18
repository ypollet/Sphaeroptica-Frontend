import type { Matrix } from "mathjs";
import type { Repository } from "./repository";
import type { Coordinates } from "../models/coordinates";
import type { Shortcut } from "../models/shortcut";
import type { VirtualCameraImage } from "../models/virtual_camera_image";

import type { DataProvider } from "../providers/providers";
import { WebProvider } from "../providers/web_providers";
import type { LandmarkImage } from "../models/landmark_image";

export class WebRepository implements Repository {
    webProvider: DataProvider;

    constructor(server: string) {
        this.webProvider = new WebProvider(server)
    }

    async getImages(objectPath: string): Promise<Array<VirtualCameraImage>> {
        return this.webProvider.getImages(objectPath).then((res) => {
            let images = res.data.result.images as VirtualCameraImage[]
            return images
        })
    }

    async getImage(objectPath: string, imageName : string): Promise<LandmarkImage> {
        let image_src : string = await this.webProvider.getImage(objectPath, imageName)
        let image : LandmarkImage = {
            name: imageName,
            image: image_src,
            zoom: -1,
            offset: {x:0, y:0},
            versions : new Map(),
            reprojections : new Map()
          }
        return image
    }

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        return this.webProvider.getShorcuts(objectPath).then((res) => {
            let shortcuts = res.data.result.commands as Shortcut[];
            return shortcuts
        })
    }

    async computeReprojection(objectPath: string, position: Matrix, imageName: string): Promise<Coordinates> {
        return this.webProvider.computeReprojection(objectPath, position, imageName).then((res) => {
            let pose: Coordinates = res.data.result.pose
            return pose
        })
    }

    async triangulate(objectPath: string, poses: Map<string, Coordinates>): Promise<Matrix | undefined> {
        return this.webProvider.triangulate(objectPath, poses).then((res) => {
            let position = res.data.result.position
            return position
        })

    }

}