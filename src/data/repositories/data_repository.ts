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

import type { Repository } from "./repository";
import type { Shortcut } from "../models/shortcut";
import type { ProjectData, VirtualCameraImage } from "../models/virtual_camera_image";

import type { DataProvider } from "../providers/providers";
import type { Pos } from "../models/pos";

export class DataRepository implements Repository {
    provider: DataProvider;

    constructor(provider: DataProvider) {
        this.provider = provider
    }

    async getImages(objectPath: string): Promise<ProjectData> {
        return this.provider.getImages(objectPath).then((images) => {
            return images
        })
    }

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        return this.provider.getShorcuts(objectPath)
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<Pos> {
        return this.provider.computeReprojection(objectPath, position, imageName)
    }

    async triangulate(objectPath: string, poses: Map<string, Pos>): Promise<Array<number> | undefined> {
        return this.provider.triangulate(objectPath, poses)
    }

}