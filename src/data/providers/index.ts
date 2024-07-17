export interface DataProvider{
        getImages : (objectPath:string) => Array<Shortcut>;
        getShorcuts : (objectPath:string) => Array<VirtualCameraImage>;
        computeReprojection : (objectPath:string, position: Matrix, image: string) => Promise<void |Coordinates>;
        triangulate: (objectPath : string, landmark: Landmark) => Matrix | undefined
}