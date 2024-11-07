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

import type { Repository } from "./repository";
import { DataRepository } from "./data_repository";
import { ProviderFactory } from "../providers/provider_factory";
import { providerSettings } from "@/config/appSettings"

export class RepositoryFactory{
    private static _instances = new Map<string, Repository>()

    static get(type : string) : Repository{
        if(this._instances.get(type) == null){
            if(type == "DATA"){
                return new DataRepository(ProviderFactory.get(providerSettings.type))
            }
        }
        return this._instances.get(type)!
    }
}