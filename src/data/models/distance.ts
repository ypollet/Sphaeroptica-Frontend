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

import type { Landmark } from "@/data/models/landmark"
import * as math from "mathjs"

export class Distance {
    label : string
    landmarkLeft : Landmark
    landmarkRight : Landmark
    edit_label: boolean
    edit_distance: boolean
    
    constructor(label: string, left: Landmark, right : Landmark){
        this.label = label
        this.landmarkLeft = left
        this.landmarkRight = right
        this.edit_label = false
        this.edit_distance = false
    }

    get distance() : number | undefined{
        if(this.landmarkLeft.position == undefined || this.landmarkRight.position == undefined){
            return undefined
        }
        return math.number(math.distance(this.landmarkLeft.position, this.landmarkRight.position))
    }

    in(landmark : Landmark | string) : boolean{
        return this.landmarkLeft.equals(landmark) || this.landmarkRight.equals(landmark)
    }

    equals(other : Distance){
        return (this.landmarkLeft.equals(other.landmarkLeft) && this.landmarkRight.equals(other.landmarkRight))
            || (this.landmarkLeft.equals(other.landmarkRight) && this.landmarkRight.equals(other.landmarkLeft))
    }
}