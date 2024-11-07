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

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as math from 'mathjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function degreesToRad(deg: number) {
  return (deg * math.pi) / 180.0;
}

export function radToDegrees(rad: number) {
  return (rad * 180.0) / math.pi;
}

export enum Scale {
    m = 1,
    dm = 0.1,
    cm = 0.01,
    mm = 0.001,
    µm = 0.000001,
    nm = 0.000000001,
}


export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 4
export const DOT_RADIUS = 4
export const SPACE_TARGET = 0.2

