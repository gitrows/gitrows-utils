const Data = require('./data.js');
const Split = {
	fastest: (values,length) => {
		let i=0,heap=[];
		while (i<(values.length-length)) {
			let segment=values.slice(i,i+length);
			let speed=Data.sum(segment);
			heap.push({})
		}
	},
	//simplified from https://observablehq.com/@yurivish/peak-detection
	peaks: (values, options) => {
		let {
			lookaround,
			sensitivity,
		} = { lookaround: 2, sensitivity: 1.4, ...options};
		let scores=Split.normalize(
		values.map(
			(value, index) => Split._peakiness(
				values.slice(Math.max(0, index - lookaround), index),
				value,
				values.slice(index + 1, index + lookaround + 1)
			)
		)
	);
	let candidates = [...values.keys()].filter(index => scores[index] > sensitivity);
	return candidates;
	},
	normalize: (values) => {
		let mean = Data.mean(values);
		let std = Data.std(values);
		return values.map(x => (x - mean) / std)
	},
	_peakiness: (left, value, right) => {
		return value - Data.max([Data.min(left) || 0, Data.min(right) || 0])
	}
};

module.exports = Split;
