export type Coordinates = {
    x: number,
    y: number
  }

export class Landmark {
    label : string;
    poses : Map<string, Coordinates>

    constructor(label : string){
        this.label = label
        this.poses = new Map()
    }

    addPose(image : string, pose : Coordinates) {
        this.poses.set(image, pose)
    }

    removePose(image : string){
        this.poses.delete(image)
    }

    checkTriangulation(){
        return this.poses.size >= 2
    }
}