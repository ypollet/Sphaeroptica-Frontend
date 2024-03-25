import Color from "color"
export type Coordinates = {
    x: number,
    y: number
}

export class Landmark {
    id : string;
    label : string;
    poses : Map<string, Coordinates>
    color : Color
    position : number | undefined
    edit : boolean

    constructor(id : string, label : string, color : Color | null = null, poses : Map<string, Coordinates> = new Map(), position : number | undefined = undefined){
        this.id = id
        this.label = label
        this.poses = poses
        this.poses.set("Hello", {x:255, y:255})
        this.edit = false

        if(color == null){
            color = Color.rgb([Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)])
        }
        this.color = color
        this.position = position
    }

    toJSON(){
        return { id : this.id, label: this.label, color: this.color.hex(), position: this.position, poses : Object.fromEntries(this.poses)}
    }
    

    setColorHEX(color : string){
        this.color = Color(color)
    }

    setColorRGB(color : number[]){
        if(color.length < 3){
            return
        }
        this.color = Color.rgb(color[0], color[1], color[2])
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