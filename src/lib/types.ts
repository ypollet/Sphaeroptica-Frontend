import Color from "color"
import { useVCImagesStore } from "./stores"
import axios from "axios"
import { type Matrix }  from "mathjs"

export type Coordinates = {
    x: number,
    y: number
}

export type VirtualCameraImage = {
    name: string,
    format: string,
    longitude: number,
    latitude: number,
    image: string,
}

export class LandmarkImage  {
    name: string
    image: string
    zoom: number
    offset: Coordinates
    versions : Map<string, number>
    reprojections : Map<string, Coordinates>

    constructor(name : string, image : string, zoom: number = 1, offset : Coordinates = {x:0, y:0}, versions : Map<string, number>= new Map(), reprojections : Map<string, Coordinates> = new Map()){
        this.name = name
        this.image = image
        this.zoom = zoom
        this.offset = offset
        this.versions = versions
        this.reprojections = reprojections
    }
}


export type Marker = {
    id : string,
    pos : Coordinates,
    color : Color
}

export class Landmark {
    id: string
    version: number
    label: string
    poses: Map<string, Coordinates>
    color: Color
    position: Matrix | undefined
    edit: boolean

    constructor(id: string, label: string, color: Color | null = null, poses: Map<string, Coordinates> = new Map(), position: Matrix | undefined = undefined) {
        this.id = id
        this.version = 1
        this.label = label
        this.poses = poses
        this.edit = false

        if (color == null) {
            color = Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
        }
        this.color = color
        this.position = position
    }

    toJSON() {
        return { id: this.id, label: this.label, color: this.color.hex(), position: this.position, poses: Object.fromEntries(this.poses) }
    }

    getId() : string {
        return this.id
    }
    getLabel() : string {
        return this.label
    }
    setLabel(label : string){
        this.label = label
    }

    getVersion() : number{
        return this.version
    }
    
    getColorHEX() : string{
        return this.color.hex()
    }
    setColorHEX(color: string) {
        this.color = Color(color)
    }
    setColorRGB(color: number[]) {
        if (color.length < 3) {
            return
        }
        this.color = Color.rgb(color[0], color[1], color[2])
    }

    addPose(image: string, pose: Coordinates) {
        this.poses.set(image, pose)
    }
    removePose(image: string) {
        this.poses.delete(image)
    }
    getPoses() : Map<String, Coordinates>{
        return this.poses
    }

    getPosition(){
        return this.position
    }

    setPosition(position : Matrix){
        this.position = position
    }
    getEdit() : boolean{
        return this.edit
    }
    setEdit(edit : boolean){
        this.edit = edit
    }
    
    triangulatePosition(objectPath : string) {
        if(! this.checkTriangulation()){
            //not enough poses for triangulation, set position to undefined
            this.position = undefined
            return
        }
        const path = 'http://localhost:5000/triangulate';
        axios.post(path, {
          study: objectPath,
          poses: this.poses
        })
          .then((res) => {
            let position = res.data.result.position 
            console.log("Position = " + position)
            this.position = position
            this.version++
          })
          .catch((error) => {
            console.error(error);
          });
      }

    checkTriangulation() {
        return this.poses.size >= 2
    }
}