// Sphaeroptica - 3D Viewer on calibrated images - Frontend

// Copyright (C) 2024 Yann Pollet, Royal Belgian Institute of Natural Sciences

//

// This program is free software: you can redistribute it and/or

// modify it under the terms of the GNU General Public License as

// published by the Free Software Foundation, either version 3 of the

// License, or (at your option) any later version.

// 

// This program is distributed in the hope that it will be useful, but

// WITHOUT ANY WARRANTY; without even the implied warranty of

// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU

// General Public License for more details.

//

// You should have received a copy of the GNU General Public License

// along with this program. If not, see <http://www.gnu.org/licenses/>.

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