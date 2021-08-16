/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

const simplify = require('simplify-geometry');
const polyline = require('@mapbox/polyline');
const Geohash = require('./external/geohash.js');

const Geo = {
	simplify: (points, tolerance=0.00005) => simplify(points, tolerance),
	pairs: (points) => points.map(p => Array.isArray(p) ? p : Object.values[p]),
	encode: (points) => polyline.encode(Geo.pairs(points)),
	decode: (string) => polyline.decode(string),
	hash: (lat,lon,precision) => Geohash.encode(lat,lon,precision),
	unhash: (hash) => Geohash.decode(hash),
	mercator: (point) => {
		return {
			x: (point[1] + 180) * (256 / 360),
			y: (256 / 2) - (256 * Math.log(Math.tan((Math.PI / 4) + ((point[0] * Math.PI / 180) / 2))) / (2 * Math.PI))
		}
	},
	poly2svg : (polyline, height=400, width=400, strokeWidth=3, offset=5, className="geo-polyline") => {
		let points = Geo.pairs(polyline).map(p=>Geo.mercator(p)),
			svgPath = [];
		let x = points.map(p=>p.x);
		let y = points.map(p=>p.y);
		let bounds = {
			x:[Math.min(...x),Math.max(...x)],
			y:[Math.min(...y),Math.max(...y)],
		};
		let w = bounds.x[1] - bounds.x[0];
		let h = bounds.y[1] - bounds.y[0];
		let scale = h/w>height/width?(height-(offset*2))/h:(width-(offset*2))/w;

		points.forEach((p,i) => {
			let _x = Math.round((p.x-bounds.x[0])*scale)+offset;
			let _y = Math.round((p.y-bounds.y[0])*scale)+offset;
			let _p = `${_x},${_y}`;
			if (i===0 || _p!==svgPath[svgPath.length-1])
				svgPath.push(_p);
		});
		return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${height} ${width}" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="${strokeWidth}" class="${className}"><g><path d="M${svgPath.join(' ')}"></path></g></svg>`
	},
	geoJSON: (polyline) => {
		let geo = {
			"type": "FeatureCollection",
			"features": [
				{
					"type": "Feature",
					"geometry": {
						"type": "LineString",
						"coordinates": polyline.map(x=>x.reverse())
					},
					properties:{
						"creator":"https://flink"
					}
				},
			]
		}
		return JSON.stringify(geo);
	}
}

module.exports = Geo;
