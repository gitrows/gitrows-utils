const Data = require('./data.js');
const Num = require('./number.js');
const Split = {
	best: (values, length, order='desc', by='avg') => {
		let i = 0,
			heap = [];
		while (i < (values.length - length)) {
			let segment = values.slice(i, i + length);
			heap.push({
				start: i,
				end: i + length - 1,
				sum: Data.sum(segment),
				avg: Num.round(Data.mean(segment),2)
			});
			i++;
		}
		return Data[order](heap, by);
	},
	//simplified from https://observablehq.com/@yurivish/peak-detection
	peaks: (values, options) => {
		let {
			lookaround,
			sensitivity,
		} = {
			lookaround: 2,
			sensitivity: 1,
			...options
		};
		let scores = Split.normalize(
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
	},
	_coalesce: (candidates, distance) => {
		let groups = candidates.length ? [
			[candidates[0]]
		] : [];
		Split._pairs(candidates).forEach(([a, b]) => {
			if (b - a < distance) {
				groups[groups.length - 1].push(b)
			} else {
				groups.push([b])
			}
		});
		return groups;
	},
	_pairs: (values, accessor) => {
		if (!accessor || typeof accessor !== 'function')
			accessor = (a, b) => [a, b];
		let result=[];
		if (values.length<2) return result;
		for (let i = 0; i < values.length - 1; i++) {
			result.push(accessor(values[i],values[i+1]))
		}
		return result;
	}
}

module.exports = Split;
