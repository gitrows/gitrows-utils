const Num={
	round: (number, precision)=>{
		const factor = Math.pow(10, precision);
    const tempNumber = number * factor;
    const roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
	},
	isNumber: n => !isNaN(parseFloat(n)) && isFinite(n),
	baseEncode : (n) => {
		n = Number(n);
		if (isNaN(n)) return false;
		const codeset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_+!§$&=#";
		const base = codeset.length;
		if (n == 0) return 'a';
		let encoded = [];
		while (n) {
			encoded.push(codeset[n%base]);
			n = Math.floor(n/base);
		}
		return encoded.reverse().join('');
	},
	rand : (min,max) => Math.random() * (max - min) + min,
	randSeries : (min,max,length) => Array.from({length: length}, ()=>Num.rand(min,max)),
	randIntSeries : (min,max,length) => Num.randSeries(min,max,length).map(x=>Math.floor(x)),
}

module.exports=Num;
