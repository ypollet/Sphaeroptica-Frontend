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

export class WebProvider implements DataProvider {
    server: string;

    constructor(server: string) {
        this.server = server
    }

    async getImages(objectPath: string): Promise<AxiosResponse> {
        const path = this.server + "/" + objectPath +'/images';
        console.log("path to get images : " + path)
        return axios.get(path)
    }

    getImage(objectPath: string, imageName : string): string {
        const path = this.server + "/" + objectPath + "/" + imageName
        return path
    }

    async getShorcuts(objectPath: string): Promise<AxiosResponse> {
        const path = this.server + "/" + objectPath + "/shortcuts";
        return axios.get(path)
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<AxiosResponse> {
        const path = this.server + "/" + objectPath + '/reproject';
        return axios.post(path, {
            position: position,
            image: imageName
        })

    }

    async triangulate(objectPath: string, poses: Map<string, Coordinates>): Promise<AxiosResponse> {
        const path = this.server + "/" + objectPath + '/triangulate';
        return axios.post(path, {
            poses: Object.fromEntries(poses)
        })
    }

}