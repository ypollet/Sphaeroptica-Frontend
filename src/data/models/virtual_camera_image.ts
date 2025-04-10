// Sphaeroptica - 3D Viewer on calibrated images - Frontend

import type { Coordinates } from "./coordinates"
import type { Pos } from "./pos"

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

export type VirtualCameraImage = {
    name: string,
    coordinates: Coordinates,
    fullImage: string,
    thumbnail: string,
    versions : Map<string, number>,
    reprojections : Map<string, Pos>
}

export type ProjectData = {
    images: Array<VirtualCameraImage>,
    size: Size,
    thumbnails : boolean
}

export type Size = {
    height: number,
    width: number
}

export type Ratio = Size