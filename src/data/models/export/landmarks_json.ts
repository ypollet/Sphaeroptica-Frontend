export type ExportJSON  = {
    scaleFactor: number,
    landmarks: { [k: string]: LandmarkJSON; },
    distances: Array<DistanceJSON>,
}

export type LandmarkJSON = {
    label: string,
    color: string,
    position: Array<number> | undefined,
    poses: { [k: string]: PoseJSON; },
}

export type PoseJSON = {
    x: number,
    y: number,
}

export type DistanceJSON = {
    label: string,
    left: string,
    right: string 
}