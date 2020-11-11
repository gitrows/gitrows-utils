const Data={

	asc:(obj,key)=>obj.sort((a,b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0)),

	desc:(obj,key)=>obj.sort((a,b) => (a[key] < b[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0)),

	limit:(obj,a,b)=>(typeof b=='undefined'||isNaN(b))?obj.slice(0,a):obj.slice(b,a+b),

	where:(obj,filter)=>{
		if (typeof filter=='undefined'||Object.keys(filter).length==0) return obj;
		if(obj.constructor !== Array && typeof filter.id!='undefined'){
			if (!~filter.id.indexOf('not:'))
				return [obj[filter.id]];
			else {
				delete obj[filter.id.split(':').pop()];
				return obj;
			}
		}
		obj=Object.values(obj);
		Object.keys(filter).forEach((key) => {
			if (key.indexOf('$')==0) return;
			let values=filter[key];
			if (!Array.isArray(values)) values=[values];
			values.forEach((item, i) => {
				let value=item.toString();
				if (value.indexOf(':')>-1){
					value=value.split(':');
					switch (value[0].toLowerCase()) {
						case 'gt':
							obj = obj.filter(item=>item[key]!==undefined&&item[key]>value[1]);
							break;
						case 'gte':
							obj = obj.filter(item=>item[key]!==undefined&&item[key]>=value[1]);
							break;
						case 'lt':
							obj = obj.filter(item=>item[key]!==undefined&&item[key]<value[1]);
							break;
						case 'lte':
							obj = obj.filter(item=>item[key]!==undefined&&item[key]<=value[1]);
							break;
						case 'not':
							obj = obj.filter(item=>item[key]!==undefined&&item[key]!=value[1]);
							break;
						case 'eq':
							obj = obj.filter(item=>item[key]!==undefined&&item[key]==value[1]);
							break;
						case 'starts':
						case '^':
							obj = obj.filter(item=>item[key]!==undefined&&typeof item[key]=='string'&&item[key].toLowerCase().startsWith(value[1].toLowerCase()));
							break;
						case 'ends':
						case '$':
							obj = obj.filter(item=>item[key]!==undefined&&typeof item[key]=='string'&&item[key].toLowerCase().endsWith(value[1].toLowerCase()));
							break;
						case 'contains':
						case '*':
							obj = obj.filter(item=>item[key]!==undefined&&typeof item[key]=='string'&&~item[key].toLowerCase().indexOf(value[1].toLowerCase()));
							break;

						default:

					}
				} else
				obj = obj.filter(item=>typeof item[key]!='undefined'&&item[key]==value);
			});
		});
		return obj;
	},

	pluck:(obj,keys)=>{
		let returnAsValues=false;
		if(!Array.isArray(keys)){
			if (keys=='*') return obj;
			keys=[keys];
			returnAsValues=true;
		}
		obj=Object.values(obj);
		let result=[];
		obj.forEach((item, i) => {
			result.push({});
			for (let key in item) {
				if (~keys.indexOf(key)) {
					if (returnAsValues)
						result[i]=item[key];
					else
						result[i][key]=item[key];
				}
			}
		});
		return result;
	},

	aggregate:(obj,aggregates)=>{
		let data={},length=0,sum=0;
		for (let key in aggregates) {
			let items=aggregates[key]=='*'?'*':aggregates[key].split(',').map(s=>s.trim());
			switch (key) {
				case '$select':
					data=Data.pluck(Array.isArray(data)?data:obj,items);
					break;
				case '$count':
					if (Array.isArray(items))
						items.forEach((item, i) => {
							data['count('+item+')']=Data.pluck(obj,item).filter(e=>e.toString().length).length;
						});
					else data['count('+items+')']=obj.filter(e=>e).length;
					break;
				case '$sum':
					if (Array.isArray(items))
						items.forEach((item, i) => {
							let column=Data.pluck(obj,item);
							sum=column.reduce((prev, curr) => !isNaN(curr)?prev+(+curr):NaN,0);
							data['sum('+item+')']=isNaN(sum)?null:sum;
						});
					else return;
					break;
				case '$avg':
					if (Array.isArray(items))
						items.forEach((item, i) => {
							let column=Data.pluck(obj,item);
							length=column.filter(e=>e.toString().length).length;
							sum=column.reduce((prev, curr) => !isNaN(curr)?prev+(+curr):0,0);
							data['avg('+item+')']=sum!=0?sum/length:null;
						});
					else return;
					break
				case '$min':
					if (Array.isArray(items))
						items.forEach((item, i) => {
							let column=Data.pluck(obj,item);
							let min=Math.min( ...column);
							data['min('+item+')']=isNaN(min)?null:min;
						});
					else return;
					break;
				case '$max':
					if (Array.isArray(items))
						items.forEach((item, i) => {
							let column=Data.pluck(obj,item);
							let max=Math.max( ...column);
							data['max('+item+')']=isNaN(max)?null:max;
						});
					else return;
					break;
				case '$order':
					data=Array.isArray(data)?data:obj;
					if (Array.isArray(items))
						items.forEach((item, i) => {
							let values=item.split(':');
							if (!values.length==2) return;
							if (values[1]=='asc') data=Data.asc(data,values[0]);
							if (values[1]=='desc') data=Data.desc(data,values[0]);
						});
					else return;
					break;
				default:
					data=obj;
			}
		}
		if (aggregates['$limit']){
			values=aggregates['$limit'].toString().split(',');
			data=Data.limit(data,+values[0],+values[1]);

		}
		return data;
	},

	columns:(obj)=>{
		let columns=new Set();
		if (!Array.isArray(obj))
			Object.keys(obj).forEach(item =>columns.add(item));
		else
			obj.forEach(row => Object.keys(row).forEach(item =>columns.add(item)));
		return Array.from(columns);
	},

	typeOf:(value)=>{
		let primitive=typeof value,format=null;
		switch (primitive) {
			case 'number':
				if (Number.isFinite(value)){
					if (Number.isInteger(value)) {
						primitive='integer';
						format='int32';
					} else {
						format='float';
					}
				} else if (Number.isNaN(value))
					primitive='NaN';
				break;
			case 'object':
				if (Array.isArray(value)) primitive='array';
				break;
			case 'bigint':
				primitive='integer';
				format='int64';
				break;
			case 'string':
				//Test for base64 encoding
				if (value.slice(-1)=='=' && /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(value))
					format='byte'
				//Test for rfc 3339 full-date
				if (/^[0-9]+-(?:0[1-9]|1[012])-(?:0[1-9]|[12][0-9]|3[01])$/gm.test(value))
					format='date';
				//Test for rfc 3339 date-time
				if (/^[0-9]+-(?:0[1-9]|1[012])-(?:0[1-9]|[12][0-9]|3[01])[Tt](?:[01][0-9]|2[0-3]):(?:[0-5][0-9]):(?:[0-5][0-9]|60)(?:\.[0-9]+)?(?:[Zz]|[\+|\-](?:[01][0-9]|2[0-3]):[0-5][0-9])$/gm.test(value))
					format='date-time';
				//Test for url, @see https://gist.github.com/dperini/729294
				if (/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value))
					format='url';
				break;
			default:
		}
		let result={'type':primitive};
		if (format) result.format=format;
		return result;
	},

	types:(obj)=>{
		let result={};
		const order=['number','string'];// higher index takes precedence
		const precedence=(item,type) => typeof result[item]!='undefined'&&order.indexOf(type)<order.indexOf(result[item]) ? result[item] : type;
		if (Data.typeOf(obj).type=='object'&&Object.keys(obj))
			Object.keys(obj).forEach(item => result[item]=Data.typeOf(obj[item]));
		else
			obj.forEach(row => Object.keys(row).forEach(item => result[item]=precedence(item,Data.typeOf(row[item]))));
		return result;
	},

	columnsApply:(obj,columns,defaultValue=null)=>{
		if (!Array.isArray(obj)){
			columns.forEach(item => obj[item]=obj[item]||defaultValue);
			Object.keys(obj).forEach((key) => {if(!~columns.indexOf(key)) delete obj[key];});
		}
		else
			obj.forEach((row,index) => obj[index]=Data.columnsApply(row,columns));
		return obj;
	},

	valuesApply:(obj,values,query)=>{
		if (!Array.isArray(obj)){
			obj=Object.assign(obj, values)
		}
		else
			obj.forEach((row,index) => obj[index]=Data.where([row],query).length?Data.valuesApply(row,values):row);
		return obj;
	},

	removeEmpty:(obj)=>{
	  Object.keys(obj).forEach(k =>
	    (obj[k] && typeof obj[k] === 'object') && removeEmpty(obj[k]) ||
	    (!obj[k] && obj[k] !== undefined) && delete obj[k]
	  );
	  return obj;
	},

sum : arr => arr.reduce((a, b) => a + b, 0),

mean : arr => Data.sum(arr) / arr.length,

std : (arr) => {
    const mu = Data.mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(Data.sum(diffArr) / (arr.length - 1));
},

quantile : (arr, q) => {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
},

// https://observablehq.com/@d3/moving-average
sma : (arr, range) => {
  let i = 0;
  let sum = 0;
  const means = new Float64Array(arr.length).fill(NaN);
  for (let n = Math.min(range - 1, arr.length); i < n; ++i) {
    sum += arr[i];
  }
  for (let n = arr.length; i < n; ++i) {
    sum += arr[i];
    means[i] = sum / range;
    sum -= arr[i - range + 1];
  }
  return means;
},

// https://stackoverflow.com/questions/40057020/calculating-exponential-moving-average-ema-using-javascript
// added fill w/ previous value for NaN or null to reflect missing values (!=0)
ema : (arr,range) => arr.reduce((p,n,i) => i ? ((n==null||n==NaN)?p.concat(p[p.length-1]):p.concat(2*n/(range+1) + p[p.length-1]*(range-1)/(range+1))): p, [arr[0]]),


}
module.exports=Data;
