const simplify = require('simplify-js');
const polyline = require('@mapbox/polyline');

const Geo = {
	simplify: (points, tolerance) => simplify(points, tolerance),
	pairs: (points) => points.map(p => Array.isArray(p) ? p : Object.values[p]),
	encode: (points) => polyline.encode(Geo.pairs(points)),
	decode: (string) => polyline.decode(string),
	mercator: (point) => {
		return {
			x: (point[1] + 180) * (256 / 360),
			y: (256 / 2) - (256 * Math.log(Math.tan((Math.PI / 4) + ((point[0] * Math.PI / 180) / 2))) / (2 * Math.PI))
		}
	},
	poly2svg : (polyline,tolerance=1e-5) => {
		let points = Geo.pairs(polyline).map(p=>Geo.mercator(p)),
			svgPath = [],
			minX = 256,
			minY = 256,
			maxX = 0,
			maxY = 0;

		let simplified = Geo.simplify(points,tolerance);

		simplified.forEach((point) => {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
			svgPath.push([point.x, point.y].join(','));
		});

		return {
			path: 'M' + svgPath.join(' ') + 'z',
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY
		};

	}
}
module.exports = Geo;
