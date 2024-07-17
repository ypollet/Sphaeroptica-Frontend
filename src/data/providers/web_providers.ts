import type { Matrix } from "mathjs";
import type { DataProvider } from ".";
import type { Landmark } from "@/data/models/landmark";

import axios, { type AxiosResponse } from "axios";
import type { Coordinates } from "../models/coordinates";

export class WebProvider implements DataProvider {
    server: string;

    constructor(server: string) {
        this.server = server
    }

    async getImages(objectPath: string): Promise<AxiosResponse> {
        const path = this.server + '/images';
        return axios.get(path, {
            params: {
                study: objectPath,
            }
        })
    }

    async getShorcuts(objectPath: string): Promise<AxiosResponse> {
        const path = this.server + "/shortcuts";
        return axios.get(path, {
            params: {
                study: objectPath,
            }
        })
    }

    async computeReprojection(objectPath: string, position: Matrix, image: string): Promise<AxiosResponse> {
        const path = this.server + '/reproject';
        return axios.post(path, {
            study: objectPath,
            position: position,
            image: image
        })

    }

    async triangulate(objectPath: string, poses: Map<string, Coordinates>): Promise<AxiosResponse> {
        const path = this.server + '/triangulate';
        return axios.post(path, {
            study: objectPath,
            poses: Object.fromEntries(poses)
        })
    }

}