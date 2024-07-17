import type { Matrix } from "mathjs";
import type { VirtualCameraImage } from "@/data/models/virtual_camera_image";
import type { Coordinates } from "@/data/models/coordinates";
import type { Shortcut } from "@/data/models/shortcut";

export interface Repository {
    getImages : (objectPath:string) => Promise<Array<VirtualCameraImage>>;
    getShorcuts : (objectPath:string) => Promise<Array<Shortcut>>;
    computeReprojection : (objectPath:string, position: Matrix, image: string) => Promise<Coordinates>;
    triangulate: (objectPath : string, poses: Map<string, Coordinates>) => Promise<Matrix | undefined>
}