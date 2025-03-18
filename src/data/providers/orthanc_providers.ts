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

import type { DataProvider } from "./providers";

import axios, { type AxiosResponse } from "axios";
import type { Coordinates } from "../models/coordinates";
import type { VirtualCameraImage } from "../models/virtual_camera_image";
import type { Shortcut } from "../models/shortcut";
import type { Pos } from "../models/pos";

export class OrthancProvider implements DataProvider {
    server: string;

    constructor(server: string) {
        this.server = server
    }


    async getImages(objectPath: string): Promise<Array<VirtualCameraImage>> {
        const path = this.server + "/sphaeroptica/" + objectPath + '/images'; console.log("path to get images : " + path)
        return axios.get(path).then((res) => {
            return res.data.images as VirtualCameraImage[]
        })
    }

    getImage(objectPath: string, imageName: string): string {
        const path = this.server + "/sphaeroptica/" + imageName + "/full-image"
        return path
    }

    getThumbnail(objectPath: string, imageName: string) {
        const path = this.server + "/sphaeroptica/" + imageName + "/thumbnail"
        return path
    }

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        const path = this.server + "/sphaeroptica/" + objectPath + "/shortcuts";
        return axios.get(path).then((res) => {
            let shortcuts = new Array<Shortcut>()
            let map: Map<string, Coordinates> = new Map(Object.entries(res.data.commands))
            map.forEach((val: Coordinates, key: string) => {
                shortcuts.push({ name: key, coordinates: val })
            });

            return shortcuts
        })
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<Pos> {
        const path = this.server + "/sphaeroptica/" + imageName + '/reproject?x=' + position[0]
            + "&y=" + position[1] + "&z=" + position[2] + "&w=" + position[3];
        return axios.get(path).then((res) => {
            let pose: Pos = res.data.pose
            return pose
        })

    }

    async triangulate(objectPath: string, poses: Map<string, Pos>): Promise<Array<number> | undefined> {
        const path = this.server + "/sphaeroptica/" + '/triangulate';
        return axios.post(path, {
            poses: Object.fromEntries(poses)
        }).then((res) => {
            let position = res.data.position
            return position
        })
    }

}