import type { Matrix } from "mathjs";
import type { Repository } from ".";
import type { Coordinates } from "../models/coordinates";
import type { Landmark } from "../models/landmark";
import type { Shortcut } from "../models/shortcut";
import type { VirtualCameraImage } from "../models/virtual_camera_image";

import axios from "axios";

export class WebRepository implements Repository {
    server: string;

    constructor(server: string) {
        this.server = server
    }

    getImages(objectPath: string): Array<Shortcut> {
        const path = this.server + '/images';
        axios.get(path, {
            params: {
                study: objectPath,
            }
        }).then((res) => {
            let images = res.data.result.images as VirtualCameraImage[]
            return images

        }).catch((error) => {
            console.error(error);
        });
        return []
    }

    getShorcuts(objectPath: string): Array<VirtualCameraImage> {
        const path = this.server + "/shortcuts";
        axios.get(path, {
            params: {
                study: objectPath,
            }
        }).then((res) => {
            let shortcuts = res.data.result.commands as Shortcut[];
            return shortcuts
        }).catch((error) => {
            console.error(error);
        });
        return []
    }

    computeReprojection(objectPath: string, position: Matrix, image: string): Promise<void | Coordinates> {
        const path = this.server+'/reproject';
        return axios.post(path, {
            study: objectPath,
            position: position,
            image: image
        }).then((res) => {
                let pose: Coordinates = res.data.result.pose
                return pose
            }).catch((error) => {
                console.error(error);
            });
        
    }

    triangulate(objectPath: string, landmark: Landmark): Matrix | undefined {
        console.log("triangulatePos for ", landmark.label, " : ", landmark.checkTriangulation())
        if (!landmark.checkTriangulation()) {
            //not enough poses for triangulation, set position to undefined
            landmark.setPosition(undefined)
            return
        }
        const path = this.server + '/triangulate';
        axios.post(path, {
            study: objectPath,
            poses: Object.fromEntries(landmark.poses)
        }).then((res) => {
            let position = res.data.result.position
            landmark.setPosition(position)
        }).catch((error) => {
            console.error(error);
        });
    }

}