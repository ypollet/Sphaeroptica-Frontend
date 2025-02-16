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

import type { Coordinates } from "../models/coordinates";
import type { VirtualCameraImage } from "../models/virtual_camera_image";
import type { Shortcut } from "../models/shortcut";
import { Images, Shortcuts, Greet } from "../../../wailsjs/go/main/App.js";

export class DesktopProvider implements DataProvider {

    async getImages(objectPath: string): Promise<Array<VirtualCameraImage>> {
      return Images(objectPath).then((res) => {
        console.log(res)
        return res.images as Array<VirtualCameraImage>
      })
    }

    async getShorcuts(objectPath: string): Promise<Array<Shortcut>> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve([]);
            }, 500);
          });
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<Coordinates> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({ x: 0, y:0});
            }, 500);
          });

    }

    async triangulate(objectPath: string, poses: Map<string, Coordinates>): Promise<Array<number> | undefined> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(undefined);
            }, 500);
          });
    }

}