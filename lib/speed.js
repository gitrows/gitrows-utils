const Num = require('./number.js');
const Speed={
	format:(v,f)=>{
		f=Speed.parseUnit(f);
		v=Speed.parseValue(v);
		if (isNaN(v)) return NaN;
		if (v<=0) return 0;
		switch (f) {
			case 'kmh':
				return Speed.round(Speed.km(Speed.h(v)),Speed.precision);
			case 'mph':
				return Speed.round(Speed.mi(Speed.h(v)),Speed.precision);
			case 'minkm':
				return Speed._hms(Speed._km(1)/v,[1,0]);
			case 'minmi':
				return Speed._hms(Speed._mi(1)/v,[1,0]);
			default:
				return v;
		}
	},
	parse:s=>{
		let u=Speed.parseUnit(s);
		let v=Speed.parseValue(s);
		switch (u) {
			case 'kmh':
					return Speed._km(Speed._h(v));
			case 'mph':
					return Speed._mi(Speed._h(v));
			case 'minkm':
					return Speed._km(1)/v;
			case 'minmi':
					return Speed._mi(1)/v;
			default:
				return v;
		}
	},
	finish:(d,t)=>{
		let u=Speed.parseUnit(d);
		let v=Speed.parseValue(d);
		t=Speed.parseValue(t);
		if (isNaN(t)) return NaN;
		switch (u) {
			case 'km':
				v=Speed._km(v);
				break;
			case 'm':
			case 'mi':
				v=Speed._mi(v);
				break;
			case 'ft':
				v=Speed._ft(v);
				break;
			default:
				return NaN;
		}
		return v/t;
	},
	h:t=>t*3600,
	_h:t=>t/3600,
	min:t=>t*60,
	_min:t=>t/60,
	_hms:(t,d=[2,1,0])=>{
		let res=[],div;
		d.forEach((item) => {
			div=60**item;
			res.push(Math.floor(t/div).toString().padStart(2,0));
			t=Math.floor(t%div);
		});
		return res.join(':');
	},
	km:d=>d/1000,
	_km:d=>d*1000,
	mi:d=>d/1609.344,
	_mi:d=>d*1609.344,
	ft:d=>d*3.28084,
	_ft:d=>d/3.28084,
	m:d=>d,
	_m:d=>d,
	parseUnit:s=>s.toLowerCase().replace(/[^a-z]/g, ''),
	parseNumber:s=>!isNaN(s)?parseFloat(s):(typeof s === 'string'?s.toLowerCase().replace(/[^0-9,.:]/g, ''):NaN),
	parseValue:v=>{
		v=Speed.parseNumber(v);
		if (isNaN(v)){
			if (typeof v === 'string'){
				if (v.includes(',')){
					v=parseFloat(v.replace(',','.'));
					if (isNaN(v)) return NaN;
				} else if (v.includes(':')){
					let sub=v.split(':').reverse();
					v=sub.reduce((a,c,i)=>a+((i>0)?parseInt(c)*(60**i):parseInt(c)),0);
				} else return NaN;
			} else return NaN;
		}
		return parseFloat(v);
	},
	round:(n,p)=>isNaN(n)?n:Math.round(n*(10**p))/10**p,
	riegel:(t1,d1,d2)=>Speed.round(Math.pow(d2/d1,1.06)*t1,1),
	powerFactor:(grade)=>{
		/**
				@see Minetti, A. E. et al. (2002). Energy cost of walking and running at extreme uphill and downhill slopes.
				 Journal of Applied Physiology 93, 1039-1046, http://jap.physiology.org/content/93/3/1039.full
		**/
		var energyCost=(155.4*Math.pow(grade,5))-(30.4*Math.pow(grade,4))-(43.3*Math.pow(grade,3))+(46.3*Math.pow(grade,2))+(19.5*grade)+3.6;
		var powerFactor=energyCost/3.6;
		return powerFactor;
	},
	roundTimestamp: (t,i=1) => Math.floor(t/(60*i))*60*i,
	encodeTimestamp: (t,b=946684800) => Num.baseEncode(Math.floor((t-b)/60)), /* b = 01 Jan 2000 */
	trimp:(d,hr,hrMax,hrRest,s)=>{
		const hrr=(hr-hrRest)/(hrMax-hrRest);
		const f = s==='m'?1.92:1.67;
		const e = hrr*f;
		return Speed.round(d*hrr*(0.64*Math.exp(e)),1);
	},
	precision:5,
}
module.exports=Speed;
