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
}

module.exports=Num;
