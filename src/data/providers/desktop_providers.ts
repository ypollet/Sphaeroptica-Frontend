// Sphaeroptica - 3D Viewer on calibrated images - wails

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

import type { Coordinates } from "../models/coordinates";
import type { VirtualCameraImage } from "../models/virtual_camera_image";
import type { Shortcut } from "../models/shortcut";
import { Images, Shortcuts, Reproject, Triangulate } from "../../../wailsjs/go/main/App.js";
import type { Pos } from "../models/pos";

export class DesktopProvider implements DataProvider {

    async getImages(objectPath: string): Promise<Array<VirtualCameraImage>> {
      return Images(objectPath).then((res) => {
        return res.images as Array<VirtualCameraImage>
      })
    }

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        return Shortcuts(objectPath).then((res) => {
          let shortcuts = new Array<Shortcut>()
            let map: Map<string, Coordinates> = new Map(Object.entries(res))
            map.forEach((val: Coordinates, key: string) => {
                shortcuts.push({ name: key, coordinates: val })
            });

          return shortcuts
        })
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<Pos> {
        return Reproject(objectPath, imageName, position)
    }

    async triangulate(objectPath: string, poses: Map<string, Pos>): Promise<Array<number> | undefined> {
        let posesObj = Object.fromEntries(poses)
        return Triangulate(objectPath, posesObj);
    }

}