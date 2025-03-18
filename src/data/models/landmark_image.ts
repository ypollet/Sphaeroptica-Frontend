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

import type { Coordinates } from "@/data/models/coordinates"
import type { Pos } from "@/data/models/pos"
export class LandmarkImage  {
    name: string
    image: string
    longLat : Coordinates
    zoom: number
    offset: Pos
    versions : Map<string, number>
    reprojections : Map<string, Pos>

    constructor(name : string, image : string, longLat : Coordinates, zoom: number = 1, offset : Pos = {x:0, y:0}, versions : Map<string, number>= new Map(), reprojections : Map<string, Pos> = new Map()){
        this.name = name
        this.image = image
        this.longLat = longLat
        this.zoom = zoom
        this.offset = offset
        this.versions = versions
        this.reprojections = reprojections
    }
}