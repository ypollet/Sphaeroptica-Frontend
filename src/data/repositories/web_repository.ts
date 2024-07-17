import type { Matrix } from "mathjs";
import type { Repository } from "./repository";
import type { Coordinates } from "../models/coordinates";
import type { Landmark } from "../models/landmark";
import type { Shortcut } from "../models/shortcut";
import type { VirtualCameraImage } from "../models/virtual_camera_image";

import type { DataProvider } from "../providers";
import { WebProvider } from "../providers/web_providers";

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

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        return this.webProvider.getShorcuts(objectPath).then((res) => {
            let shortcuts = res.data.result.commands as Shortcut[];
            return shortcuts
        })
    }

    async computeReprojection(objectPath: string, position: Matrix, image: string): Promise<Coordinates> {
        return this.webProvider.computeReprojection(objectPath, position, image).then((res) => {
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