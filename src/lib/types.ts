import Color from "color"
import { useVCImagesStore } from "./stores"
import axios from "axios"
import { type Matrix }  from "mathjs"
import * as math from "mathjs"

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

export class DequeMax2{
    deque : Array<string>

    constructor(){
        this.deque= new Array()
    }

    add(landmark : string){
        if(this.selected(landmark) || landmark == null){
            return;
        }
        if(this.deque.length == 2){
            this.deque.shift()
        }
        this.deque.push(landmark)
    }
    
    remove(landmark: string){
        let index : number = this.deque.indexOf(landmark)
        this.deque.splice(index, 1)
    }

    selected(landmark: string){
        return this.deque.indexOf(landmark) >= 0
    }

    fullSelected(){
        return this.deque.length == 2
    }
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

export class Distance {
    label:string
    landmarkLeft : Landmark
    landmarkRight : Landmark
    
    constructor(label: string, left: Landmark, right : Landmark){
        console.log("Creation Distance : " + left.id + " " + right.id)
        this.label = label
        this.landmarkLeft = left
        this.landmarkRight = right
    }

    get distance(){
        if(this.landmarkLeft.position == undefined || this.landmarkRight.position == undefined){
            return undefined
        }
        return math.distance(this.landmarkLeft.position, this.landmarkRight.position)
    }

    equals(other : Distance){
        console.log("Equals DIstance")
        console.log(this.landmarkLeft.equals(other.landmarkLeft) && this.landmarkRight.equals(other.landmarkRight))
        console.log(this.landmarkLeft.equals(other.landmarkRight) && this.landmarkRight.equals(other.landmarkLeft))
        return (this.landmarkLeft.equals(other.landmarkLeft) && this.landmarkRight.equals(other.landmarkRight))
            || (this.landmarkLeft.equals(other.landmarkRight) && this.landmarkRight.equals(other.landmarkLeft))
    }
}

export class Landmark {
    id: string
    version: number
    label: string
    poses: Map<string, Coordinates>
    color: Color
    position: Matrix | undefined
    edit: boolean

    constructor(id: string, label: string, version : number = 1,color: Color | null = null, poses: Map<string, Coordinates> = new Map(), position: Matrix | undefined = undefined) {
        this.id = id
        this.version = version
        this.label = label
        this.poses = poses
        this.edit = false

        if (color == null) {
            color = Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
        }
        this.color = color
        this.position = position
    }

    equals(other : Landmark | string | null){
        if(other == null){
            return false
        }
        if(typeof other === "string"){
            return this.id == other
        }
        return this.id == other.id
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
    resetPoses(){
        this.position = undefined
        this.poses = new Map()
        this.version++
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
        console.log("triangulatePos for ", this.label, " : ", this.checkTriangulation())
        if(!this.checkTriangulation()){
            //not enough poses for triangulation, set position to undefined
            this.position = undefined
            this.version++
            return
        }
        console.log('Triangulate : ', this.label)
        console.log(this.poses)
        console.log(Object.fromEntries(this.poses))
        const path = 'http://localhost:5000/triangulate';
        axios.post(path, {
          study: objectPath,
          poses: Object.fromEntries(this.poses)
        })
          .then((res) => {
            console.log(res.data)
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