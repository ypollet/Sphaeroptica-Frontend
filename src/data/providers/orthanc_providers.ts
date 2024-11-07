import type { DataProvider } from "./providers";

import axios, { type AxiosResponse } from "axios";
import type { Coordinates } from "../models/coordinates";

export class OrthancProvider implements DataProvider {
    server: string;

    constructor(server: string) {
        this.server = server
    }

    async getImages(objectPath: string): Promise<AxiosResponse> {
        const path = this.server + "/sphaeroptica/" + objectPath +'/images';
        return axios.get(path)
    }

    getImage(objectPath: string, imageName : string): string {
        const path = this.server + "/sphaeroptica/" + imageName + "/full-image"
        return path
    }

    async getShorcuts(objectPath: string): Promise<AxiosResponse> {
        const path = this.server + "/sphaeroptica/" + objectPath + "/shortcuts";
        return axios.get(path)
    }

    async computeReprojection(objectPath: string, position: Array<number>, imageName: string): Promise<AxiosResponse> {
        const path = this.server + "/sphaeroptica/" + imageName + '/reproject?x=' + position[0] 
            + "&y=" + position[1] + "&z=" + position[2] + "&w=" + position[3];
        return axios.get(path)

    }

    async triangulate(objectPath: string, poses: Map<string, Coordinates>): Promise<AxiosResponse> {
        const path = this.server + "/sphaeroptica/" + '/triangulate';
        return axios.post(path, {
            poses: Object.fromEntries(poses)
        })
    }

}