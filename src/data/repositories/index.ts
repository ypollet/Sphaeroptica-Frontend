import type { Matrix } from "mathjs";
import type { VirtualCameraImage } from "@/data/models/virtual_camera_image";
import type { Coordinates } from "@/data/models/coordinates";
import type { Shortcut } from "@/data/models/shortcut";
import type { Landmark } from "../models/landmark";

export interface Repository {
    getImages : (objectPath:string) => Array<Shortcut>;
    getShorcuts : (objectPath:string) => Array<VirtualCameraImage>;
    computeReprojection : (objectPath:string, position: Matrix, image: string) => Promise<void |Coordinates>;
    triangulate: (objectPath : string, landmark: Landmark) => Matrix | undefined
}