export namespace main {
	
	export class cameraViewer {
	
	
	    static createFrom(source: any = {}) {
	        return new cameraViewer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

