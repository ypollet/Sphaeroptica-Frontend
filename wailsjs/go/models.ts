export namespace main {
	
	export class virtualCameraImage {
	    name: string;
	    fullImage: string;
	    thumbnail: string;
	    coordinates: photogrammetry.Coordinates;
	
	    static createFrom(source: any = {}) {
	        return new virtualCameraImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.fullImage = source["fullImage"];
	        this.thumbnail = source["thumbnail"];
	        this.coordinates = this.convertValues(source["coordinates"], photogrammetry.Coordinates);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class cameraViewer {
	    images: virtualCameraImage[];
	
	    static createFrom(source: any = {}) {
	        return new cameraViewer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.images = this.convertValues(source["images"], virtualCameraImage);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace photogrammetry {
	
	export class Coordinates {
	    longitude: number;
	    latitude: number;
	
	    static createFrom(source: any = {}) {
	        return new Coordinates(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.longitude = source["longitude"];
	        this.latitude = source["latitude"];
	    }
	}
	export class Pos {
	    x: number;
	    y: number;
	
	    static createFrom(source: any = {}) {
	        return new Pos(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.x = source["x"];
	        this.y = source["y"];
	    }
	}

}

