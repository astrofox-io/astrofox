/**
 * animatable hollow rect
 */


 //modify this to use ringGeom?
 //use this or canvas anim?

THREE.HollowSquare = function (outerDim, innerDim,material) {

	THREE.Object3D.call( this );
	this.innerDim = innerDim;
	this.outerDim = outerDim;
	this.material = material;


	this.renderGeom = function(){

		var rectShape = new THREE.Shape();

		var od2 = -this.outerDim/2;
		var id2 = -this.innerDim/2;

		rectShape.moveTo( -od2,od2 );
		rectShape.lineTo( od2,od2 );
		rectShape.lineTo( od2,-od2 );
		rectShape.lineTo( -od2,-od2 );
		//rectShape.lineTo( -od2,od2 );	

		var holePath = new THREE.Path();
		holePath.moveTo( -id2,-id2 );
		holePath.lineTo( id2,-id2 );
		holePath.lineTo( id2,id2 );
		holePath.lineTo( -id2,id2 );
		//holePath.lineTo( -id2,-id2 );		
		rectShape.holes.push( holePath );

		var geometry = new THREE.ShapeGeometry( rectShape );
		var points = rectShape.createPointsGeometry();

		var color = 0xFF00FF;
		if (this.mesh != undefined){
			this.remove(this.mesh);	
		}
		this.mesh = new THREE.Mesh( geometry, this.material  );
		//mesh.position.set( 0,0,-300 );
		this.add( this.mesh );

		//console.log("hs: " + this.innerDim);

	}


	this.show = function(show){
		this.mesh.visible = show;
	}

	this.renderGeom();

};

THREE.HollowSquare.prototype = Object.create( THREE.Object3D.prototype );
