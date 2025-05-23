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

import axios from "axios";
import type { ProjectData, VirtualCameraImage } from "../models/virtual_camera_image";
import type { Shortcut } from "../models/shortcut";
import type { Pos } from "../models/pos";
import type { Coordinates } from "../models/coordinates";
import type { Repository } from "./repository";
import type { ImportFile } from "../models/imports";
import type { LandmarkCSV } from "../models/export/landmarks_csv";
import type { ExportJSON } from "../models/export/landmarks_json";

export class WebRepository implements Repository {
    server: string;

    constructor(server: string) {
        this.server = server
    }
    async landmarkCSV(landmarks: Array<LandmarkCSV>){
        throw Error("Not implemented")
    };
    async landmarksJSON(landmarks: ExportJSON){
        throw Error("Not implemented")
    };
    importProject(software: string, files: Map<string, string>): Promise<string> {
        throw Error("Not implemented")
    };
    getImportFile(software: string, index: number): Promise<string> {
        throw Error("Not implemented")
    };
    importNewFile(): Promise<string> {
        throw Error("Not implemented")
    };

    getImportMethods(): Promise<Map<string, Array<ImportFile>>> {
        throw Error("Not implemented")
    };

    async getImages(objectPath: string): Promise<ProjectData> {
        const path = this.server + "/" + objectPath + '/images';
        return axios.get(path).then((res) => {
            let data = res.data
            let images = res.data.images as VirtualCameraImage[]
            images.map((image) => {
                image.fullImage = this.getImage(objectPath, image.name)
                if (res.data.thumbnails) {
                    image.thumbnail = this.getThumbnail(objectPath, image.name)
                }
                image.reprojections = new Map()
                image.versions = new Map()
            })
            data.images = images
            return data
        })
    }

    getImage(objectPath: string, imageName: string): string {
        const path = this.server + "/" + objectPath + "/" + imageName + "/full-image"
        return path
    }

    getThumbnail(objectPath: string, imageName: string): string {
        const path = this.server + "/" + objectPath + "/" + imageName + "/thumbnail"
        return path
    }

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        const path = this.server + "/" + objectPath + "/shortcuts";
        return axios.get(path).then((res) => {
            let shortcuts = new Array<Shortcut>()
            let map: Map<string, Coordinates> = new Map(Object.entries(res.data))
            map.forEach((val: Coordinates, key: string) => {
                shortcuts.push({ name: key, coordinates: val })
            });

            return shortcuts
        })
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<Pos> {
        const path = this.server + "/" + objectPath + '/reproject';
        return axios.post(path, {
            position: position,
            image: imageName
        }).then((res) => {
            return res.data
        })

    }

    async triangulate(objectPath: string, poses: Map<string, Pos>): Promise<Array<number> | undefined> {
        const path = this.server + "/" + objectPath + '/triangulate';
        return axios.post(path, {
            poses: Object.fromEntries(poses)
        }).then((res) => {
            return res.data
        })
    }

}