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

import type { ProjectData } from "@/data/models/virtual_camera_image";
import type { Shortcut } from "@/data/models/shortcut";
import type { Pos } from "../models/pos";
import type { ImportFile } from "../models/imports";
import type { Side } from "node_modules/radix-vue/dist/Popper";
import type { LandmarkCSV } from "../models/export/landmarks_csv";
import type { ExportJSON } from "../models/export/landmarks_json";

export interface Repository {
    getImages : (objectPath:string) => Promise<ProjectData>;
    getShorcuts : (objectPath:string) => Promise<Array<Shortcut>>;
    computeReprojection : (objectPath:string, position: Array<number>, imageName: string) => Promise<Pos>;
    triangulate: (objectPath : string, poses: Map<string, Pos>) => Promise<Array<number> | undefined>
    importNewFile: () => Promise<string>
    getImportMethods: () => Promise<Map<string, Array<ImportFile>>>
    getImportFile: (software : string, index : number) => Promise<string>
    importProject: (software : string, files : Map<string, string>) => Promise<string>
    landmarkCSV: (landmarks : Array<LandmarkCSV>) => void
    landmarksJSON: (landmarks : ExportJSON) => void
}