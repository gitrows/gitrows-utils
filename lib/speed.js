const Speed={
	format:(v,f)=>{
		f=f.toLowerCase().replace(/[^a-z]/g, '');
		switch (f) {
			case 'kmh':
				return Speed.k(Speed.h(v));
			case 'mph':
				return Speed.m(Speed.h(v));
			case 'minkm':
				return Speed._min(1000/v);
			default:
				return v;
		}
	},
	h:t=>t*3600,
	_h:t=>t/3600,
	min:t=>t*60,
	_min:t=>Math.floor(t/60)+':'+Math.round(t%60),
	k:d=>d/1000,
	_k:d=>d*1000,
	m:d=>d/1609.344,
	_m:d=>d/1609.344
}
module.exports=Speed;
