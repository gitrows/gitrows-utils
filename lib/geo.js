/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

const simplify = require('simplify-geometry');
const polyline = require('@mapbox/polyline');

const Geo = {
	simplify: (points, tolerance=0.0001) => simplify(points, tolerance),
	pairs: (points) => points.map(p => Array.isArray(p) ? p : Object.values[p]),
	encode: (points) => polyline.encode(Geo.pairs(points)),
	decode: (string) => polyline.decode(string),
	mercator: (point) => {
		return {
			x: (point[1] + 180) * (256 / 360),
			y: (256 / 2) - (256 * Math.log(Math.tan((Math.PI / 4) + ((point[0] * Math.PI / 180) / 2))) / (2 * Math.PI))
		}
	},
	poly2svg : (polyline, height=400, width=400) => {
		let points = Geo.pairs(polyline).map(p=>Geo.mercator(p)),
			svgPath = [],
			minX = 256,
			minY = 256,
			maxX = 0,
			maxY = 0;

		points.forEach((point) => {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
			svgPath.push([point.x, point.y].join(','));
		});
		return `<svg xmlns="http://www.w3.org/2000/svg" height="${height}" width="${width}" preserveAspectRatio="xMinYMin meet" viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}" stroke="currentColor" strokeWidth="0.0001"><g><path d="M${svgPath.join(' ')}"></path></g></svg>`
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
