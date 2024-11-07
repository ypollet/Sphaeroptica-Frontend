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

import type { DataProvider } from "./providers";
import { WebProvider } from "./web_providers";
import { OrthancProvider } from "./orthanc_providers";
import { providerSettings } from "@/config/appSettings"

export class ProviderFactory{
    private static _instances = new Map<string, DataProvider>()

    static get(type : string) : DataProvider{
        if(this._instances.get(type) == null){
            if(type == "WEB"){
                return new WebProvider(providerSettings.url)
            }
            if(type == "ORTHANC"){
                return new OrthancProvider(providerSettings.url)
            }
        }
        return this._instances.get(type)!
    }
}