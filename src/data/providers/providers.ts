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

import type { Coordinates } from "../models/coordinates";
import type { VirtualCameraImage } from "../models/virtual_camera_image";
import type { Shortcut } from "../models/shortcut";

export interface DataProvider {
        getImages: (objectPath: string) => Promise<Array<VirtualCameraImage>>;
        getImage : (objectPath:string, imageName : string) => string;
        getThumbnail : (objectPath: string, imageName : string) => string;
        getShorcuts: (objectPath: string) => Promise<Array<Shortcut>>;
        computeReprojection: (objectPath: string, position: Array<number>, image: string) => Promise<Coordinates>;
        triangulate: (objectPath: string, poses: Map<string, Coordinates>) => Promise<Array<number> | undefined>
}
